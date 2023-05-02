import * as format from "../geral/js/formating.js"; // text and number formating

// let apiURL = "https://cb9b-179-106-79-130.sa.ngrok.io/" // URL de teste NGROK
let apiURL = "http://localhost:5018/" // URL Local

// Barbeiros
let elBarberList = document.querySelectorAll(".barber");
let selectedBarber = 0;
let shopId = Cookies.get("shopId")

// Janela de Agendamento
let currentWindowIndex;
const MAIN_WINDOW = $("main-pop-up")
const CLOSE_WINDOW_OVERLAY = $("#close-popup");
const WINDOW_CALENDAR = document.querySelector("#calendar-window");
const WINDOW_CLIENT_INFO = document.querySelector("#client-info-window");
const WINDOW_SCHEDULE = document.querySelector("#schedule-window");
const WINDOW_SERVICE = document.querySelector("#service-window");
const WINDOW_OVERVIEW = document.querySelector("#overview-window");
const SCHEDULE_TABLE = $("#schedule-list");
const IN_CLIENT_NAME = document.querySelector("#input-client-name");
const IN_CLIENT_EMAIL = document.querySelector("#input-client-email");
const EL_CALENDAR_DAY_HEADER = document.querySelectorAll(".calendar-header")

// Calendario
const PREV_MONTH = document.querySelector("#current-month");
const NEXT_MONTH = document.querySelector("#next-month");
const EL_CALENDAR_DAY = document.querySelectorAll(".calendar-day");
let isNextMonth = false;


let ShopOpensAt = 0;
let ShopClosesAt = 0;  
let storeWorkDays = [1, 1, 1, 1, 1, 1, 1]; // domingo a segunda

let data_day;
let scheduledDay = 0;
let scheduledMonth;
let scheduledYear;
let clientName;
let clientPhone;
let clientEmail;
let clientInstagram;
let data_services;
let data_time = "";
let data_minute = 0;
let data_totalPrice = 0;

let serviceList = [];

let disabledScheduleList = []

let hasUpdatedScheduleTable = false;
let hasUpdatedServices = false;

let shiftCalendarColumn = 0; // 0 = domingo, 1 = segunda, 2 = ...

// Janela de Agendamento de Horario
let scheduleList = $('.schedule-entry');

// MUDAR DE JANELAS

const windowPages = [ // Agrupar todas as janelas em uma array só
    WINDOW_CALENDAR,
    WINDOW_CLIENT_INFO,
    WINDOW_SERVICE,
    WINDOW_SCHEDULE,
    WINDOW_OVERVIEW
]

const warningMsg = document.querySelectorAll(".warning-msg")

const monthNames = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
"JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"]

const date = new Date();
const currentYear = date.getFullYear();

const service_list = [ // serviço, preço, id, minutos (15*n)
['CORTE', 25, 0, 2],
['BARBOTERAPIA', 25, 1, 4],
    ['SOBRANCELHA', 10, 2, 1],
    ['CERVEJA', 10, 3, 0]
]

/* -------------------------------------------------------------------------- */
/*                           Iniciar tudo na página                           */
/* -------------------------------------------------------------------------- */
CreateBarberList();

/* -------------------------------------------------------------------------- */
/*                                Tela Inicial                                */
/* -------------------------------------------------------------------------- */
async function CreateBarberList() {
    let param = '?shopId=' + shopId
    let barberList = await MakeRequest('/ajax/users' + param, 'get')
    
    // Mostrar na página que os barbeiros não foram encontrados
    if (barberList == null) {
        $(".title-agendamento").text("Não foi possível carregar lista de barbeiros :(")
        return
    }
    
    // criar cada barbeiro na página
    barberList.forEach(barber => {
        CreateBarberElement(barber.name, barber.id);
    });
    
    // obter todos os barbeiros da página
    elBarberList = document.querySelectorAll(".barber");
}

async function MakeRequest(url, method, body) {
    let headers = {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json'
    }

    if (method == 'post') {
        const csrf = document.querySelector('[name=csrfmiddlewaretoken]').value
        headers['X-CSRFToken'] = csrf
    }

    const response = await fetch(url, {
        method: method,
        headers: headers,
        body: body
    });
    
    return await response.json()
}

