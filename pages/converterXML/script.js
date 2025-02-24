function generateXML() {
    const inputText = document.getElementById('questions').value;

    // Dividir as questões
    const questionsArray = inputText.split('\n').filter(line => line.trim() !== '');

    let xmlOutput = '<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n';

    let questionCount = 1;
    let questionText = '';
    let options = [];
    let correctAnswer = '';
    let isCapturingQuestion = false;

    for (let i = 0; i < questionsArray.length; i++) {
        const line = questionsArray[i].trim();

        // Verificar se é o início de uma nova questão
        if (line.match(/^\d+[.)]/)) {
            // Se já houver uma questão anterior, gerar XML
            if (questionText !== '') {
                xmlOutput += generateQuestionXML(questionText, options, correctAnswer, questionCount);
                questionCount++;
            }

            // Iniciar uma nova questão
            questionText = line.slice(3).trim(); // Remover "1. " ou "2. ", etc.
            options = [];
            correctAnswer = '';
            isCapturingQuestion = true;
        }
        // Continuar capturando enunciado da questão até encontrar uma alternativa
        else if (isCapturingQuestion && !line.match(/^[a-eA-E][).]/)) {
            questionText += ' ' + line; // Adicionar à questão
        }
        // Verificar se é uma alternativa, aceitando tanto "a)" quanto "A)" ou "a." e "A."
        else if (line.match(/^[a-eA-E][).]/)) {
            isCapturingQuestion = false; // Parar de capturar o enunciado
            const optionLetter = line[0].toLowerCase(); // Converter para minúscula para padronizar
            let optionText = line.slice(2).trim();

            // Verificar se a alternativa está marcada como correta
            if (optionText.includes('{correta}')) {
                correctAnswer = optionLetter;
                optionText = optionText.replace('{correta}', '').trim();
            }

            options.push({ letter: optionLetter, text: escapeXML(optionText) });
        }
    }

    // Adicionar a última questão ao XML
    if (questionText !== '') {
        xmlOutput += generateQuestionXML(questionText, options, correctAnswer, questionCount);
    }

    xmlOutput += '</quiz>';

    // Exibir o código gerado
    document.getElementById('output').textContent = xmlOutput;
}

function generateQuestionXML(questionText, options, correctAnswer, questionCount) {
    let questionXML = `  <question type="multichoice">\n`;
    questionXML += `    <name><text>Q${questionCount}</text></name>\n`;
    questionXML += `    <questiontext format="html">\n      <text>${escapeXML(questionText)}</text>\n    </questiontext>\n`;
    questionXML += `    <shuffleanswers>1</shuffleanswers>\n`; // Habilita o embaralhamento de opções

    for (let i = 0; i < options.length; i++) {
        const fraction = (options[i].letter === correctAnswer) ? '100' : '0';
        questionXML += `    <answer fraction="${fraction}"><text>${options[i].text}</text></answer>\n`;
    }

    questionXML += `  </question>\n`;

    return questionXML;
}

// Função para escapar caracteres especiais no XML
function escapeXML(str) {
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

// Função para copiar o texto gerado
function copyText() {
    const output = document.getElementById('output');
    navigator.clipboard.writeText(output.textContent)
        .then(() => alert('Texto copiado para a área de transferência!'))
        .catch(err => console.error('Erro ao copiar:', err));
}

// Função para baixar o arquivo XML
function downloadXML() {
    const xmlContent = document.getElementById('output').textContent;
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'questoes_moodle.xml';
    link.click();
}
