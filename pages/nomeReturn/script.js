function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function extractValidPhone(fields) {
    const phoneRegex = /\(?\d{2}\)?\s?\d{4,5}-?\d{4}/;
    return fields.find((field, index) => phoneRegex.test(field) && index !== 0); // Ignora a matrícula
}

function processData() {
    const input = document.getElementById('inputData').value;
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = ''; // Limpa o resultado anterior

    if (!input.trim()) {
        alert('Por favor, insira os dados.');
        return;
    }

    const lines = input.trim().split('\n');
    const results = [];

    lines.forEach(line => {
        const fields = line.split('\t').filter(field => field.trim() && !['NÃO', '0', 'remove_red_eye', 'account_circle', 'visibility_off'].includes(field.trim()));

        if (fields.length < 2) return; // Garante que há pelo menos nome e telefone

        const fullName = fields[1];
        const phone = extractValidPhone(fields);

        if (fullName && phone) {
            const firstName = fullName.split(' ')[0];
            const formattedName = capitalizeFirstLetter(firstName);
            results.push(`${formattedName}: ${phone}`);
        }
    });

    outputDiv.innerText = results.length > 0 ? results.join(', ') : 'Nenhum dado válido encontrado.';
}