function CreateBarberElement(barberName = '', id) {
    let BARBER = document.createElement('div');
    BARBER.classList.add('barber');
    BARBER.setAttribute('id', id);

    const BARBER_IMG = document.createElement('img');
    BARBER_IMG.setAttribute('src', '/static/geral/profilePictures/worker' + id + '.jpg');
    BARBER_IMG.setAttribute('alt', 'Barbeiro');
    BARBER_IMG.classList.add('worker-img');
    BARBER.append(BARBER_IMG);
    
    const BARBER_NAME = document.createElement('h3')
    BARBER_NAME.classList.add('worker-name')
    BARBER_NAME.innerText = barberName.toUpperCase()
    BARBER.append(BARBER_NAME)
    
    document.getElementById("barber-list-container").append(BARBER);
}

/* --------------------------- SELECIONAR BARBEIRO -------------------------- */
document.getElementById('barber-list-container').addEventListener("click", (event) => {
    let barber = event.target.closest(".barber");
    
    if (barber !== null) {
        selectedBarber = parseInt(barber.id);
        DisplayWindow(true);
        
        elBarberList.forEach(barber => {barber.classList.remove("selected-worker")});
        barber.classList.add("selected-worker");
        barber.lastElementChild.classList.add("text-glow");
    }
})

/* -------------------------------------------------------------------------- */
/*                            Janela de Agendamento                           */
/* -------------------------------------------------------------------------- */

// Exibir janela principal
function DisplayWindow(isVisible, clearAllForms) {
    let blurOverlay = $("#blur-overlay");
    let footerSpacer = $("#footer-spacer");
    let menuButtons = $(".menu-button-group");

    if (isVisible) {
        // Mostrar quando for selecionado um barbeiro
        blurOverlay.removeClass("d-none");
        MAIN_WINDOW.removeClass("d-none");
        CLOSE_WINDOW_OVERLAY.removeClass("d-none");
        
        footerSpacer.addClass("d-none");
        menuButtons.addClass("d-none");
    } else {
        // Janela fechada
        blurOverlay.addClass("d-none");
        MAIN_WINDOW.addClass("d-none");
        CLOSE_WINDOW_OVERLAY.addClass("d-none");
        
        footerSpacer.removeClass("d-none");
        menuButtons.removeClass("d-none");
        elBarberList.forEach(barber => {barber.lastElementChild.classList.remove("text-glow")});
        // // elBarberList.each(function(){$(this.lastChild).removeClass("text-glow")});
    }
    
    /* Tanto quanto abrir quanto fechar a janela,
    voltar para a janela principal */
    GoToWindowIndex(0, true);
    
    // Apagar toda informação dos formulários
    if (clearAllForms) {
        ClearClientForms()
    }
}

// Acessar página informada da janela 
function GoToWindowIndex(index, ignoreRequirements) {
    if (CheckWindowRequirements(currentWindowIndex) || ignoreRequirements) {
        format.addClassArray(windowPages, "d-none");
        format.addClassArray(warningMsg, "d-none");

        UpdateWindowInfo(index);
        windowPages[index].classList.remove("d-none");
        currentWindowIndex = index;
    }
}

// Checar se o cliente pode prosseguir para a próxima página
function CheckWindowRequirements(windowIndex) {
    if (windowIndex == 0) { if (CheckCalendar(windowIndex)) { return true; } }  // conferir calendario
    if (windowIndex == 1) { if (CheckClientForm(windowIndex)) { return true; } } // conferir formulario do cliente
    if (windowIndex == 2) { if (CheckSelectedServices(windowIndex)) { return true; } }  // conferir selecionamento do serviço / produto
    if (windowIndex == 3) { if (CheckScheduling(windowIndex)) { return true; } } // conferir agendamento de horario
    
    return false;
}

/* ------- Seção de conferir se o formulário preenche os requerimentos ------ */
function CheckCalendar(index) {
    if (scheduledDay >= 1 && scheduledDay <= 31) {
        return true;
    }

    warningMsg[index].classList.remove("d-none");
}

function CheckClientForm(index) {
    clientName = IN_CLIENT_NAME.value;
    clientInstagram = INPUT_INSTAGRAM.value;
    clientEmail = IN_CLIENT_EMAIL.value;
    clientPhone = INPUT_PHONE.value;
    
    if (clientName.length > 0 && clientPhone.length >= 15 && CheckEmail(clientEmail) && clientInstagram.length > 0) {
        return true;
    }
    
    warningMsg[index].classList.remove("d-none");
}

