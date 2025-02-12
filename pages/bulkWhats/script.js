const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');

const matriculasValidas = require('./matriculas.json').validas;

const app = express();
const PORT = process.env.PORT || 3000; // Porta dinâmica para Railway

app.use(cors({ origin: '*' })); // ⚠️ Em produção, restrinja os domínios permitidos
app.use(express.json());

const clients = new Map();
const qrCodes = new Map();
const authenticatedUsers = new Set();

const COUNTRY_CODE = '55';
const WHATSAPP_SUFFIX = '@c.us';

app.get('/', (req, res) => {
    res.send('API está funcionando!');
});

// 🔹 Função para formatar números corretamente
function formatPhoneNumber(number) {
    number = number.replace(/[^\d]/g, '');
    if (!/^\d+$/.test(number)) {
        throw new Error('Número inválido. Use apenas dígitos.');
    }
    if (!number.startsWith(COUNTRY_CODE)) {
        number = `${COUNTRY_CODE}${number}`;
    }
    return number.replace(/^55(\d{2})9(\d{8})$/, '55$1$2');
}

// 🔹 Remove pastas temporárias de autenticação (precisa de solução persistente para Railway)
async function deleteFolderSafely(folderPath) {
    try {
        if (fs.existsSync(folderPath)) {
            await fs.promises.rm(folderPath, { recursive: true, force: true });
            console.log(`Pasta de autenticação removida: ${folderPath}`);
        }
    } catch (error) {
        console.error(`Erro ao excluir pasta ${folderPath}:`, error);
    }
}

// 🔹 Lida com desconexão de clientes
async function handleDisconnection(matricula, client, dataPath) {
    console.log(`Cliente desconectado para matrícula ${matricula}`);
    clients.delete(matricula);
    authenticatedUsers.delete(matricula);

    try {
        await client.destroy();
    } catch (error) {
        console.error(`Erro ao destruir cliente ${matricula}:`, error);
    }

    await deleteFolderSafely(dataPath);
    setTimeout(() => initializeClient(matricula), 10000);
}

// 🔹 Inicializa clientes do WhatsApp com parâmetro --no-sandbox para evitar erro no Railway
function initializeClient(matricula) {
    if (clients.has(matricula)) {
        console.log(`Cliente para matrícula ${matricula} já está em processo de autenticação.`);
        return;
    }

    console.log(`Inicializando cliente para matrícula: ${matricula}`);
    const dataPath = path.resolve(__dirname, `./whatsapp_auth_data/${matricula}`);
    fs.mkdirSync(dataPath, { recursive: true });

    const client = new Client({
        authStrategy: new LocalAuth({ clientId: matricula, dataPath: dataPath }),
        puppeteer: {
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    clients.set(matricula, client);

    client.on('qr', (qr) => {
        qrcode.toDataURL(qr, (err, url) => {
            if (err) {
                console.error('Erro ao gerar QR Code:', err);
                return;
            }
            qrCodes.set(matricula, url);
        });
    });

    client.on('ready', () => {
        authenticatedUsers.add(matricula);
        qrCodes.delete(matricula);
        console.log(`Cliente do WhatsApp para matrícula ${matricula} está pronto!`);
    });

    client.on('auth_failure', () => {
        console.error(`Falha de autenticação para matrícula ${matricula}`);
        clients.delete(matricula);
        authenticatedUsers.delete(matricula);
    });

    client.on('disconnected', (reason) => {
        console.log(`Cliente desconectado (${reason}) para matrícula ${matricula}`);
        handleDisconnection(matricula, client, dataPath);
    });

    client.initialize();
}

// 🔹 Rota de autenticação
app.post('/authenticate', (req, res) => {
    try {
        const { matricula } = req.body;
        console.log(`Recebendo autenticação para matrícula: ${matricula}`);

        if (!matricula || !matriculasValidas.includes(matricula)) {
            return res.status(400).send('Matrícula inválida');
        }

        initializeClient(matricula);
        res.status(200).send('Cliente inicializado. Aguarde o QR Code.');
    } catch (error) {
        console.error('Erro na autenticação:', error);
        res.status(500).send('Erro interno.');
    }
});

// 🔹 Obtém QR Code
app.get('/get-qr/:matricula', (req, res) => {
    try {
        const { matricula } = req.params;

        if (authenticatedUsers.has(matricula)) {
            return res.status(200).json({ message: 'Já autenticado' });
        }
        if (qrCodes.has(matricula)) {
            return res.status(200).json({ qrCode: qrCodes.get(matricula) });
        }
        res.status(404).send('QR Code não disponível');
    } catch (error) {
        console.error('Erro ao obter QR Code:', error);
        res.status(500).send('Erro interno.');
    }
});

// 🔹 Envia mensagens pelo WhatsApp
app.post('/send-message', async (req, res) => {
    try {
        const { matricula, recipients, messageTemplate } = req.body;

        if (!clients.has(matricula)) {
            return res.status(400).send('Cliente não autenticado ou não inicializado');
        }

        const client = clients.get(matricula);

        for (let recipient of recipients) {
            const formattedNumber = formatPhoneNumber(recipient.number);
            const chatId = `${formattedNumber}${WHATSAPP_SUFFIX}`;
            const personalizedMessage = messageTemplate.replace('{name}', recipient.name);
            await client.sendMessage(chatId, personalizedMessage);
            console.log(`Mensagem enviada para ${recipient.name} (${formattedNumber})`);
        }

        res.status(200).send('Envio concluído');
    } catch (error) {
        console.error('Erro ao enviar mensagens:', error);
        res.status(500).send('Erro ao enviar mensagem.');
    }
});

// 🔹 Inicializa servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
