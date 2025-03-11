// Verifica se o usuário está logado ao acessar qualquer página restrita
if (!localStorage.getItem("loggedIn")) {
    const currentPath = window.location.pathname;
    if (!currentPath.includes("login.html")) {
        window.location.href = "/login.html"; // Redireciona para o login, garantindo o caminho correto
    }
}

document.getElementById("login-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");

    try {
        const response = await fetch("usuarios.json");
        const users = await response.json();

        const validUser = users.find(user => user.username === username && user.password === password);

        if (validUser) {
            localStorage.setItem("loggedIn", "true");
            window.location.href = "/pages/hub/index.html"; // Redireciona para a tela principal
        } else {
            errorMessage.style.display = "block";
        }
    } catch (error) {
        console.error("Erro ao carregar usuários:", error);
    }
});
