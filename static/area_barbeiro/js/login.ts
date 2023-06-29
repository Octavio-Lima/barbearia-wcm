import { MakeRequest } from "../../geral/js/utility.js";
const FORM = document.getElementById("login-form") as HTMLFormElement;
const SUBMIT_BUTTON_LOADER = document.getElementById('submit-loader');
const SUBMIT_BUTTON_TEXT = document.getElementById('submit-text');
const SUBMIT_BUTTON_SUCCESS = document.getElementById('submit-success');

// Autenticar o usuario
FORM.addEventListener("submit", async event => {
    event.preventDefault();

    // Mostrar que está carregando as coisas
    SUBMIT_BUTTON_LOADER?.classList.remove('d-none');
    SUBMIT_BUTTON_TEXT?.classList.add('d-none');
    SUBMIT_BUTTON_SUCCESS?.classList.add('d-none');
    
    // Enviar para ser processado
    const formData = new FormData(FORM);
    const data = new URLSearchParams(formData).toString();
    const request = await MakeRequest(FORM.action, 'post', data, true);

    // Se for aceito, redirecionar para a tela principal do barbeiro
    if (request.status == 200) {
        // Mostrar que o acesso foi concedido
        SUBMIT_BUTTON_LOADER?.classList.add('d-none');
        SUBMIT_BUTTON_TEXT?.classList.add('d-none');
        SUBMIT_BUTTON_SUCCESS?.classList.remove('d-none');

        let jsonResponse = await request.json();
        document.cookie = jsonResponse['shop_id'];
        window.location.href = jsonResponse['url'];
        return;
    }

    // Se for recusado, avisar
    let warningMessage = document.getElementById("warning-message");
    warningMessage?.classList.remove("d-none");

    // Mostrar que terminou de carregar
    SUBMIT_BUTTON_LOADER?.classList.add('d-none');
    SUBMIT_BUTTON_TEXT?.classList.remove('d-none');
    SUBMIT_BUTTON_SUCCESS?.classList.add('d-none');
})