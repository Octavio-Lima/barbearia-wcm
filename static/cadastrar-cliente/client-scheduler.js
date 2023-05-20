/* Gerenciado das Sub-Modais, como o 
calendario, lista de serviços, etc */ 
import * as format from "../geral/js/formating.js"; // text and number formating
import { selectedBarber, shop_id, shop_workDays, shop_opensAt, shop_closesAt, shop_firstWeekDayNumber } from "/static/cadastrar-cliente/main.js"; // text and number formating
import { MakeRequest } from "/static/geral/js/request.js" ;

// * Calendario
export let isNextMonth = false;
let hasShiftedCalendar = false;
let shiftCalendarColumn = 0; // 0 = domingo, 1 = segunda, 2 = ...
let dateTitle; // Titulo que possui uma data (30 junho, 2023)

const DATE = new Date();
const CURRENT_YEAR = DATE.getFullYear();

const PREV_MONTH = document.querySelector("#current-month");
const NEXT_MONTH = document.querySelector("#next-month");
const CALENDAR_DAY_LIST = document.querySelectorAll(".calendar-day");
const MONTH_NAMES = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", 
"JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"]

// * Tela de Serviço
let serviceList = [];

// * Janela de Agendamento de Horario
let scheduleEntryList;
let disabledScheduleEntryList = []
let hasUpdatedScheduleTable = false;

// * Dados do Agendamneto
export let schedule_day = 0;
let schedule_month;
let schedule_year;
let schedule_name;
let schedule_phone;
let schedule_email;
let schedule_instagram;
let schedule_services;
let schedule_time = "";
let schedule_duration = 0;
let schedule_totalPrice = 0;

/* -------------------------------------------------------------------------- */
/*                                 Sub-Modais                                 */
/* -------------------------------------------------------------------------- */
/* ------------------------------- Calendario ------------------------------- */
// Seleção do dia
CALENDAR_DAY_LIST.forEach(day => {
    day.addEventListener("click", () => {
        // desmarcar todos os dias, e marcar como selecionado o dia correto
        CALENDAR_DAY_LIST.forEach(unselectDay => { unselectDay.classList.remove("selected-day"); });
        day.classList.add("selected-day");
    
        // Gravar o dia, mês e ano selecionado
        schedule_day = parseInt(day.innerText, 10);
        schedule_month = GetMonth(isNextMonth);
        schedule_year = GetMonthYear();
    })
});

// Botões de Selecionar Meses
PREV_MONTH.addEventListener('click', () => { UpdateCalendar(false); })
NEXT_MONTH.addEventListener('click', () => { UpdateCalendar(true); })

/* -------------------------- Funções do Calendario ------------------------- */
// Atualizar todas as informações do calendario como o header e dias disponiveis
export function UpdateCalendar(showNextMonth) {
    // Corrigir a ordem do calendario
    shiftCalendarColumn = shop_firstWeekDayNumber;
    ShiftCalendarDays();

    // Header do Calendario
    let calendarTitle = document.querySelector("#month-name");
    let month = GetMonth(showNextMonth);
    let year = GetMonthYear();
    
    calendarTitle.innerText = MONTH_NAMES[month] + ", " + year;
    
    // Dias do calendario
    let difference = shiftCalendarColumn - 7;
    let firstMonthDay = GetMonthFirstDay(showNextMonth) - shiftCalendarColumn;
    let lastMonthDay = GetMonthLastDay(showNextMonth);

    // Calculo que altera qual é o primeiro dia da semana no calendario
    let shiftedFirstMonthDay = ((firstMonthDay < 0) ? (firstMonthDay + (shiftCalendarColumn - difference)) : firstMonthDay);
    
    // Aplicar a alteração de ordem dos dias
    for (let daySlot = 0; daySlot < 42; daySlot++) {
        if (daySlot < shiftedFirstMonthDay) {
            CALENDAR_DAY_LIST[daySlot].innerText = "";
        }
        if (daySlot >= shiftedFirstMonthDay) {
            CALENDAR_DAY_LIST[daySlot].innerText = daySlot - shiftedFirstMonthDay + 1;
        }
        if (daySlot > lastMonthDay + shiftedFirstMonthDay - 1) {
            CALENDAR_DAY_LIST[daySlot].innerText = "";
        }
    }

    // Desabilitar dias de folga
    let index = 0;
    for (const [key] of Object.entries(shop_workDays)) {
        if (shop_workDays[key] == false) {
            DisableBreakDays(index)
        } 
        index++;
    }

    // Disponibilidade dos dias
    if (showNextMonth) {
        // o mês adiante deve ser possível selecionar todos os dias
        EnableAllDays();
        isNextMonth = true;
        PREV_MONTH.classList.remove("hide-arrow");
        NEXT_MONTH.classList.add("hide-arrow");
    } else {
        // o mês atual deve ser possível selecionar a partir do dia atual
        DisablePastDays();
        isNextMonth = false;
        PREV_MONTH.classList.add("hide-arrow");
        NEXT_MONTH.classList.remove("hide-arrow");
    }
}

