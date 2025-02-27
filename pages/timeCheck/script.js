document.getElementById("form").addEventListener("submit", function (event) {
    event.preventDefault(); // Evita o envio padrão do formulário

    const formData = new FormData(this); // Obtém os dados do formulário

    fetch("https://script.google.com/macros/s/AKfycbx33dOn4GnwYBqZe5swXxpQB-fXblNMtc2FJbCoF5Zeoqw2sTT566H16Eag5og7I9F27g/exec", {
        method: "POST",
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.text();
        })
        .then(result => {
            console.log(result); // Mostra a resposta do script no console
            alert("Dados salvos com sucesso!");
            loadEncontros(); // Atualiza a listagem após adicionar
        })
        .catch(error => {
            console.error("Erro:", error);
            alert("Ocorreu um erro ao salvar os dados: " + error.message);
        });
});

// Função para carregar os encontros da planilha
function loadEncontros() {
    fetch("https://script.google.com/macros/s/AKfycbx33dOn4GnwYBqZe5swXxpQB-fXblNMtc2FJbCoF5Zeoqw2sTT566H16Eag5og7I9F27g/exec")
        .then(response => response.json())
        .then(data => {
            const outputContainer = document.getElementById("output-container");
            outputContainer.innerHTML = ""; // Limpa o container
            data.forEach(encontro => {
                const div = document.createElement("div");
                div.textContent = `Turma: ${encontro.turma}, Professor: ${encontro.professor}, Tutor: ${encontro.tutor}, Disciplina: ${encontro.disciplina}, Data: ${encontro.data}, Hora: ${encontro.hora}, Link: ${encontro.link}`;
                outputContainer.appendChild(div);
            });
        })
        .catch(error => console.error("Erro ao carregar os encontros:", error));
}

// Carrega os encontros ao iniciar a página
window.onload = loadEncontros;