function CheckEmail(email) {
    if (email.includes("@") && email.includes(".com")) {
        return true;
    }
}

function CheckSelectedServices(index) {
    if (clientName) {
        return true;
    }
    
    warningMsg[index].classList.remove("d-none");
}

function CheckScheduling(index) {
    if (data_time) {
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

/* ---------------------------- BOTÕES DA JANELA ---------------------------- */
// Botão de ir para a próxima janela (botão de confirmação)
MAIN_WINDOW.on("click", (event) => {
    let button = event.target.closest(".btn-confirm");
    
    if (button !== null && button.id != "btn-finish-schedule") {
        let index = button.id.replace(/\D/g, '');
        GoToWindowIndex(index);
    }
})

// botão de confirmar agendamento, e fechar janela de agendamento
CLOSE_WINDOW_OVERLAY.on("click", function () {
    DisplayWindow(false, false);
})

/* -------------------------------------------------------------------------- */
/*                                                                            */
/*                    O QUE ESTÁ ABAIXO NÃO FOI ATUALIZADO                    */
/*                                                                            */
/*                          ATUALIZAÇÃO EM PROGRESSO                          */
/*                                                                            */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                           Páginas de cada Janela                           */
/* -------------------------------------------------------------------------- */
/* ------------------------------- CALENDARIO ------------------------------- */
// Seleção do dia
WINDOW_CALENDAR.addEventListener("click", (event) => {
    let selectedDay = event.target.closest(".calendar-day");
    
    if (selectedDay !== null) {
        format.removeClassArray(EL_CALENDAR_DAY, "selected-day");
        selectedDay.classList.add("selected-day");

        scheduledDay = parseInt(selectedDay.innerText, 10);
        scheduledMonth = GetMonth(isNextMonth);
        scheduledYear = GetMonthYear();
    }
})

/* ----------------------- Botões de Selecionar Meses ----------------------- */
// Botões de Selecionar Mês
PREV_MONTH.addEventListener('click', function() {
    UpdateCalendar(false);
})

NEXT_MONTH.addEventListener('click', function() {
    UpdateCalendar(true);
})

/* -------------------------- Funções do Calendario ------------------------- */
// Cabeçalho do calendario. Atualizar dias disponiveis no calendario
function UpdateCalendar(showNextMonth)
{
    // Header do Calendario
    const CALENDAR_TITLE = document.querySelector("#month-name");
    let month = GetMonth(showNextMonth);
    let year = GetMonthYear();
    
    CALENDAR_TITLE.innerText = monthNames[month] + ", " + year;
    
    // Dias do calendario
    let difference = shiftCalendarColumn - 7;
    let firstMonthDay = getMonthFirstDay(showNextMonth) - shiftCalendarColumn;
    let lastMonthDay = getMonthLastDay(showNextMonth);

    // Altered First Day é para quando o primeiro dia da semana não for domingo
    let shiftedFirstMonthDay = ((firstMonthDay < 0) ? (firstMonthDay + (shiftCalendarColumn - difference)) : firstMonthDay);
    
    for (let daySlot = 0; daySlot < 42; daySlot++) {
        if (daySlot < shiftedFirstMonthDay) {
            EL_CALENDAR_DAY[daySlot].innerText = "";
        }
        if (daySlot >= shiftedFirstMonthDay) {
            EL_CALENDAR_DAY[daySlot].innerText = daySlot - shiftedFirstMonthDay + 1;
        }
        if (daySlot > lastMonthDay + shiftedFirstMonthDay - 1) {
            EL_CALENDAR_DAY[daySlot].innerText = "";
        }
    }

    // Disponibilidade dos dias
    if (showNextMonth) {
        // o mês adiante deve ser possível selecionar todos os dias
        enableAllDays();
        isNextMonth = true;
        PREV_MONTH.classList.remove("hide-arrow");
        NEXT_MONTH.classList.add("hide-arrow");
    }
    else {
        // o mês atual deve ser possível selecionar a partir do dia atual
        disablePastDays();
        isNextMonth = false;
        PREV_MONTH.classList.add("hide-arrow");
        NEXT_MONTH.classList.remove("hide-arrow");
    }
}

function disablePastDays() {
    // remove a classe de selecionado em todos os dias do calendario 
    format.removeClassArray(EL_CALENDAR_DAY, "selected-day");
    scheduledDay = 0;

    let underflow = (getMonthFirstDay(false) - shiftCalendarColumn) < 0;
    let today = ((date.getDate() - 1) + getMonthFirstDay(false) - shiftCalendarColumn);
    let correctIndex = (underflow ? today + 7 : today)
    for (let daySlot = 0; daySlot < correctIndex; daySlot++) {
        EL_CALENDAR_DAY[daySlot].classList.add("disabled-day");
    }
}

function enableAllDays() {
    // habilita todos os dias, pois é o mês que vem
    format.removeClassArray(EL_CALENDAR_DAY, "selected-day");
    format.removeClassArray(EL_CALENDAR_DAY, "disabled-day");
    scheduledDay = 0;
}

function disableEntireColumn(day) {
    for (let column = 0; column < 6; column++) {
        let columnSlot = -shiftCalendarColumn + day + (column * 7);
        if (columnSlot < 0) {
            EL_CALENDAR_DAY[columnSlot + 7].classList.add("unavailable-day");
        }
        else {
            EL_CALENDAR_DAY[columnSlot].classList.add("unavailable-day");
        }
    }

    // remove a classe de selecionado em todos os dias do calendario 
    format.removeClassArray(EL_CALENDAR_DAY, "selected-day");
}

function shiftCalendarDays() {
    let headerColumn = new Array();
    for (let column_ = 0; column_ < 7; column_++) { headerColumn[column_] = EL_CALENDAR_DAY_HEADER[column_]; }

    const column = headerColumn.splice(0, shiftCalendarColumn);
    for (let i = 0; i < column.length; i++) { headerColumn.push(column[i]); }

    EL_CALENDAR_DAY_HEADER.forEach((day, index) => {
        let dayName = ['Dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']
        let correctIndex = index + shiftCalendarColumn;

        if (correctIndex > 6) {
            day.innerText = dayName[correctIndex - 7];
        }
        else {
            day.innerText = dayName[correctIndex];
        }
    });
}

/* ----------------------------- FUNÇÕES DE DATA ---------------------------- */
function getMonthFirstDay(getNextMonthsFirstDay) {
    // Se o mês que vem for janeiro, deve usar o ano novo
    let year = (GetMonth(true) == 0 ? currentYear + 1 : currentYear);

    if (getNextMonthsFirstDay) {
        return new Date(year, GetMonth(true), 1).getDay();
    }
    else {
        return new Date(currentYear, GetMonth(false), 1).getDay();
    }
}

function getMonthLastDay(getNextMonthsTotalDay) {
    // Se o mês que vem for janeiro, deve usar o ano novo
    let year = (GetMonth(true) == 0 ? currentYear + 1 : currentYear);

    if (getNextMonthsTotalDay) {
        return new Date(year, GetMonth(true) + 1, 0).getDate();
    }
    else {
        return new Date(currentYear, GetMonth(false) + 1, 0).getDate();
    }
}

function GetMonth(returnNextMonth) {
    let date = new Date();
    let currentMonth = date.getMonth();
    
    if (returnNextMonth) {
        return (currentMonth + 1 >= 12 ? 0 : currentMonth + 1); // o maximo de meses são 11, se for maior volta pra 0
    }
    else {
        return currentMonth;
    }
}

function GetMonthYear() {
    // Se o próximo mês for janeiro, deve retornar o ano seguinte
    return (GetMonth(true) == 0 ? currentYear + 1 : currentYear);
}

/* -------------------------------------------------------------------------- */
/*                           INFORMAÇÕES DO CLIENTE                           */
/* -------------------------------------------------------------------------- */
const INPUT_INSTAGRAM = document.querySelector("#input-client-instagram");
const INPUT_PHONE = document.querySelector("#input-client-phone");

INPUT_PHONE.addEventListener("keydown", (event) => {
    formatPhoneNmb(INPUT_PHONE.value, event.key);
})

function formatPhoneNmb(value, input) {
    // Letras, e outros caracteres que deverá ignorar
    if ((event.keyCode >= 58 && event.keyCode <= 90) || (event.keyCode >= 106)) {
        event.preventDefault();
    }
    
    // Numeros
    if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105)) {
        event.preventDefault();
        value += input;
    }

    value = value.replace(/\D/g, '');
    value = value.substring(0, 11);

    let size = value.length;
    if (size == 0) {
        value = value;
    } else if (size < 3) {
        value = '(' + value;
    } else if (size < 8) {
        value = '(' + value.substring(0, 2) + ') ' + value.substring(2, 7);
    } else {
        value = '(' + value.substring(0, 2) + ') ' + value.substring(2, 7) + '-' + value.substring(7, 11);
    }

    INPUT_PHONE.value = value;
    clientPhone = value.replace(/\D/g, '');
}

