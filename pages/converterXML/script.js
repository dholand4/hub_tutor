// Abre ou fecha o modal com base no tipo
function toggleModal(modalId, isOpen) {
    const modal = document.getElementById(modalId);
    modal.style.display = isOpen ? 'block' : 'none';
    if (modalId === 'xmlModal') {
        document.body.classList.toggle('modal-open', isOpen);
    }
}

// Fecha o modal se o clique for fora da área do modal
function closeModal(event) {
    if (event.target === document.getElementById('infoModal')) {
        toggleModal('infoModal', false);
    }
}

// Gera o arquivo XML a partir das questões inseridas
function generateXML() {
    const inputText = document.getElementById('questions').value;
    const questionsArray = inputText.split('\n').filter(line => line.trim() !== '');

    let xmlOutput = '<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n';
    let questionCount = 1;
    let questionText = '';
    let options = [];
    let correctAnswer = '';

    questionsArray.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.match(/^\d+[.)]/)) {
            if (questionText) {
                xmlOutput += generateQuestionXML(questionText, options, correctAnswer, questionCount);
                questionCount++;
            }
            questionText = trimmedLine.slice(3).trim();
            options = [];
            correctAnswer = '';
        } else if (trimmedLine.match(/^[a-eA-E][).]/)) {
            const optionLetter = trimmedLine[0].toLowerCase();
            let optionText = trimmedLine.slice(2).trim();
            if (/\{\s*(correto|correta)\s*\}/i.test(optionText)) {
                correctAnswer = optionLetter;
                optionText = optionText.replace(/\{\s*(correto|correta)\s*\}/i, '').trim();
            }
            options.push({ letter: optionLetter, text: escapeXML(optionText) });
        } else {
            questionText += (questionText ? '\n' : '') + trimmedLine;
        }
    });

    if (questionText) {
        xmlOutput += generateQuestionXML(questionText, options, correctAnswer, questionCount);
    }

    xmlOutput += '</quiz>';
    document.getElementById('output').textContent = xmlOutput;
    toggleModal('xmlModal', true);
}

// Gera o XML de uma questão específica
function generateQuestionXML(questionText, options, correctAnswer, questionCount) {
    let questionXML = `  <question type="multichoice">\n`;
    questionXML += `    <name><text>Q${questionCount}</text></name>\n`;
    questionXML += `    <questiontext format="html">\n      <text><![CDATA[${questionText.replace(/\n/g, '<br>')}]]></text>\n    </questiontext>\n`;
    questionXML += `    <shuffleanswers>1</shuffleanswers>\n`;

    options.forEach(option => {
        const fraction = (option.letter === correctAnswer) ? '100' : '0';
        questionXML += `    <answer fraction="${fraction}"><text>${option.text}</text></answer>\n`;
    });

    questionXML += `  </question>\n`;
    return questionXML;
}

// Escapa caracteres especiais no XML
function escapeXML(str) {
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

// Copia o texto gerado para a área de transferência
function copyText() {
    const output = document.getElementById('output');
    navigator.clipboard.writeText(output.textContent)
        .then(() => alert('Texto copiado para a área de transferência!'))
        .catch(err => console.error('Erro ao copiar:', err));
}

// Baixa o arquivo XML gerado
function downloadXML() {
    const xmlContent = document.getElementById('output').textContent;
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'questoes_moodle.xml';
    link.click();
}
