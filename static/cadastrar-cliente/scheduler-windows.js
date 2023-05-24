/* Gerencia as Janelas do agendamento do cliente */
import { schedule_day, UpdateCalendar, UpdateServiceTable, schedule_services, schedule_time,
    UpdateSchedule, isNextMonth, UpdateClientSummaryInfo } from "/static/cadastrar-cliente/client-scheduler.js";
import { shop_barberList } from "/static/cadastrar-cliente/main.js";

// * Modal Principal
const MAIN_WINDOW = document.querySelector("main-pop-up")
const CLOSE_WINDOW_OVERLAY = document.querySelector("#close-popup");

// * Sub Modal
const SUB_MODAL_LIST = [ // Agrupar todas as janelas em uma array só
    document.querySelector("#calendar-window"),
    document.querySelector("#client-info-window"),
    document.querySelector("#service-window"),
    document.querySelector("#schedule-window"),
    document.querySelector("#overview-window")
]

let currentSubModal = 0;
const warningMsg = document.querySelectorAll(".warning-msg")

/* ----------------------------- Modal Principal ---------------------------- */
// Exibir modal principal
export function DisplayModal(isVisible = true, clearAllForms = false) {
    // obter elementos da modal
    let blurOverlay = document.querySelector("#blur-overlay");
    let footerSpacer = document.querySelector("#footer-spacer");
    let menuButtons = document.querySelector(".menu-button-group");

    if (isVisible) {
        // Mostrar quando for selecionado um barbeiro
        blurOverlay.classList.remove("d-none");
        MAIN_WINDOW.classList.remove("d-none");
        CLOSE_WINDOW_OVERLAY.classList.remove("d-none");
        
        footerSpacer.classList.add("d-none");
        menuButtons.classList.add("d-none");
    } else {
        // Janela fechada
        blurOverlay.classList.add("d-none");
        MAIN_WINDOW.classList.add("d-none");
        CLOSE_WINDOW_OVERLAY.classList.add("d-none");
        
        footerSpacer.classList.remove("d-none");
        menuButtons.classList.remove("d-none");

        // remover estilo dos barbeiros
        shop_barberList.forEach(barber => {
            barber.classList.remove("selected-worker")
            barber.querySelector(".worker-name").classList.remove("text-glow")
        });
    }
    
    /* Tanto quanto abrir quanto fechar a janela,
    voltar para a janela principal, que é o calendario */
    GoToWindowIndex(0, true);
    
    // Apagar toda informação dos formulários
    if (clearAllForms) {
        ClearClientForms();
    }
}

/* ----------------------------- Botões da Modal ---------------------------- */
// Botão de ir para a próxima janela (botão de confirmação)
const CONFIRM_BUTTON_LIST = document.querySelectorAll(".btn-confirm");
CONFIRM_BUTTON_LIST.forEach(button => {
    button.addEventListener("click", () => {
        let index = button.getAttribute('data-modalIndex').replace(/\D/g, '');

        // Se não for o botão de confirmar agendamento
        if (button.id != 'btn-finish-schedule') {
            GoToWindowIndex(index);
        }
    })
});

// se clicar fora da modal, fechar a modal
CLOSE_WINDOW_OVERLAY.addEventListener("click", function () {
    DisplayModal(false);
})

/* ------------------------------- Sub Modais ------------------------------- */
// Acessar página informada da janela 
function GoToWindowIndex(index, ignoreRequirements = false) {
    if (CheckWindowRequirements() || ignoreRequirements) {
        // esconder todas os avisos e submodais
        SUB_MODAL_LIST.forEach(page => { page.classList.add('d-none'); })
        warningMsg.forEach(message => { message.classList.add('d-none'); })

        // carregar submodal correta
        UpdateWindowInfo(index);
        SUB_MODAL_LIST[index].classList.remove("d-none");
        currentSubModal = index;
    }
}

// Checar se o cliente pode prosseguir para a próxima página
function CheckWindowRequirements() {
    if (currentSubModal == 0) { if (CheckCalendar()) { return true; } }  // conferir calendario
    if (currentSubModal == 1) { if (CheckClientForm(currentSubModal)) { return true; } } // conferir formulario do cliente
    if (currentSubModal == 2) { if (CheckSelectedServices(currentSubModal)) { return true; } }  // conferir selecionamento do serviço / produto
    if (currentSubModal == 3) { if (CheckScheduling(currentSubModal)) { return true; } } // conferir agendamento de horario
    
    return false;
}

/* ------- Seção de conferir se o formulário preenche os requerimentos ------ */
function CheckCalendar() {
    if (schedule_day >= 1 && schedule_day <= 31) {
        return true;
    }

    warningMsg[currentSubModal].classList.remove("d-none");
}

function CheckClientForm() {

    let clientName = document.querySelector("#input-client-name").value;
    let clientInstagram = document.querySelector("#input-client-instagram").value;
    let clientEmail = document.querySelector("#input-client-email").value;
    let clientPhone = document.querySelector("#input-client-phone").value;
    
    if (clientName.length > 0 && clientPhone.length >= 15 && CheckEmail(clientEmail) && clientInstagram.length > 0) {
        return true;
    }
    
    warningMsg[currentSubModal].classList.remove("d-none");
}

function CheckEmail(email) {
    if (email.includes("@") && email.includes(".com")) {
        return true;
    }
}

function CheckSelectedServices() {
    if (schedule_services.length > 0) {
        return true;
    }

    warningMsg[currentSubModal].classList.remove("d-none");
}

function CheckScheduling(index) {
    if (schedule_time != '' && schedule_time != null) {
        return true;
    }
    
    warningMsg[index].classList.remove("d-none");
}

// Atualizar as informações de cada janela
// Ex: preencher os dias correto do calendario, carregar lista de serviços correta
function UpdateWindowInfo(windowIndex) {
    if (windowIndex == 0) { UpdateCalendar(isNextMonth); } else
    if (windowIndex == 1) { } else
    if (windowIndex == 2) { UpdateServiceTable(); } else
    if (windowIndex == 3) { UpdateSchedule(); } else
    if (windowIndex == 4) { UpdateClientSummaryInfo(); }
}