INPUT_INSTAGRAM.addEventListener("keyup", function () {
    formatInstagramHandle(INPUT_INSTAGRAM.value);
})

function formatInstagramHandle(input) {
    if (input.length > 0 && !input.includes("@")) {
        input = "@" + input
    }
    
    INPUT_INSTAGRAM.value = input;
}

// || LISTA DE SERVIÇOS //--------------------------------------------------------------------------------//
let chosenServiceList = new Array();
const EL_TOTAL_TIME = document.getElementById("total-time");
const EL_TOTAL_PRICE = document.getElementById("total-price");
chosenServiceList.length = service_list.length;

WINDOW_SERVICE.addEventListener("click", (event) => {
    let service_entry = event.target.closest(".service-entry");
    if (service_entry == null) { return; }
    
    let entry_id = parseInt(service_entry.id, 10);
    
    if (service_entry.classList.contains("selected")) {
        service_entry.classList.remove("selected");
        data_minute -= serviceList[entry_id][2]
        data_totalPrice -= serviceList[entry_id][1]
        updateChosenServiceList(entry_id, false);
    } else {
        service_entry.classList.add("selected");
        data_minute += serviceList[entry_id][2]
        data_totalPrice += serviceList[entry_id][1]
        updateChosenServiceList(entry_id, true);
    }
    
    EL_TOTAL_TIME.innerHTML = format.valueToTime(data_minute);
    EL_TOTAL_PRICE.innerHTML = format.numberToPrice(data_totalPrice);
})

