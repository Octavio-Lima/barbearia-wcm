import { PadNumber, TimeToScheduleIndex } from "../../../../geral/js/formating.js";
import { GetCookie, MakeRequest } from "../../../../geral/js/utility.js";
const SHOP_ID = GetCookie("shopId");
const SHOP_OPENS_AT = new Date();
const SHOP_CLOSES_AT = new Date();
let shop_closesAtIndex = 0;
let tableDate = '';
const DATE = document.querySelector("#schedule-date");
const SCHEDULE_TABLE = document.querySelector("#schedule-list");
let entriesList = [];
// Inicializar
(async function () {
    await ShopConfigurationSetup(); // Configurações da Barbearia
    // TODO: No momento só é levado em consideração as horas, no futuro deve ser alterado para levar em consideração os minutos
    for (let i = SHOP_OPENS_AT.getHours(); i < SHOP_CLOSES_AT.getHours(); i++) {
        CreateEntry(i, 0);
        CreateEntry(i, 1);
        CreateEntry(i, 2);
        CreateEntry(i, 3);
    }
    updateEntryList();
    ClearTableInfo();
    // Definir o dia inicial da tabela
    let newDate = new Date();
    tableDate = `${newDate.getFullYear()}-${PadNumber(newDate.getMonth() + 1)}-${PadNumber(newDate.getDate())}`;
    DATE.value = tableDate;
    // carregar lista de agenda disponivel
    UpdateScheduleTable();
})();
/* -------------------------------------------------------------------------- */
/*                              Obter Infomações                              */
/* -------------------------------------------------------------------------- */
// Carregar Configurações da Barbearia
async function ShopConfigurationSetup() {
    const PARAMS = `?shopId=${SHOP_ID}`;
    const SHOP_CONFIG = await MakeRequest(`/ajax/shop/config${PARAMS}`, 'get');
    const OPENS_AT = SHOP_CONFIG.opensAt.split(':');
    SHOP_OPENS_AT.setHours(parseInt(OPENS_AT[0]), parseInt(OPENS_AT[1]), (OPENS_AT.length >= 3 ? parseInt(OPENS_AT[0]) : 0));
    const CLOSES_AT = SHOP_CONFIG.closesAt.split(':');
    SHOP_CLOSES_AT.setHours(parseInt(CLOSES_AT[0]), parseInt(CLOSES_AT[1]), (CLOSES_AT.length >= 3 ? parseInt(CLOSES_AT[0]) : 0));
    shop_closesAtIndex = TimeToScheduleIndex(SHOP_CLOSES_AT, SHOP_OPENS_AT.getHours());
}
/* --------------------------- Crianção de Horario -------------------------- */
function CreateEntry(hour, minute) {
    const entry = document.createElement("div");
    const time = document.createElement("p");
    const description = document.createElement("div");
    const topRow = document.createElement("div");
    const bottomRow = document.createElement("div");
    const EL_CLIENT = document.createElement("p");
    const EL_SERVICE = document.createElement("p");
    const EL_PHONE = document.createElement("p");
    const EL_INSTA = document.createElement("p");
    const EL_SPACER = document.createElement("p");
    const EL_SPACERTWO = document.createElement("p");
    // Modal que estava testando
    // entry.addEventListener("dblclick", () => { modal.displayModal(EL_CLIENT.innerText); })
    entry.classList.add("schedule-entry");
    time.classList.add("time");
    time.classList.add("schedule-entry-time");
    description.classList.add("container-entry-details");
    topRow.classList.add("detail-container");
    topRow.classList.add("info-top");
    EL_CLIENT.classList.add("m-0");
    EL_CLIENT.classList.add("schedule-client-name");
    EL_SERVICE.classList.add("m-0");
    EL_SERVICE.classList.add("schedule-service");
    bottomRow.classList.add("detail-container");
    bottomRow.classList.add("info-bottom");
    EL_SPACER.classList.add("flex-grow-1");
    EL_SPACERTWO.classList.add("flex-grow-1");
    EL_PHONE.classList.add("schedule-client-phone");
    EL_INSTA.classList.add("schedule-client-insta");
    time.innerText = formatTimeString(hour) + ":" + formatTimeString(15 * minute);
    topRow.appendChild(EL_CLIENT);
    topRow.appendChild(EL_SPACERTWO);
    topRow.appendChild(EL_SERVICE);
    bottomRow.appendChild(EL_INSTA);
    bottomRow.appendChild(EL_SPACER);
    bottomRow.appendChild(EL_PHONE);
    entry.appendChild(time);
    description.appendChild(topRow);
    description.appendChild(bottomRow);
    entry.appendChild(description);
    SCHEDULE_TABLE?.appendChild(entry);
}
/* -------------------------------------------------------------------------- */
/*                                 Inicializar                                */
/* -------------------------------------------------------------------------- */
function AddEntryInfo(entry) {
    // Obter o endereço de onde vai exibir o agendamento na lista de horarios
    const SCHEDULE_TIME = new Date();
    const SCHEDULE_SPLIT = entry.schedule.split(':');
    SCHEDULE_TIME.setHours(parseInt(SCHEDULE_SPLIT[0]), parseInt(SCHEDULE_SPLIT[1], 0));
    const SCHEDULE_START_INDEX = TimeToScheduleIndex(SCHEDULE_TIME, SHOP_OPENS_AT.getHours());
    // Obter quantos horarios o agendamento deve ocupar
    const SCHEDULE_FULL_DURATION = entry.duration.split(':');
    const DURATION_HOUR = parseInt(SCHEDULE_FULL_DURATION[0]);
    const DURATION_MINUTE = parseInt(SCHEDULE_FULL_DURATION[1]);
    const SCHEDULE_DURATION = (DURATION_HOUR + (DURATION_MINUTE / 60)) * 4;
    // Obter quais horarios na agenda serão preenchido
    let scheduleTableEntries = [];
    for (let i = 0; i < SCHEDULE_DURATION; i++) {
        let j = SCHEDULE_START_INDEX + i;
        scheduleTableEntries[i] = entriesList[j];
    }
    // Marcar os horarios como ocupados
    for (let i = 0; i < SCHEDULE_DURATION; i++) {
        // Se o horario for maior que o horario que a barbearia fecha, parar para não travar
        if (i >= shop_closesAtIndex - 2) {
            break;
        }
        const SCHEDULE_DESCRIPTION = scheduleTableEntries[i].querySelector('.container-entry-details');
        const SCHEDULE_TIME = scheduleTableEntries[i].querySelector('.schedule-entry-time');
        if (i == 0) {
            SCHEDULE_DESCRIPTION?.classList.add('row-busy-top');
            scheduleTableEntries[i]?.classList.add('top');
        }
        else if (i == SCHEDULE_DURATION - 1) {
            SCHEDULE_DESCRIPTION?.classList.add('row-busy-bottom');
            scheduleTableEntries[i]?.classList.add('base');
        }
        else {
            SCHEDULE_DESCRIPTION?.classList.add('row-busy');
            scheduleTableEntries[i]?.classList.add('middle');
            SCHEDULE_TIME?.classList.add('hidden');
        }
    }
    // Adicionar informação ao agendamento
    const CLIENT_NAME = scheduleTableEntries[0].querySelector('.schedule-client-name');
    const SERVICE = scheduleTableEntries[0].querySelector('.schedule-service');
    const PHONE = scheduleTableEntries[0].querySelector('.schedule-client-phone');
    const INSTAGRAM = scheduleTableEntries[0].querySelector('.schedule-client-insta');
    if (CLIENT_NAME)
        CLIENT_NAME.textContent = entry.name;
    // if (SERVICE) SERVICE.textContent = `(${entry.services})`;
    if (SERVICE)
        SERVICE.textContent = `asd`;
    if (PHONE)
        PHONE.textContent = entry.phone;
    if (INSTAGRAM)
        INSTAGRAM.textContent = entry.instagram;
}
function ClearTableInfo() {
    entriesList.forEach(entry => {
        // Remover informação do agendamento
        const CLIENT_NAME = entry.querySelector('.schedule-client-name');
        const SERVICE = entry.querySelector('.schedule-service');
        const PHONE = entry.querySelector('.schedule-client-phone');
        const INSTAGRAM = entry.querySelector('.schedule-client-insta');
        const SCHEDULE_DESCRIPTION = entry.querySelector('.container-entry-details');
        const SCHEDULE_TIME = entry.querySelector('.schedule-entry-time');
        if (CLIENT_NAME)
            CLIENT_NAME.textContent = '';
        if (SERVICE)
            SERVICE.textContent = '';
        if (PHONE)
            PHONE.textContent = '';
        if (INSTAGRAM)
            INSTAGRAM.textContent = '';
        SCHEDULE_DESCRIPTION?.classList.remove("row-busy-bottom");
        SCHEDULE_DESCRIPTION?.classList.remove("row-busy-top");
        SCHEDULE_DESCRIPTION?.classList.remove("row-busy");
        SCHEDULE_TIME?.classList.remove('hidden');
        entry?.classList.remove("middle");
        entry?.classList.remove("base");
        entry?.classList.remove("top");
    });
}
/* ---------------------------- Atualizar Tabela ---------------------------- */
DATE.addEventListener("change", async function () {
    await ShopConfigurationSetup(); // Configurações da Barbearia
    ClearTableInfo();
    UpdateScheduleTable();
});
async function UpdateScheduleTable() {
    // carregar lista de agenda disponivel
    let params = `?date=${DATE.value}&shopId=${SHOP_ID}`;
    let scheduleList = await MakeRequest('/ajax/clients' + params, 'get');
    // Adicionar Agendamentos a lista de horarios preenchidos
    scheduleList.forEach((entry) => {
        AddEntryInfo(entry);
    });
}
// || Extra
function formatTimeString(value) {
    if (value <= 9) {
        return `0${value}`;
    }
    else {
        return value.toString();
    }
}
function updateEntryList() {
    const entriesElementList = document.querySelectorAll(".schedule-entry");
    entriesElementList.forEach(element => {
        entriesList.push(element);
    });
}