function DisablePastDays() {
    // desmarcar o dia seleciondo 
    CALENDAR_DAY_LIST.forEach(day => { day.classList.remove('selected-day'); })
    schedule_day = 0;

    /* calculo complicado !!!
    calcula os dias anteriores a serem desabilitados*/ 
    let underflow = (GetMonthFirstDay(false) - shiftCalendarColumn) < 0;
    let today = ((DATE.getDate() - 1) + GetMonthFirstDay(false) - shiftCalendarColumn);
    let correctIndex = (underflow ? today + 7 : today)
    for (let daySlot = 0; daySlot < correctIndex; daySlot++) {
        CALENDAR_DAY_LIST[daySlot].classList.add("disabled-day");
    }
}

function EnableAllDays() {
    // habilita todos os dias, pois é o mês que vem
    CALENDAR_DAY_LIST.forEach(day => { 
        day.classList.remove('selected-day'); 
        day.classList.remove('disabled-day'); 
    })

    // desmarcar o dia selecionado
    schedule_day = 0;
}

// Desabilita dias de folga
function DisableBreakDays(day) {
    for (let column = 0; column < 6; column++) {
        let columnSlot = -shiftCalendarColumn + day + (column * 7);
        if (columnSlot < 0) {
            CALENDAR_DAY_LIST[columnSlot + 7].classList.add("unavailable-day");
        } else {
            CALENDAR_DAY_LIST[columnSlot].classList.add("unavailable-day");
        }
    }

    // desmarcar todos os dias selecionados
    CALENDAR_DAY_LIST.forEach(day => { day.classList.remove("selected-day"); });
}

// Muda a ordem do dia do calendario, muda qual o primeiro dia da semana
function ShiftCalendarDays() {
    if (hasShiftedCalendar) {
        return;
    }

    const EL_CALENDAR_DAY_HEADER = document.querySelectorAll(".calendar-header")

    // Muda o header do calendario para que o primeiro dia da semana seja o dia correto
    // obter header do calendario original
    let headerColumn = new Array();
    for (let column_ = 0; column_ < 7; column_++) { 
        headerColumn[column_] = EL_CALENDAR_DAY_HEADER[column_];
    }

    // criado header correto
    const column = headerColumn.splice(0, shiftCalendarColumn);
    for (let i = 0; i < column.length; i++) {
        headerColumn.push(column[i]);
    }

    // aplicar nomes corretos ao cabeçario do calendario
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

// Funções de datas
function GetMonthFirstDay(getNextMonthsFirstDay) {
    // Se o mês que vem for janeiro, deve usar o ano novo
    let year = (GetMonth(true) == 0 ? CURRENT_YEAR + 1 : CURRENT_YEAR);

    if (getNextMonthsFirstDay) {
        return new Date(year, GetMonth(true), 1).getDay();
    } else {
        return new Date(CURRENT_YEAR, GetMonth(false), 1).getDay();
    }
}

function GetMonthLastDay(getNextMonthsTotalDay) {
    // Se o mês que vem for janeiro, deve usar o ano novo
    let year = (GetMonth(true) == 0 ? CURRENT_YEAR + 1 : CURRENT_YEAR);

    if (getNextMonthsTotalDay) {
        return new Date(year, GetMonth(true) + 1, 0).getDate();
    } else {
        return new Date(CURRENT_YEAR, GetMonth(false) + 1, 0).getDate();
    }
}

function GetMonth(returnNextMonth) {    
    let currentMonth = DATE.getMonth();

    if (returnNextMonth) {
         // o maximo de meses são 11, se for maior volta pra 0
        return (currentMonth + 1 >= 12 ? 0 : currentMonth + 1);
    } else {
        return currentMonth;
    }
}

function GetMonthYear() {
    // Se o próximo mês for janeiro, deve retornar o ano seguinte
    return (GetMonth(true) == 0 ? CURRENT_YEAR + 1 : CURRENT_YEAR);
}

/* -------------------------------------------------------------------------- */
/*                           INFORMAÇÕES DO CLIENTE                           */
/* -------------------------------------------------------------------------- */
/* ---------------------- Corrigir Inputs em tempo real --------------------- */
const INPUT_INSTAGRAM = document.querySelector("#input-client-instagram");
const INPUT_PHONE = document.querySelector("#input-client-phone");

// corrigir input do numero de celular
INPUT_PHONE.addEventListener("keydown", (event) => {
    let value = INPUT_PHONE.value;
    let input = event.key;
    let keyCode = event.keyCode;

    // Letras, e outros caracteres que deverá ignorar
    if ((keyCode >= 58 && keyCode <= 90) || (keyCode >= 106)) {
        event.preventDefault();
    }
    
    // Numeros
    if ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105)) {
        event.preventDefault();
        value += input;
    }

    // Remover tudo menos numeros
    value = value.replace(/\D/g, '');
    value = value.substring(0, 11);

    // Adicionar enfeites
    let length = value.length;
    if (length == 0) {
        value = value;
    } else if (length < 3) {
        value = '(' + value;
    } else if (length < 8) {
        value = '(' + value.substring(0, 2) + ') ' + value.substring(2, 7);
    } else {
        value = '(' + value.substring(0, 2) + ') ' + value.substring(2, 7) + '-' + value.substring(7, 11);
    }

    INPUT_PHONE.value = value;
    schedule_phone = value.replace(/\D/g, '');
})

