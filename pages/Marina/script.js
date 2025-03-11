function formatarDados() {
    const inputData = document.getElementById('inputData').value;

    // Quebra a entrada em linhas
    const linhas = inputData.split('\n').map(l => l.trim()).filter(l => l !== ''); // Remove linhas vazias

    // Cria um array para armazenar os contatos formatados
    let contatos = [];

    // Itera sobre as linhas para pegar os nomes completos e números
    for (let i = 0; i < linhas.length; i++) {
        // Quebra a linha em nome completo e número
        const partes = linhas[i].split(/\s+/); // Dividir usando espaço(s) para suportar múltiplos espaços

        // Se houver um nome completo e número válidos
        if (partes.length > 1) {
            const nomeCompleto = partes.slice(0, -1).join(' '); // Pega todo o nome (exceto o último item, que é o número)
            const numero = partes[partes.length - 1]; // O último item é o número

            // Pega apenas o primeiro e segundo nome
            const nomes = nomeCompleto.split(' ').slice(0, 2).join(' '); // Pega os dois primeiros nomes

            // Formata o nome (primeiro nome e sobrenome com a primeira letra maiúscula)
            const nomeFormatado = nomes.split(' ').map(function (item) {
                return item.charAt(0).toUpperCase() + item.slice(1).toLowerCase(); // Formata cada palavra
            }).join(' ');

            // Adiciona o contato no formato "nome completo: número"
            contatos.push(`${nomeFormatado}: ${numero}`);
        }
    }

    // Exibe todos os contatos formatados com um por linha
    if (contatos.length > 0) {
        document.getElementById('output').textContent = contatos.join(', ') + ','; // Adiciona vírgula no final
    } else {
        document.getElementById('output').textContent = 'Por favor, insira os dados corretamente.';
    }
}
