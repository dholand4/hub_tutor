function calcularParticipacao() {
    const totalAlunos = parseInt(document.getElementById("totalAlunos").value);
    const alunosPresentes = parseInt(document.getElementById("alunosPresentes").value);
    const resultado = document.getElementById("resultado");

    if (isNaN(totalAlunos) || isNaN(alunosPresentes) || totalAlunos < 0 || alunosPresentes < 0) {
        resultado.innerHTML = "Por favor, insira valores válidos.";
        return;
    }

    if (alunosPresentes > totalAlunos) {
        resultado.innerHTML = "O número de alunos presentes não pode ser maior que o total de alunos.";
        return;
    }

    const faltantes = totalAlunos - alunosPresentes;
    const percentual = ((alunosPresentes / totalAlunos) * 100).toFixed(2);

    resultado.innerHTML = `
        <strong>Total de alunos:</strong> ${totalAlunos}<br>
        <strong>Participaram:</strong> ${alunosPresentes}<br>
        <strong>Não participaram:</strong> ${faltantes}<br>
        <strong>Percentual de participação:</strong> ${percentual}%
    `;
}
