// URLs das APIs
const BASE_AGENDAMENTOS = "https://script.google.com/macros/s/AKfycbzQOkqHyloN1TpWWbylaQ2XZBlNT6omftPxHpBANhZvbxsiz6tg8LvAQbrSVcZXRuWq0w/exec";
const BASE_PROFESSORES = "https://script.googleusercontent.com/a/macros/unicatolicaquixada.edu.br/echo?user_content_key=vXe_cqFAcxSwcY7341uCETW_B40oJzahlI6u8Bczg7r55SZw-_BJIIASzGo40Rgw4w2SnV62rl2aiQg818l2As2PYXYhUW8BOJmA1Yb3SEsKFZqtv3DaNYcMrmhZHmUMi80zadyHLKBUfEe4Pyxx62tO4i_dSTocYYRrV3-qoNpX1fwwE55bXuCMOOgN8AGmRn4Imvk4yXwGDWdC5A_f4ESihW7l5biRQ26XJfAy-moy33YiZIHE9WGqSbi45wHis1TTyuu29W5SFwKCi6E3ojBnqtDxK_me8rKKYTkwNXhRVMkLAU9H3dWQ3YoVX3Fp&lib=MkAHc8-m_at_uRQSO7M6hN_h5REasFrxn";

// Carregar professores no campo de pesquisa
function loadProfessores() {
    fetch(BASE_PROFESSORES)
        .then(res => res.json())
        .then(data => {
            const datalist = document.getElementById("professores");
            datalist.innerHTML = "";

            data.forEach(professor => {
                const option = document.createElement("option");
                option.value = professor;
                datalist.appendChild(option);
            });
        })
        .catch(error => console.error("Erro ao carregar professores:", error));
}

// Carregar encontros agendados
function loadEncontros() {
    fetch(BASE_AGENDAMENTOS)
        .then(res => res.json())
        .then(data => {
            const tableBody = document.getElementById("table-body");
            tableBody.innerHTML = "";

            data.slice(1).forEach((encontro, index) => {
                if (!encontro.data || !encontro.hora) return;

                let dataFormatada = new Date(encontro.data).toLocaleDateString("pt-BR");
                let horaFormatada = new Date(encontro.hora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false });

                tableBody.innerHTML += `
                    <tr>
                        <td>${encontro.professor}</td>
                        <td>${encontro.tutor}</td>
                        <td>${encontro.disciplina}</td>
                        <td>${dataFormatada}</td>
                        <td>${horaFormatada}</td>
                        <td><a href="${encontro.link}" target="_blank">Acessar</a></td>
                        <td><button class="delete-btn" onclick="deleteEncontro(${index})">Excluir</button></td>
                    </tr>
                `;
            });
        })
        .catch(error => console.error("Erro ao carregar encontros:", error));
}

// Função de filtro de agendamentos
function filterTable() {
    const filtro = document.getElementById("search").value.toLowerCase();
    const rows = document.querySelectorAll("#table-body tr");

    rows.forEach(row => {
        const rowText = row.textContent.toLowerCase();
        if (rowText.includes(filtro)) {
            row.style.display = ""; // Mostrar a linha
        } else {
            row.style.display = "none"; // Ocultar a linha
        }
    });
}

// Verificar conflito de horário no formulário
function verificarConflito(professor, disciplina, dataEncontro, horaEncontro) {
    const rows = document.querySelectorAll("#table-body tr");
    const dataFormatada = dataEncontro.split('/').reverse().join('-'); // Formato YYYY-MM-DD

    for (let row of rows) {
        const [existingProfessor, , existingDisciplina, existingData, existingHora] = row.getElementsByTagName("td");
        const existingDataFormatada = existingData.innerText.split('/').reverse().join('-'); // Formato YYYY-MM-DD

        if ((existingProfessor.innerText === professor || existingDisciplina.innerText === disciplina) &&
            existingDataFormatada === dataFormatada &&
            existingHora.innerText === horaEncontro) {
            return true; // Conflito encontrado
        }
    }
    return false; // Sem conflito
}

// Submissão do formulário com verificação de conflito e bloqueio de botão
document.getElementById("form").addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const professor = formData.get("professor");
    const disciplina = formData.get("disciplina");
    const dataEncontro = formData.get("data");
    const horaEncontro = formData.get("hora");

    // Verificar se há conflito
    if (verificarConflito(professor, disciplina, dataEncontro, horaEncontro)) {
        alert("Conflito de horário: Esse professor ou disciplina já têm um encontro agendado nessa data e hora!");
        return;
    }

    // Desabilitar o botão e mostrar o loading
    const submitButton = document.getElementById("submit-button");
    submitButton.disabled = true;
    submitButton.innerHTML = "Aguarde..."; // Texto do botão enquanto processa

    // Enviar para API
    fetch(BASE_AGENDAMENTOS, { method: "POST", body: formData })
        .then(res => res.ok ? res.text() : Promise.reject("Erro na resposta da API"))
        .then(() => {
            alert("Registro do Encontro Adicionado!");
            loadEncontros(); // Recarregar encontros após salvar
        })
        .catch(error => alert("Erro ao salvar os dados: " + error))
        .finally(() => {
            // Reabilitar o botão e esconder o loading
            submitButton.disabled = false;
            submitButton.innerHTML = "Salvar Encontro"; // Texto do botão original
        });
});

// Iniciar página carregando dados
window.onload = () => {
    loadEncontros();
    loadProfessores();
};