// corrigir input do instagram
INPUT_INSTAGRAM.addEventListener("keyup", () => {
    let input = INPUT_INSTAGRAM.value;
    if (input.length > 0 && !input.includes("@")) {
        input = "@" + input
    }
    
    INPUT_INSTAGRAM.value = input;
})

/* -------------------------------------------------------------------------- */
/*                              LISTA DE SERVIÇOS                             */
/* -------------------------------------------------------------------------- */
let chosenServiceList = new Array();
const EL_TOTAL_TIME = document.getElementById("total-time");
const EL_TOTAL_PRICE = document.getElementById("total-price");
chosenServiceList.length = 0 /*service_list.length original was 0*/;

function ManageServiceList(entry) {
    let entry_id = parseInt(entry.id, 10);
    
    if (entry.classList.contains("selected")) {
        // Quando é des-selecionado
        entry.classList.remove("selected");
        chosenServiceList[entry_id] = undefined;

        schedule_duration -= serviceList[entry_id].duration;
        schedule_totalPrice -= serviceList[entry_id].value;
    } else {
        // Quando é selecionado
        entry.classList.add("selected");
        chosenServiceList[entry_id] = 'selected';

        schedule_duration += serviceList[entry_id].duration;
        schedule_totalPrice += serviceList[entry_id].value;
    }
    
    // Atualizar a soma de tempo e valor total
    EL_TOTAL_TIME.innerHTML = format.valueToTime(schedule_duration);
    EL_TOTAL_PRICE.innerHTML = format.numberToPrice(schedule_totalPrice);
}

function updateServiceTitle() {
}

// Atualizar a Tabela de serviços e produtos
export async function UpdateServiceTable() {
    // Atualiza o titulo da tela de serviço
    const service_title = document.querySelector("#service-title");
    dateTitle = schedule_day + " " + MONTH_NAMES[schedule_month] + ", " + schedule_year;
    service_title.innerText = dateTitle;

    const table = document.querySelector("#service-table");

    // Resetar Dados
    schedule_duration = 0
    schedule_totalPrice = 0
    serviceList = []
    
    EL_TOTAL_TIME.innerHTML = format.valueToTime(schedule_duration);
    EL_TOTAL_PRICE.innerHTML = format.numberToPrice(schedule_totalPrice);

    // Limpar tabela
    table.innerHTML = '';
    
    // Lista de Serviço
    // Obter dados
    let params = '?shopId=' + shop_id + '&barberId=' + selectedBarber;
    let requestServiceList = await MakeRequest('/ajax/users/barber/config' + params, 'get');
    let newServiceList = JSON.parse(requestServiceList.services);

    params = '?shopId=' + shop_id;
    let requestProductList = await MakeRequest('/ajax/shop/config/products' + params, 'get')
    let productList = JSON.parse(requestProductList.products)

    // Id de cada lançamento na tabela
    let entryId = 0

    // Criar lista de serviços
    newServiceList.forEach(service => {
        table.appendChild(CreateServiceElement(service.name, service.value, entryId, service.duration));
        serviceList.push(service); // lista para calculos
        entryId++;
    });

    // Criar lista de produtos
    productList.forEach(product => {
        table.appendChild(CreateServiceElement(product.name, product.value, entryId, 0))

        // * adicionar duração ao produto para que o calculo fique correto
        product['duration'] = 0;
        serviceList.push(product);
        entryId++;
    });
}