function updateChosenServiceList(entry_id, isAdding) {
    if (isAdding) {
        chosenServiceList[entry_id] = 'selected';
    }
    else {
        chosenServiceList[entry_id] = undefined;
    }
}


function updateServiceTitle() {
    const service_title = document.querySelector("#service-title");
    service_title.innerText = scheduledDay + " " + monthNames[scheduledMonth] + ", " + scheduledYear;
}

async function UpdateServiceTable() {  // atualizar tabela de serviços
    const table = document.querySelector("#service-table");
    table.innerHTML = ''
    data_minute = 0
    data_totalPrice = 0
    serviceList = []
    
    EL_TOTAL_TIME.innerHTML = format.valueToTime(data_minute);
    EL_TOTAL_PRICE.innerHTML = format.numberToPrice(data_totalPrice);
    
    let entryId = 0
    let param = '?ShopID=' + shopId + '&BarbeiroId=' + selectedBarber;
    let serviceListRequest = await MakeRequest('/ajax/users/barber/config' + param, 'get')
    let newServiceList = serviceListRequest.Serviços
    let parsedService = newServiceList.split(";")
    parsedService.forEach(service => {
        let newEntry = service.split(">")
        let entryInfo = [newEntry[0], parseFloat(newEntry[1]), parseInt(newEntry[2])]
        table.appendChild(createServiceElement(entryInfo[0], format.numberToPrice(entryInfo[1]), entryId, (entryInfo[2])))
        serviceList.push(entryInfo);
        entryId++
    });
    
    let productList = await GetProductFromDB()
    let parsedProduct = productList.split(";")
    parsedProduct.forEach(product => {
        let newEntry = product.split(">") 
        let entryInfo = [newEntry[0], parseFloat(newEntry[1]), 0]
        table.appendChild(createServiceElement(entryInfo[0], format.numberToPrice(entryInfo[1]), entryId, 0))
        serviceList.push(entryInfo);
        entryId++
    });
}

async function GetProductFromDB() {
    let params = '?ShopID=' + shopId;
    let request = await MakeRequest('/ajax/shop/config/products' + params, 'get')
    let productList = request.Produtos

    console.log(productList);
    return productList
}

