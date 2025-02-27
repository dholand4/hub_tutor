document.getElementById("form").addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const professor = formData.get("professor");
    const dataEncontro = formData.get("data");
    const horaEncontro = formData.get("hora");

    // Verifica se já existe um encontro para o professor no mesmo dia e hora
    const rows = document.querySelectorAll("#table-body tr");
    for (let row of rows) {
        const cells = row.getElementsByTagName("td");
        const existingProfessor = cells[0].innerText; // Ajuste aqui se necessário
        const existingData = cells[3].innerText.split('/').reverse().join('-'); // Formata para YYYY-MM-DD
        const existingHora = cells[4].innerText;

        // Verifica se o professor já tem encontro no mesmo dia e hora
        if (existingProfessor === professor && existingData === dataEncontro && existingHora === horaEncontro) {
            alert("Conflito de horário: Esse professor já tem um encontro agendado nessa data e hora!");
            return;
        }
    }

    fetch("https://script.google.com/macros/s/AKfycbzQOkqHyloN1TpWWbylaQ2XZBlNT6omftPxHpBANhZvbxsiz6tg8LvAQbrSVcZXRuWq0w/exec", {
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
            console.log(result);
            alert("Dados salvos com sucesso!");
            loadEncontros();
        })
        .catch(error => {
            console.error("Erro:", error);
            alert("Ocorreu um erro ao salvar os dados: " + error.message);
        });
});

// Função para carregar os encontros da planilha
function loadEncontros() {
    fetch("https://script.google.com/macros/s/AKfycbzQOkqHyloN1TpWWbylaQ2XZBlNT6omftPxHpBANhZvbxsiz6tg8LvAQbrSVcZXRuWq0w/exec")
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("table-body");
            tableBody.innerHTML = "";

            // Pular a primeira linha se for o cabeçalho
            data.slice(1).forEach((encontro, index) => {
                // Verificar se os dados são válidos antes de exibir
                if (!encontro.data || !encontro.hora) return;

                // Formatar data para DD/MM/AAAA
                let dataFormatada = new Date(encontro.data).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                });

                // Formatar hora para HH:mm
                let horaFormatada = new Date(encontro.hora).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false
                });

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${encontro.professor}</td>
                    <td>${encontro.tutor}</td>
                    <td>${encontro.disciplina}</td>
                    <td>${dataFormatada}</td>
                    <td>${horaFormatada}</td>
                    <td><a href="${encontro.link}" target="_blank">Acessar</a></td>
                    <td>
                        <button class="delete-btn" onclick="deleteEncontro(${index})">Excluir</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error("Erro ao carregar os encontros:", error));
}

// Função para filtrar a tabela
function filterTable() {
    const filter = document.getElementById("search").value.toLowerCase();
    const rows = document.querySelectorAll("#table-body tr");

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? "" : "none";
    });
}

// Carrega os encontros ao iniciar a página
window.onload = loadEncontros;
