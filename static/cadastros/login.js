import {displayModal} from "./modal.js";

const LOGIN_BUTTON = document.getElementById("login-button");
LOGIN_BUTTON.addEventListener("click", (event) => {CheckCredentials(event)});

const USER_LIST = document.getElementById("user-list");
const FORGOT_PASSWORD = document.getElementById("forgot-password-link");
FORGOT_PASSWORD.addEventListener("click", (event) => {ShowUserList()});

async function CheckCredentials() { 
    const user_input = document.getElementById("user");
    const pass_input = document.getElementById("pass");

    let jsonRequest = JSON.stringify({
        logName: user_input.value,
        password: pass_input.value,
        accessType: ".",
        name: ".",
        id: 0
    });

    let url = "http://localhost:5018/api/Authenticate"

    const response = await fetch (url, {
        method:"POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers:{
            "content-type":"application/json; charset=UTF-8"
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: jsonRequest
    });

    let bodyResponse;

    if (response.ok) {
        bodyResponse = await response.text();
    } else {
        alert("HTTP-Error: " + response.status);
    }

    let loggedUser = JSON.parse(bodyResponse);
    console.log(loggedUser);

    if (loggedUser.match == "Match found") {
        localStorage.setItem("accessName", loggedUser.name);
        localStorage.setItem("accessType", loggedUser.accessType);
        localStorage.setItem("loggedId", loggedUser.id);
        window.open("../html/manage.html", "_self");
    } else {
        let warningMessage = document.querySelector("#warning-message");
        warningMessage.classList.remove("d-none");
    }
}

function ShowUserList() {
    displayModal("Acessos de Teste", "Usuario: gerencia / Senha: 111 / Gerenciador \r\nUsuario: joao / Senha: 123 / Gerenciador, Barbeiro \r\nUsuario: lucio / Senha: 321 / Barbeiro");
}