function createServiceElement(service, price, id, time) {
    let tableRow = document.createElement("tr");
    tableRow.classList.add("service-entry");
    tableRow.id = id;

    let serviceName = document.createElement("td");
    serviceName.classList.add("service-name");
    serviceName.innerHTML = service;
    serviceName.classList.add("col-3");
    
    let servicePrice = document.createElement("td");
    servicePrice.classList.add("service-price");
    servicePrice.innerHTML = price;
    servicePrice.classList.add("col-1");

    let serviceTime = document.createElement("td");
    serviceTime.classList.add("service-time");
    serviceTime.innerHTML = format.valueToTime(time);
    serviceTime.classList.add("col-1");

    tableRow.appendChild(serviceName);
    tableRow.appendChild(servicePrice);
    tableRow.appendChild(serviceTime);
    
    return tableRow;
}

/* -------------------------------------------------------------------------- */
/*                            Horarios Disponiveis                            */
/* -------------------------------------------------------------------------- */
// 
SCHEDULE_TABLE.on("click", (event) => {
    let targetEl = event.target.closest(".schedule-entry");
    if (targetEl == null) { return }
    
    if (!targetEl.classList.contains("unavailable")) {
        scheduleList.each(function(){$(this).removeClass('unavailable');});
        scheduleList.each(function(){$(this).removeClass('selected');});
        targetEl.classList.add("selected");
        data_time = targetEl.firstChild.innerHTML;
    }
})

// Atualiza a lista de horario assim que a janela for aberta
async function UpdateSchedule() {
    // Inicia todos os horarios da tabela
    if (!hasUpdatedScheduleTable) {
        hasUpdatedScheduleTable = true;
        
        // Cria horario a partir do horario que a barbearia abre, e para no horario que fecha
        for (let i = ShopOpensAt; i < ShopClosesAt; i++) {
            SCHEDULE_TABLE.append(CreateScheduleTime(i, 0));
            SCHEDULE_TABLE.append(CreateScheduleTime(i, 15));
            SCHEDULE_TABLE.append(CreateScheduleTime(i, 30));
            SCHEDULE_TABLE.append(CreateScheduleTime(i, 45));
        }

        scheduleList = $('.schedule-entry');
    }

    // Definir titulo da janela. Dia, mês e ano
    const SCHEDULE_TITLE = $("#schedule-title");
    SCHEDULE_TITLE.text(`${scheduledDay} ${monthNames[scheduledMonth]}, ${scheduledYear}`);
    
    // Limpa a tabela, e mostra todos os horarios disponiveis
    scheduleList.each(function() {
        $(this).removeClass('unavailable');
        $(this).removeClass('row-unav');
        $(this).removeClass("row-unav-cuz-dumb"); 
    })

    disabledScheduleList.length = 0;
    
    // carregar lista de agenda disponivel
    let date = (`${scheduledYear}-${format.DoubleDigitsInt(scheduledMonth + 1)}-${format.DoubleDigitsInt(scheduledDay)}`);
    await LoadServiceList(date);

    // Marcar os horarios listados como ocupados
    disabledScheduleList.forEach(schedule => {
        /* Desativa também os horarios anteriores ao horario a ser cancelado
        Isso evita que um horario fique por cima do outro*/
        let correctIndex = (((schedule.startHour * 4) + schedule.startMinute) - (ShopOpensAt * 4));
        for (let index = correctIndex - (data_minute - 1); index < correctIndex; index++) {
            if (index >= 0)
            {
                scheduleList[index].classList.add("unavailable");
                scheduleList[index].classList.add("row-unav"); 
                scheduleList[index].classList.add("row-unav-cuz-dumb"); 
            }
        }

        // Desativa os horarios normais
        DisableSchedule(schedule.startHour, schedule.startMinute, schedule.scheduleLength)
    });

    /* Desativa a opção de marcar no fim do dia se o horario agendado 
    exceder o horario que a barbearia fecha */
    let correctClosedHour = ((ShopClosesAt - ShopOpensAt) * 4);
    for (let index = correctClosedHour - (data_minute - 1); index < correctClosedHour; index++) {
        scheduleList[index].classList.add("unavailable");
        scheduleList[index].classList.add("row-unav"); 
        scheduleList[index].classList.add("row-unav-cuz-dumb"); 
    }
}

