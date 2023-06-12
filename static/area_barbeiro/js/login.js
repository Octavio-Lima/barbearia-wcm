import { MakeRequest } from "../../geral/js/utility.js";
const FORM = document.getElementById("login-form");
// Autenticar o usuario
FORM.addEventListener("submit", async (event) => {
    event.preventDefault();
    // Enviar para ser processado
    const data = new URLSearchParams(new FormData(FORM)).toString();
    const request = await MakeRequest('/nomebarbearia/acessar/', 'post', data, true);
    // Se for aceito, redirecionar para a tela principal do barbeiro
    if (request.ok) {
        window.location.replace('/nomebarbearia/');
        return;
    }
    // Se for recusado, avisar
    let warningMessage = document.querySelector("#warning-message");
    warningMessage?.classList.remove("d-none");
});
