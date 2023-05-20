const LOGIN_BUTTON = document.getElementById("login-button");

// Autenticar o usuario
LOGIN_BUTTON.addEventListener("click", (event) => {
    event.preventDefault();

    const user_input = document.getElementById("user");
    const pass_input = document.getElementById("pass");

    let jsonRequest = JSON.stringify({
        logName: user_input.value,
        password: pass_input.value,
        accessType: ".",
        name: ".",
        id: 0
    });

    const response = await fetch ('/api/Authenticate', {
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