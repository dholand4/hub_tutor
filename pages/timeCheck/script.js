// Variáveis para facilitar a alteração dos links das APIs
const BASE_AGENDAMENTOS = "https://script.google.com/macros/s/AKfycbzQOkqHyloN1TpWWbylaQ2XZBlNT6omftPxHpBANhZvbxsiz6tg8LvAQbrSVcZXRuWq0w/exec";
const BASE_PROFESSORES = "https://script.googleusercontent.com/a/macros/unicatolicaquixada.edu.br/echo?user_content_key=vXe_cqFAcxSwcY7341uCETW_B40oJzahlI6u8Bczg7r55SZw-_BJIIASzGo40Rgw4w2SnV62rl2aiQg818l2As2PYXYhUW8BOJmA1Yb3SEsKFZqtv3DaNYcMrmhZHmUMi80zadyHLKBUfEe4Pyxx62tO4i_dSTocYYRrV3-qoNpX1fwwE55bXuCMOOgN8AGmRn4Imvk4yXwGDWdC5A_f4ESihW7l5biRQ26XJfAy-moy33YiZIHE9WGqSbi45wHis1TTyuu29W5SFwKCi6E3ojBnqtDxK_me8rKKYTkwNXhRVMkLAU9H3dWQ3YoVX3Fp&lib=MkAHc8-m_at_uRQSO7M6hN_h5REasFrxn";

// Função para carregar a lista de professores na opção select
function loadProfessores() {
    fetch(BASE_PROFESSORES)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na resposta da API: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log("Dados de professores recebidos:", data);

            const professorSelect = document.getElementById("professor");

            professorSelect.innerHTML = '<option value="">Selecione o Professor</option>';

            if (Array.isArray(data) && data.length > 0) {
                data.forEach(professor => {
                    const option = document.createElement("option");
                    option.value = professor;
                    option.textContent = professor;
                    professorSelect.appendChild(option);
                });
            } else {
                console.error("A resposta da API não contém a lista esperada de professores.");
                alert("Erro ao carregar a lista de professores.");
            }
        })
        .catch(error => {
            console.error("Erro ao carregar os professores:", error);
            alert("Erro ao carregar os professores.");
        });
}


// Função para carregar os encontros da planilha
function loadEncontros() {
    fetch(BASE_AGENDAMENTOS)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("table-body");
            tableBody.innerHTML = "";

            data.slice(1).forEach((encontro, index) => {
                if (!encontro.data || !encontro.hora) return;

                let dataFormatada = new Date(encontro.data).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                });

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

// Carrega os encontros e professores ao iniciar a página
window.onload = () => {
    loadEncontros();
    loadProfessores();
};

// Manipulador de evento para o formulário
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
        const existingProfessor = cells[0].innerText;
        const existingData = cells[3].innerText.split('/').reverse().join('-'); // Formata para YYYY-MM-DD
        const existingHora = cells[4].innerText;

        // Verifica se o professor já tem encontro no mesmo dia e hora
        if (existingProfessor === professor && existingData === dataEncontro && existingHora === horaEncontro) {
            alert("Conflito de horário: Esse professor já tem um encontro agendado nessa data e hora!");
            return;
        }
    }

    // Agora voltamos ao envio original com FormData
    fetch(BASE_AGENDAMENTOS, {
        method: "POST",
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na resposta da API: ' + response.statusText);
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
