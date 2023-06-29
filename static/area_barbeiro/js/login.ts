import { MakeRequest } from "../../geral/js/utility.js";
const FORM = document.getElementById("login-form") as HTMLFormElement;

// Autenticar o usuario
FORM.addEventListener("submit", async event => {
    event.preventDefault();
    
    // Enviar para ser processado
    const formData = new FormData(FORM);
    const data = new URLSearchParams(formData).toString();
    const request = await MakeRequest('/nomebarbearia/acessar/', 'post', data, true);

    // Se for aceito, redirecionar para a tela principal do barbeiro
    if (request == 200) {
        console.log('asd');
        window.location.replace('/nomebarbearia/');
        return;
    }

    // Se for recusado, avisar
    let warningMessage = document.querySelector("#warning-message");
    warningMessage?.classList.remove("d-none");
})