function CreateServiceElement(service, price, id, time) {
    let tableRow = document.createElement("tr");
    tableRow.addEventListener("click", () => { ManageServiceList(tableRow); })
    tableRow.classList.add("service-entry");
    tableRow.id = id;

    let serviceName = document.createElement("td");
    serviceName.classList.add("service-name");
    serviceName.innerHTML = service;
    serviceName.classList.add("col-3");
    
    let servicePrice = document.createElement("td");
    servicePrice.classList.add("service-price");
    servicePrice.innerHTML = format.numberToPrice(price);
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
function SelectScheduleEntry (entry) {
    if (!entry.classList.contains("unavailable")) {
        scheduleEntryList.forEach(schedule => { schedule.classList.remove("unavailable") });
        scheduleEntryList.forEach(schedule => { schedule.classList.remove("selected") });
        entry.classList.add("selected");
        schedule_time = entry.firstChild.innerHTML;
    }
}

// Atualiza a lista de horario assim que a janela for aberta
export async function UpdateSchedule() {
    // Criar horarios na tabela
    if (!hasUpdatedScheduleTable) {
        hasUpdatedScheduleTable = true;
        
        const SCHEDULE_TABLE = document.querySelector("#schedule-list");
        
        // Cria horario a partir do horario que a barbearia abre, e para no horario que fecha
        for (let i = shop_opensAt; i < shop_closesAt; i++) {
            SCHEDULE_TABLE.append(CreateScheduleTime(i, 0));
            SCHEDULE_TABLE.append(CreateScheduleTime(i, 15));
            SCHEDULE_TABLE.append(CreateScheduleTime(i, 30));
            SCHEDULE_TABLE.append(CreateScheduleTime(i, 45));
        }

        scheduleEntryList = document.querySelectorAll('.schedule-entry');
    }

    // Definir titulo da janela. Dia, mês e ano
    const SCHEDULE_TITLE = document.querySelector("#schedule-title");
    SCHEDULE_TITLE.innerText = dateTitle;
    
    // Limpa a tabela de marcações, e mostra todos os horarios disponiveis
    scheduleEntryList.forEach(schedule => {
        schedule.classList.remove('unavailable');
        schedule.classList.remove('row-unav');
        schedule.classList.remove("row-unav-cuz-dumb"); 
    })

    // limpar lista de horarios desabilitados
    disabledScheduleEntryList.length = 0;
    
    // carregar lista de agenda disponivel
    let date = schedule_year + '-' + format.DoubleDigitsInt(schedule_month + 1) + '-' + format.DoubleDigitsInt(schedule_day);  
    let params = '?date=' + date
    scheduleEntryList = await MakeRequest('/ajax/clients' + params, 'get')

    scheduleEntryList.forEach(schedule => {
        AddToDisableList(schedule.horaInicio, schedule.minuto, schedule.duracao);
    });

    // Marcar os horarios listados como ocupados
    disabledScheduleEntryList.forEach(schedule => {
        /* Desativa também os horarios anteriores ao horario a ser cancelado
        Isso evita que um horario fique por cima do outro*/
        let correctIndex = (((schedule.startHour * 4) + schedule.startMinute) - (shop_opensAt * 4));
        for (let index = correctIndex - (schedule_duration - 1); index < correctIndex; index++) {
            if (index >= 0) {
                scheduleEntryList[index].classList.add("unavailable");
                scheduleEntryList[index].classList.add("row-unav"); 
                scheduleEntryList[index].classList.add("row-unav-cuz-dumb"); 
            }
        }

        // Desativa os horarios normais
        DisableSchedule(schedule.startHour, schedule.startMinute, schedule.scheduleLength)
    });

    /* Desativa a opção de marcar no fim do dia se o horario agendado 
    exceder o horario que a barbearia fecha */
    let correctClosedHour = ((shop_closesAt - shop_opensAt) * 4);
    for (let index = correctClosedHour - (schedule_duration - 1); index < correctClosedHour; index++) {
        scheduleEntryList[index].classList.add("unavailable");
        scheduleEntryList[index].classList.add("row-unav"); 
        scheduleEntryList[index].classList.add("row-unav-cuz-dumb"); 
    }
}

function CreateScheduleTime(time, minute) {
    let entry = document.createElement("tr");
    entry.classList.add("schedule-entry");
    entry.addEventListener("click", () => { SelectScheduleEntry(entry) })
    
    let sch_time = document.createElement("td");
    sch_time.innerText = (format.DoubleDigitsInt(time) + ":" + format.DoubleDigitsInt(minute));
    sch_time.classList.add("col-1");
    entry.append(sch_time);
    
    let sch_description = document.createElement("td");
    sch_description.innerText = (" - HORÁRIO INDISPONÍVEL");
    sch_description.classList.add("opacity-0");
    sch_description.classList.add("col-6");
    sch_description.classList.add("text-start");
    entry.append(sch_description);
    
    return entry;
}

// Desabilitar horarios
function DisableSchedule(startHour, startMinute, scheduleLength) {
    let correctIndex = ((startHour * 4) + startMinute) - (shop_opensAt * 4);
    let entries = [];
    
    // evita que numeros errados façam alguma coisa
    if (correctIndex < 0 || correctIndex > scheduleEntryList.length) {
        return;
    }

    // Desmarcar todos os horarios
    scheduleEntryList.forEach(schedule => {
        schedule.classList.remove("selected");
    })

    for (let i = 0; i < scheduleLength; i++) {
        let j = correctIndex + i
        entries[i] = scheduleEntryList[j];
    }

    for (let i = 0; i < scheduleLength; i++) {
        let indexToChance = correctIndex + i;
        if (indexToChance < scheduleEntryList.length) {
            scheduleEntryList[indexToChance].classList.add("unavailable");
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
    disabledScheduleEntryList.push(newItem);
}

/* -------------------------------------------------------------------------- */
/*                      Resumo das Informações do Cliente                     */
/* -------------------------------------------------------------------------- */
export function UpdateClientSummaryInfo() {
    const EL_SUM_CLIENT_DATE = document.querySelector("#summary-client-date");
    const EL_SUM_CLIENT_SERVICES = document.getElementById("summary-info-service");
    let summary = document.getElementById("summary-schedule");
    
    EL_SUM_CLIENT_DATE.innerHTML = dateTitle;
    EL_SUM_CLIENT_SERVICES.innerText = filterSelectedServices(true);
    summary.innerText = (schedule_time.replace(':', 'H') + " - " + format.valueToTime(schedule_duration));
}

document.getElementById("btn-finish-schedule").addEventListener('click', function() {
    let date = '';
    date += schedule_year + '-';
    date += format.DoubleDigitsInt(schedule_month + 1) + '-';
    date += format.DoubleDigitsInt(schedule_day);

    let date_serviceL = '';
    date_serviceL = filterSelectedServices(false);

    let scheduleSelected = schedule_time.split(':');
    let scheduleBeginsAt = parseFloat(scheduleSelected[0]);
    let scheduleMinute = 0;
    if (scheduleSelected[1] == "00" || scheduleSelected[1] == "0" || scheduleSelected[1] == "60") {scheduleMinute = 0 } else
    if (scheduleSelected[1] == "15") {scheduleMinute = 1 } else
    if (scheduleSelected[1] == "30") {scheduleMinute = 2 } else
    if (scheduleSelected[1] == "45") {scheduleMinute = 3 }

    API_CreateClient(schedule_name, scheduleBeginsAt, scheduleMinute, schedule_duration, date_serviceL, schedule_totalPrice, schedule_phone, schedule_email, schedule_instagram, date, selectedBarber);
    // DisplayModal(false, true);
})

function filterSelectedServices(removeComma) {
    let service = new Array;
    
    for (let index = 0; index < serviceList.length; index++) {
        if (chosenServiceList[index] != undefined) {
            service.push(serviceList[index][0]);
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
export function ClearClientForms() {
    const IN_CLIENT_NAME = document.querySelector("#input-client-name");
    const IN_CLIENT_EMAIL = document.querySelector("#input-client-email");

    schedule_day = 0;
    schedule_month = GetMonth(false);
    schedule_year = CURRENT_YEAR;
    schedule_name = '';
    schedule_phone = '';
    schedule_email = '';
    schedule_instagram = '';
    schedule_time = '';
    
    IN_CLIENT_NAME.value = '';
    INPUT_PHONE.value = '';
    IN_CLIENT_EMAIL.value = '';
    INPUT_INSTAGRAM.value = '';

    format.addClassArray(warningMsg, "d-none");
    format.removeClassArray(CALENDAR_DAY_LIST, "selected-day");
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