function generateXML() {
    const inputText = document.getElementById('questions').value;
    const questionsArray = inputText.split('\n').filter(line => line.trim() !== '');

    let xmlOutput = '<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n';
    let questionCount = 1;
    let questionText = '';
    let options = [];
    let correctAnswer = '';
    let isCapturingQuestion = false;

    for (let i = 0; i < questionsArray.length; i++) {
        const line = questionsArray[i].trim();

        if (line.match(/^\d+[.)]/)) {
            if (questionText !== '') {
                xmlOutput += generateQuestionXML(questionText, options, correctAnswer, questionCount);
                questionCount++;
            }

            questionText = line.slice(3).trim();
            options = [];
            correctAnswer = '';
            isCapturingQuestion = true;
        } else if (isCapturingQuestion && !line.match(/^[a-eA-E][).]/)) {
            questionText += (questionText ? '\n' : '') + line;
        } else if (line.match(/^[a-eA-E][).]/)) {
            isCapturingQuestion = false;
            const optionLetter = line[0].toLowerCase();
            let optionText = line.slice(2).trim();

            if (/\{\s*correta\s*\}/i.test(optionText)) {
                correctAnswer = optionLetter;
                optionText = optionText.replace(/\{\s*correta\s*\}/i, '').trim();
            }

            options.push({ letter: optionLetter, text: escapeXML(optionText) });
        }
    }

    if (questionText !== '') {
        xmlOutput += generateQuestionXML(questionText, options, correctAnswer, questionCount);
    }

    xmlOutput += '</quiz>';

    document.getElementById('output').textContent = xmlOutput;
    openModal();
}

function generateQuestionXML(questionText, options, correctAnswer, questionCount) {
    let questionXML = `  <question type="multichoice">\n`;
    questionXML += `    <name><text>Q${questionCount}</text></name>\n`;
    questionXML += `    <questiontext format="html">\n      <text><![CDATA[${questionText.replace(/\n/g, '<br>')}]]></text>\n    </questiontext>\n`;
    questionXML += `    <shuffleanswers>1</shuffleanswers>\n`;

    for (let i = 0; i < options.length; i++) {
        const fraction = (options[i].letter === correctAnswer) ? '100' : '0';
        questionXML += `    <answer fraction="${fraction}"><text>${options[i].text}</text></answer>\n`;
    }

    questionXML += `  </question>\n`;
    return questionXML;
}

function escapeXML(str) {
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function copyText() {
    const output = document.getElementById('output');
    navigator.clipboard.writeText(output.textContent)
        .then(() => alert('Texto copiado para a área de transferência!'))
        .catch(err => console.error('Erro ao copiar:', err));
}

function downloadXML() {
    const xmlContent = document.getElementById('output').textContent;
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'questoes_moodle.xml';
    link.click();
}

function openModal() {
    document.getElementById('xmlModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

function closeModal() {
    document.getElementById('xmlModal').style.display = 'none';
    document.body.classList.remove('modal-open');
}
