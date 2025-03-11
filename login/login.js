// Verifica se o usuário está logado ao acessar qualquer página restrita
if (!localStorage.getItem("loggedIn")) {
    const currentPath = window.location.pathname;
    // Verifica se o caminho atual não inclui index.html (login), para redirecionar para a página de login
    if (!currentPath.includes("/index.html")) {
        window.location.href = "/index.html"; // Caminho correto para a página de login
    }
}

document.getElementById("login-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");

    try {
        // Caminho correto para o arquivo de usuários
        const response = await fetch("/login/usuarios.json");  // Ajustando o caminho para o arquivo JSON
        const users = await response.json();

        const validUser = users.find(user => user.username === username && user.password === password);

        if (validUser) {
            localStorage.setItem("loggedIn", "true");
            window.location.href = "/pages/hub/index.html"; // Caminho correto para a página principal após login
        } else {
            errorMessage.style.display = "block";
        }
    } catch (error) {
        console.error("Erro ao carregar usuários:", error);
    }
});