function CreateScheduleTime(time, minute) {
    let entry = $("<tr>");
    entry.addClass("schedule-entry");
    
    let sch_time = $("<td>");
    sch_time.text(format.DoubleDigitsInt(time) + ":" + format.DoubleDigitsInt(minute));
    sch_time.addClass("col-1");
    entry.append(sch_time);
    
    let sch_description = $("<td>");
    sch_description.text(" - HORÁRIO INDISPONÍVEL");
    sch_description.addClass("opacity-0");
    sch_description.addClass("col-6");
    sch_description.addClass("text-start");
    entry.append(sch_description);
    
    return entry;
}

// Desabilitar horarios
function DisableSchedule(startHour, startMinute, scheduleLength) {
    let correctIndex = ((startHour * 4) + startMinute) - (ShopOpensAt * 4);
    let entries = [];
    
    // evita que numeros errados façam alguma coisa
    if (correctIndex < 0 || correctIndex > scheduleList.length) {
        return;
    }

    // Desmarcar todos os horarios
    scheduleList.each(function() {
        $(this).removeClass("selected");
    })

    for (let i = 0; i < scheduleLength; i++) {
        let j = correctIndex + i
        entries[i] = scheduleList[j];
    }

    for (let i = 0; i < scheduleLength; i++) {
        let indexToChance = correctIndex + i;
        if (indexToChance < scheduleList.length) {
            scheduleList[indexToChance].classList.add("unavailable");
            entries[i].classList.add("row-unav"); 
        }
    }
}

class DisableScheduleItem {
    constructor(startHour, startMinute, scheduleLength) {
        this.startHour = startHour;
        this.startMinute = startMinute;
        this.scheduleLength = scheduleLength;
    }
}

function AddToDisableList(startHour, startMinute, scheduleLength) {
    let newItem = new DisableScheduleItem(startHour, startMinute, scheduleLength);
    disabledScheduleList.push(newItem);
}

/* -------------------------------------------------------------------------- */
/*                      Resumo das Informações do Cliente                     */
/* -------------------------------------------------------------------------- */

function UpdateClientSummaryInfo() {
    const EL_SUM_CLIENT_DATE = document.querySelector("#summary-client-date");
    const EL_SUM_CLIENT_SERVICES = document.getElementById("summary-info-service");
    let summary = document.getElementById("summary-schedule");
    
    EL_SUM_CLIENT_DATE.innerHTML = scheduledDay + " " + monthNames[scheduledMonth] + ", " + scheduledYear;
    summary.innerText = (data_time.replace(':', 'H') + " - " + format.valueToTime(data_minute));
    EL_SUM_CLIENT_SERVICES.innerText = filterSelectedServices(true);
}

document.getElementById("btn-finish-schedule").addEventListener('click', function() {
    let date = '';
    date += scheduledYear + '-';
    date += format.DoubleDigitsInt(scheduledMonth + 1) + '-';
    date += format.DoubleDigitsInt(scheduledDay);

    let date_serviceL = '';
    date_serviceL = filterSelectedServices(false);

    let scheduleSelected = data_time.split(':');
    let scheduleBeginsAt = parseFloat(scheduleSelected[0]);
    let scheduleMinute = 0;
    if (scheduleSelected[1] == "00" || scheduleSelected[1] == "0" || scheduleSelected[1] == "60") {scheduleMinute = 0 } else
    if (scheduleSelected[1] == "15") {scheduleMinute = 1 } else
    if (scheduleSelected[1] == "30") {scheduleMinute = 2 } else
    if (scheduleSelected[1] == "45") {scheduleMinute = 3 }

    API_CreateClient(clientName, scheduleBeginsAt, scheduleMinute, data_minute, date_serviceL, data_totalPrice, clientPhone, clientEmail, clientInstagram, date, selectedBarber);
    // DisplayWindow(false, false);
})

function filterSelectedServices(removeComma) {
    let service = new Array;
    
    for (let index = 0; index < service_list.length; index++) {
        if (chosenServiceList[index] != undefined) {
            service.push(service_list[index][0]);
        }
    }

    if (removeComma) {
        let serviceText = '';
        serviceText = service.toString().replace(/,/g, '\n');
        return serviceText;
    } else {
        let serviceText = '';
        serviceText = service.toString().replace(/,/g, ',')
        return serviceText;
    }
    
}

