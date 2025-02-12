function generateXML() {
    const inputText = document.getElementById('questions').value;

    // Dividir as questões
    const questionsArray = inputText.split('\n').filter(line => line.trim() !== '');

    let xmlOutput = '<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n';

    let questionCount = 1;
    let questionText = '';
    let options = [];
    let correctAnswer = '';

    for (let i = 0; i < questionsArray.length; i++) {
        const line = questionsArray[i].trim();

        // Verificar se é uma nova questão
        if (line.match(/^\d+\./)) {
            // Se já houver uma questão anterior, gerar XML
            if (questionText !== '') {
                xmlOutput += generateQuestionXML(questionText, options, correctAnswer, questionCount);
                questionCount++;
            }

            // Definir nova questão
            questionText = line.slice(3).trim(); // Remover "1. " ou "2. ", etc.
            options = [];
            correctAnswer = '';
        }
        // Verificar se é uma alternativa, considerando a alternativa tanto com "." quanto com ")"
        else if (line.match(/^[a-e]\)|^[a-e]\./)) {
            const optionLetter = line[0];
            let optionText = line.slice(2).trim();

            // Verificar se a alternativa está marcada como correta
            if (optionText.includes('{correta}')) {
                correctAnswer = optionLetter;
                optionText = optionText.replace('{correta}', '').trim();
            }

            options.push({ letter: optionLetter, text: optionText });
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
    questionXML += `    <questiontext format="html">\n      <text>${questionText}</text>\n    </questiontext>\n`;
    questionXML += `    <shuffleanswers>1</shuffleanswers>\n`; // Habilita o embaralhamento de opções

    for (let i = 0; i < options.length; i++) {
        const fraction = (options[i].letter === correctAnswer) ? '100' : '0';
        questionXML += `    <answer fraction="${fraction}"><text>${options[i].text}</text></answer>\n`;
    }

    questionXML += `  </question>\n`;

    return questionXML;
}

// Função para copiar o texto gerado
function copyText() {
    const output = document.getElementById('output');
    const range = document.createRange();
    range.selectNode(output);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    alert('Texto copiado para a área de transferência!');
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