//  || Utilidades    ---------------------------------------------------------------------------
function ClearClientForms() {
    scheduledDay = 0;
    scheduledMonth = GetMonth(false);
    scheduledYear = currentYear;
    clientName = '';
    clientPhone = '';
    clientEmail = '';
    clientInstagram = '';
    data_time = '';
    
    IN_CLIENT_NAME.value = '';
    INPUT_PHONE.value = '';
    IN_CLIENT_EMAIL.value = '';
    INPUT_INSTAGRAM.value = '';

    format.addClassArray(warningMsg, "d-none");
    format.removeClassArray(EL_CALENDAR_DAY, "selected-day");
}

/* -------------------------------------------------------------------------- */
/*                                 AREA TESTE                                 */
/* -------------------------------------------------------------------------- */

async function API_CreateClient(Name, ScheduleStart, ScheduleMinute, ScheduleDuration, Service, Value, Phone, Email, Instagram, Date, BarberID) {
    let jsonRequest = JSON.stringify({
        id: 0,
        name: Name,
        scheduleStart: ScheduleStart,
        scheduleMinute: ScheduleMinute,
        scheduleDuration: ScheduleDuration,
        service: Service,
        value: Value,
        phone: Phone,
        email: Email,
        instagram: Instagram,
        date: Date,
        shopID: shopId,
        barberID: BarberID
    }, null);

    console.log(jsonRequest);
    MakeRequest('/ajax/clients/', 'post', jsonRequest);
}

async function LoadServiceList(date) {
    var scheduleList = await LoadScheduleTableData(date);
    scheduleList.forEach(schedule => {
        AddToDisableList(schedule.horaInicio, schedule.minuto, schedule.duracao);
    });
}

// Carregar Lista de horarios ocupados
async function LoadScheduleTableData(date) {
    let params = '?date=' + date
    let request = await MakeRequest('/ajax/clients' + params, 'get')

    console.log(request);
    return request
}

/* -------------------------------------------------------------------------- */
/*                          Iniciar Funções da Página                         */
/* -------------------------------------------------------------------------- */
startEverthing()

async function startEverthing() {
    await LoadShopConfig(1)
    shiftCalendarDays();
}

async function LoadShopConfig() {
    let params = '?ShopID=' + shopId
    let shopConfig = await MakeRequest('/ajax/shop/config' + params, 'get')

    let abreAsParsed = shopConfig.AbreAs.split(":");
    ShopOpensAt = abreAsParsed[0];
    
    let fechaAsParsed = shopConfig.FechaAs.split(":");
    ShopClosesAt = fechaAsParsed[0];  

    // Carregar quais dias a Barbearia abre ou não
    // Se não está presente na configuração da Barbearia, o dia será desabilitado
    storeWorkDays = [1, 1, 1, 1, 1, 1, 1]; // domingo a segunda
    if (!shopConfig.DiasDeTrabalho.includes("dom"))
        storeWorkDays[0] = 0
    if (!shopConfig.DiasDeTrabalho.includes("seg"))
        storeWorkDays[1] = 0
    if (!shopConfig.DiasDeTrabalho.includes("ter"))
        storeWorkDays[2] = 0
    if (!shopConfig.DiasDeTrabalho.includes("qua"))
        storeWorkDays[3] = 0
    if (!shopConfig.DiasDeTrabalho.includes("qui"))
        storeWorkDays[4] = 0
    if (!shopConfig.DiasDeTrabalho.includes("sex"))
        storeWorkDays[5] = 0
    if (!shopConfig.DiasDeTrabalho.includes("sab"))
        storeWorkDays[6] = 0

    // Qual é o primeiro dia da semana a ser exibido no calendario
    switch (shopConfig.PrimeiroDiaDaSemana) {
        default:
            shiftCalendarColumn = 0;
            break;
        case "seg":
            shiftCalendarColumn = 1;
            break;
        case "ter":
            shiftCalendarColumn = 2;
            break;
        case "qua":
            shiftCalendarColumn = 3;
            break;
        case "qui":
            shiftCalendarColumn = 4;
            break;
        case "sex":
            shiftCalendarColumn = 5;
            break;
        case "sab":
            shiftCalendarColumn = 6;
            break;
    }
    
    // Desabilitar dias de folga
    for (let column = 0; column < storeWorkDays.length; column++) {
        if (storeWorkDays[column] == 0) {
            disableEntireColumn(column)
        }
    }
}