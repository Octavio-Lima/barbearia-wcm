/* Gerenciado das Sub-Modais, como o
calendario, lista de serviços, etc */
import { MakeRequest } from "../../../geral/js/utility.js";
import * as Format from "../../../geral/js/formating.js";
import { selectedBarber, shop_id, shop_workDays, shop_opensAt, shop_closesAt, shop_firstWeekDayNumber } from "./cadastrar-cliente.js"; // text and number formating
import { Modal, warningMsg } from "./cadastrar-cliente-janelas.js"; // text and number formating
/* #region  Variáveis */
// * Calendario
export let isNextMonth = false;
let hasShiftedCalendar = false;
const DATE = new Date();
const PREV_MONTH = document.querySelector("#current-month");
const NEXT_MONTH = document.querySelector("#next-month");
const CALENDAR_DAY_LIST = document.querySelectorAll(".calendar-day");
const MONTH_NAMES = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
    "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
// * Tela de informações do cliente
const INPUT_INSTAGRAM = document.querySelector("#input-client-instagram");
const INPUT_PHONE = document.querySelector("#input-client-phone");
const INPUT_NAME = document.querySelector("#input-client-name");
const INPUT_EMAIL = document.querySelector("#input-client-email");
// * Tela de Serviço
let serviceList;
const TIME = new Format.Time();
const SERVICE_TOTAL_TIME = document.getElementById("total-time");
const SERVICE_TOTAL_PRICE = document.getElementById("total-price");
// * Janela de Agendamento de Horario
let scheduleEntryList;
let scheduleBlockList;
let hasUpdatedScheduleTable = false;
// * Dados do Agendamneto
export let schedule_day = 0;
let schedule_date = new Date();
let schedule_clientName = '';
let schedule_phone = '';
let schedule_email = '';
let schedule_instagram = '';
export let schedule_services;
export let schedule_time = '';
let schedule_duration = '';
let schedule_totalPrice = 0;
let schedule_dateTitle = '';
// * Botões de confirmar informação da sub-modal
const CONFIRM_USER_INFO = document.querySelector('#confirm-user-info');
const CONFIRM_SCHEDULE = document.querySelector("#btn-finish-schedule");
/* #endregion */
/* #region  Calendario */
/* -------------------------------------------------------------------------- */
/*                                 Calendario                                 */
/* -------------------------------------------------------------------------- */
// Função de selecionar dia no calendario
CALENDAR_DAY_LIST.forEach(day => {
    day.addEventListener("click", () => {
        // desmarcar todos os dias, e marcar como selecionado o dia correto
        CALENDAR_DAY_LIST.forEach(unselectDay => { unselectDay.classList.remove("selected-day"); });
        day.classList.add("selected-day");
        // Gravar o dia, mês e ano selecionado
        schedule_day = parseInt(day.innerHTML);
        schedule_date.setFullYear(GetMonthYear());
        schedule_date.setMonth(GetMonth(isNextMonth));
        schedule_date.setDate(schedule_day);
        // Definir titulo usado nas demais submodais
        schedule_dateTitle = `${schedule_date.getDate()} ${MONTH_NAMES[schedule_date.getMonth()]}, ${schedule_date.getFullYear()}`;
    });
});
// Botões de Selecionar Meses no calendario
PREV_MONTH.addEventListener('click', () => { UpdateCalendar(false); });
NEXT_MONTH.addEventListener('click', () => { UpdateCalendar(true); });
/* -------------------------- Funções do Calendario ------------------------- */
// Atualizar todas as informações do calendario como o header e dias disponiveis
export function UpdateCalendar(showNextMonth) {
    isNextMonth = showNextMonth;
    // resetar dia selecionado
    schedule_day = 0;
    // Atualizar cabeçalho do Calendario
    let month = MONTH_NAMES[GetMonth(isNextMonth)];
    let year = GetMonthYear();
    document.querySelector("#month-name").innerHTML = `${month}, ${year}`;
    if (!hasShiftedCalendar) {
        // Corrigir a ordem do calendario
        ShiftCalendarHeader();
        // Preencher dias no calendario
        FillCalendarDays();
        // Desabilitar dias de folga
        let index = 0;
        for (const [key] of Object.entries(shop_workDays)) {
            if (shop_workDays[key] == false) {
                DisableBreakDays(index);
            }
            index++;
        }
    }
    // Gerenciar o estado dos dias no calendario
    CALENDAR_DAY_LIST.forEach((day, index) => {
        // desmarcar o dia seleciondo
        day.classList.remove('selected-day');
        // Calculo para desativar dias anteriores no calendario
        let calendarUnderflow = (GetMonthFirstDay(false) - shop_firstWeekDayNumber) < 0;
        let today = (DATE.getDate() + GetMonthFirstDay(false) - shop_firstWeekDayNumber) - 1;
        let daysToDisable = (calendarUnderflow ? (today + 7) : today);
        if (isNextMonth) {
            // Se for o mês que vem, ativar todos os dias
            day.classList.remove('disabled-day');
        }
        else {
            // Se for o mês passado, desativar os dias anteriores do dia atual
            // Os calculos levam em consideração que os dias no calendario podem ser reordenados
            if (index < daysToDisable) {
                day.classList.add("disabled-day");
            }
        }
    });
    // Alterar exibição do botão de alterar meses
    if (isNextMonth) {
        // Esconder botão de próximo mês
        PREV_MONTH.classList.remove("hide-arrow");
        NEXT_MONTH.classList.add("hide-arrow");
    }
    else {
        // Esconder botão de mês atual
        PREV_MONTH.classList.add("hide-arrow");
        NEXT_MONTH.classList.remove("hide-arrow");
    }
}
// Preenche os numeros dos dias no calendario
function FillCalendarDays() {
    let monthFirstDay = GetMonthFirstDay(isNextMonth) - shop_firstWeekDayNumber;
    let monthLastDay = GetMonthLastDay(isNextMonth);
    // Calculo que altera qual é o primeiro dia da semana no calendario
    let difference = shop_firstWeekDayNumber - 7;
    let shiftedFirstDay = monthFirstDay + (shop_firstWeekDayNumber - difference);
    let correctFirstDay = ((monthFirstDay < 0) ? shiftedFirstDay : monthFirstDay);
    // Renumerar os dias no calendario para os numeros corretos
    CALENDAR_DAY_LIST.forEach((day, index) => {
        if (index >= correctFirstDay) {
            day.innerHTML = (index - correctFirstDay + 1).toString();
        }
        if (index < correctFirstDay || index > monthLastDay + correctFirstDay - 1) {
            day.innerHTML = "";
        }
    });
}
// Muda a ordem do cabeçalho do calendario, muda qual o primeiro dia da semana
function ShiftCalendarHeader() {
    const CALENDAR_HEADERS = document.querySelectorAll(".calendar-header");
    let correctHeader = [];
    // obter header do calendario original
    for (let day = 0; day < 7; day++) {
        correctHeader[day] = CALENDAR_HEADERS[day];
    }
    // reordernar para a ordem correta
    const correctOrder = correctHeader.splice(0, shop_firstWeekDayNumber);
    for (let i = 0; i < correctOrder.length; i++) {
        correctHeader.push(correctOrder[i]);
    }
    // Redefinir para a ordem nova no header
    const DAY_NAME = ['Dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
    CALENDAR_HEADERS.forEach((day, index) => {
        let correctIndex = index + shop_firstWeekDayNumber;
        if (correctIndex > 6) {
            day.innerHTML = DAY_NAME[correctIndex - 7];
        }
        else {
            day.innerHTML = DAY_NAME[correctIndex];
        }
    });
}
// Desabilita dias de folga
function DisableBreakDays(day) {
    for (let column = 0; column < 6; column++) {
        let columnSlot = -shop_firstWeekDayNumber + day + (column * 7);
        if (columnSlot < 0) {
            CALENDAR_DAY_LIST[columnSlot + 7].classList.add("unavailable-day");
        }
        else {
            CALENDAR_DAY_LIST[columnSlot].classList.add("unavailable-day");
        }
    }
}
// Funções de datas
function GetMonthFirstDay(getNextMonthsFirstDay) {
    // Se o mês que vem for janeiro, deve usar o ano novo
    let year = (GetMonth(true) == 0 ? DATE.getFullYear() + 1 : DATE.getFullYear());
    if (getNextMonthsFirstDay) {
        return new Date(year, GetMonth(true), 1).getDay();
    }
    else {
        return new Date(DATE.getFullYear(), GetMonth(false), 1).getDay();
    }
}
function GetMonthLastDay(getNextMonthsTotalDay) {
    // Se o mês que vem for janeiro, deve usar o ano novo
    let year = (GetMonth(true) == 0 ? DATE.getFullYear() + 1 : DATE.getFullYear());
    if (getNextMonthsTotalDay) {
        return new Date(year, GetMonth(true) + 1, 0).getDate();
    }
    else {
        return new Date(DATE.getFullYear(), GetMonth(false) + 1, 0).getDate();
    }
}
function GetMonth(returnNextMonth) {
    let currentMonth = DATE.getMonth();
    if (returnNextMonth) {
        // o maximo de meses são 11, se for maior volta pra 0
        return (currentMonth + 1 >= 12 ? 0 : currentMonth + 1);
    }
    else {
        return currentMonth;
    }
}
function GetMonthYear() {
    // Se o próximo mês for janeiro, deve retornar o ano seguinte
    return (GetMonth(true) == 0 ? DATE.getFullYear() + 1 : DATE.getFullYear());
}
/* #endregion */
/* #region  Informações do Cliente */
/* -------------------------------------------------------------------------- */
/*                           INFORMAÇÕES DO CLIENTE                           */
/* -------------------------------------------------------------------------- */
/* ---------------------- Corrigir Inputs em tempo real --------------------- */
// Corrigir input do numero de celular
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
    }
    else if (length < 3) {
        value = '(' + value;
    }
    else if (length < 8) {
        value = '(' + value.substring(0, 2) + ') ' + value.substring(2, 7);
    }
    else {
        value = '(' + value.substring(0, 2) + ') ' + value.substring(2, 7) + '-' + value.substring(7, 11);
    }
    INPUT_PHONE.value = value;
});
// Corrigir input do instagram
INPUT_INSTAGRAM.addEventListener("keyup", () => {
    let input = INPUT_INSTAGRAM.value;
    if (input.length > 0 && !input.includes("@")) {
        input = "@" + input;
    }
    INPUT_INSTAGRAM.value = input;
});
// Salvar informações das inputs
CONFIRM_USER_INFO.addEventListener("click", () => {
    schedule_clientName = INPUT_NAME.value;
    schedule_phone = INPUT_PHONE.value.replace(/\D/g, '');
    schedule_email = INPUT_EMAIL.value;
    schedule_instagram = INPUT_INSTAGRAM.value;
});
/* #endregion */
/* #region  Lista de Serviços */
/* -------------------------------------------------------------------------- */
/*                              LISTA DE SERVIÇOS                             */
/* -------------------------------------------------------------------------- */
function SelectServiceEntry(entry) {
    let service_duration = entry.querySelector('[data-duration]').getAttribute('data-duration');
    let service_id = parseInt(entry.id, 10);
    let service_valueParse = entry.querySelector('[data-value]').getAttribute('data-value');
    let service_value = (service_valueParse == null ? 0 : parseInt(service_valueParse));
    if (entry.classList.contains("selected")) {
        // Remove o serviço selecionado
        entry.classList.remove("selected");
        // Obter index do serviço a ser removido da lista
        let entryToRemove = schedule_services.indexOf(serviceList[service_id.toString()]);
        schedule_services.splice(entryToRemove, 1);
        // Subtrai tempo de duração e valor
        schedule_duration = TIME.subtract(schedule_duration, (service_duration ? service_duration : '00:00'));
        schedule_totalPrice -= service_value;
    }
    else {
        // Seleciona o serviço selecionado
        entry.classList.add("selected");
        schedule_services.push(serviceList[service_id]);
        // Adiciona tempo de duração e valor
        schedule_duration = TIME.sum(schedule_duration, (service_duration ? service_duration : '00:00'));
        schedule_totalPrice += service_value;
    }
    // Atualizar a soma de tempo e valor total
    SERVICE_TOTAL_TIME.innerText = schedule_duration.replace(":", "H ");
    SERVICE_TOTAL_PRICE.innerText = Format.ToCurrency(schedule_totalPrice);
}
// Atualizar a Tabela de serviços e produtos
export async function UpdateServiceTable() {
    // Atualiza o titulo da tela de serviço
    const service_title = document.querySelector("#service-title");
    service_title.innerHTML = schedule_dateTitle;
    const table = document.querySelector("#service-table");
    // Resetar Dados
    schedule_duration = "00H 00";
    schedule_totalPrice = 0;
    serviceList.length = 0;
    SERVICE_TOTAL_TIME.innerText = schedule_duration;
    SERVICE_TOTAL_PRICE.innerText = Format.ToCurrency(schedule_totalPrice);
    // Limpar tabela
    table.innerHTML = '';
    // Lista de Serviço
    // Obter dados
    let params = '?shopId=' + shop_id + '&barberId=' + selectedBarber;
    let requestServiceList = await MakeRequest('/ajax/users/barber/config' + params, 'get');
    let newServiceList = JSON.parse(requestServiceList.services);
    params = '?shopId=' + shop_id;
    let requestProductList = await MakeRequest('/ajax/shop/config/products' + params, 'get');
    let productList = JSON.parse(requestProductList.products);
    // Id de cada lançamento na tabela
    let entryId = 0;
    // Criar lista de serviços
    newServiceList.forEach((service) => {
        table.appendChild(CreateServiceElement(service.name, service.value, entryId, service.duration));
        serviceList.push(service); // lista para calculos
        entryId++;
    });
    // Criar lista de produtos
    productList.forEach((product) => {
        table.appendChild(CreateServiceElement(product.name, product.value, entryId, ''));
        // * adicionar duração ao produto para que o calculo fique correto
        product['duration'] = 0;
        serviceList.push(product);
        entryId++;
    });
}
function CreateServiceElement(name, value, id, duration) {
    let tableRow = document.createElement("tr");
    tableRow.addEventListener("click", () => { SelectServiceEntry(tableRow); });
    tableRow.classList.add("service-entry");
    tableRow.id = id.toString();
    let serviceName = document.createElement("td");
    serviceName.classList.add("service-name");
    serviceName.classList.add("col-3");
    serviceName.innerText = name;
    serviceName.setAttribute('data-name', name);
    let servicePrice = document.createElement("td");
    servicePrice.classList.add("service-price");
    servicePrice.classList.add("col-1");
    servicePrice.innerText = Format.ToCurrency(parseInt(value));
    servicePrice.setAttribute('data-value', value);
    let serviceTime = document.createElement("td");
    serviceTime.classList.add("service-time");
    serviceTime.classList.add("col-1");
    serviceTime.innerText = duration.replace(':', 'H ');
    serviceTime.setAttribute('data-duration', duration);
    tableRow.appendChild(serviceName);
    tableRow.appendChild(servicePrice);
    tableRow.appendChild(serviceTime);
    return tableRow;
}
/* #endregion */
/* #region  Horarios Disponíveis */
/* -------------------------------------------------------------------------- */
/*                            Horarios Disponiveis                            */
/* -------------------------------------------------------------------------- */
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
    SCHEDULE_TITLE.innerHTML = schedule_dateTitle;
    // Limpa a tabela de marcações, e mostra todos os horarios disponiveis
    scheduleEntryList.forEach(schedule => {
        schedule.classList.remove('unavailable');
        schedule.classList.remove('row-unav');
        schedule.classList.remove("row-unav-cuz-dumb");
    });
    // limpar lista de horarios desabilitados
    scheduleBlockList.length = 0;
    // carregar lista de agenda disponivel
    let date = `${schedule_date.getFullYear()}-${Format.PadNumber(schedule_date.getMonth() + 1)}-${Format.PadNumber(schedule_date.getDate())}`;
    let params = '?date=' + date;
    let scheduleList = await MakeRequest('/ajax/clients' + params, 'get');
    // Preencher lista de horarios a bloquear
    scheduleList.forEach((schedule) => {
        let newItem = { 'startHour': schedule.horaInicio, 'startMinute': schedule.minuto, 'scheduleLength': schedule.duracao };
        scheduleBlockList.push(newItem);
    });
    // Bloquear os horarios já agendados
    scheduleBlockList.forEach((schedule) => {
        /* Desativa também os horarios anteriores ao horario a ser cancelado
        Isso evita que um horario fique por cima do outro*/
        // calculo que identifica o index do agendamento na tabela
        let scheduleEnd = (((schedule.startHour * 4) + schedule.startMinute) - (shop_opensAt * 4));
        let scheduleStart = scheduleEnd - parseInt(schedule_duration) - 1;
        for (let i = scheduleStart; i < scheduleEnd; i++) {
            if (i >= 0) {
                scheduleEntryList[i].classList.add("unavailable");
                scheduleEntryList[i].classList.add("row-unav");
                scheduleEntryList[i].classList.add("row-unav-cuz-dumb");
            }
        }
        // Desativa os horarios normais
        DisableSchedule(schedule.startHour, schedule.startMinute, schedule.scheduleLength);
    });
    /* Desativa a opção de marcar no fim do dia se o horario agendado
    exceder o horario que a barbearia fecha */
    let correctClosedHour = ((shop_closesAt - shop_opensAt) * 4);
    for (let index = correctClosedHour - (parseInt(schedule_duration) - 1); index < correctClosedHour; index++) {
        scheduleEntryList[index].classList.add("unavailable");
        scheduleEntryList[index].classList.add("row-unav");
        scheduleEntryList[index].classList.add("row-unav-cuz-dumb");
    }
}
// Quando é clicado em um horario na lista de horarios
function SelectScheduleEntry(entry) {
    if (!entry.classList.contains("unavailable")) {
        // Desmarcar outros horarios
        scheduleEntryList.forEach(schedule => {
            schedule.classList.remove("unavailable");
            schedule.classList.remove("selected");
        });
        // Selecionar
        entry.classList.add("selected");
        const SCHEDULE_TIME = entry.querySelector(".entry-time");
        if (SCHEDULE_TIME)
            schedule_time = SCHEDULE_TIME.innerHTML;
    }
}
// Criar horario da tabela de horarios
function CreateScheduleTime(time, minute) {
    let entry = document.createElement("tr");
    entry.classList.add("schedule-entry");
    entry.addEventListener("click", () => { SelectScheduleEntry(entry); });
    let sch_time = document.createElement("td");
    sch_time.innerText = (Format.PadNumber(time) + ":" + Format.PadNumber(minute));
    sch_time.classList.add("entry-time");
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
    });
    for (let i = 0; i < scheduleLength; i++) {
        let j = correctIndex + i;
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
/* #endregion */
/* #region  Resumo Final */
/* -------------------------------------------------------------------------- */
/*                      Resumo das Informações do Cliente                     */
/* -------------------------------------------------------------------------- */
export function UpdateClientSummaryInfo() {
    const SCHEDULE_DATE = document.querySelector("#summary-client-date");
    const SCHEDULE_SUMMARY = document.querySelector("#summary-schedule");
    if (SCHEDULE_DATE && SCHEDULE_SUMMARY) {
        SCHEDULE_DATE.innerHTML = schedule_dateTitle;
        SCHEDULE_SUMMARY.innerHTML = `${schedule_time.replace(':', 'H ')} - ${schedule_duration.replace(":", "H")}`;
    }
    // const SCHEDULE_SERVICES = document.querySelector("#summary-info-service");
    // Definir a lista de serviços
    // let serviceText = '';
    // schedule_services.forEach(service => { serviceText += `${service.name} + \n`; });
    // SCHEDULE_SERVICES.innerText = serviceText;
}
CONFIRM_SCHEDULE.addEventListener('click', () => {
    // Preparar para agendar no banco de dados
    let jsonRequest = JSON.stringify({
        shopId: shop_id,
        barberId: selectedBarber,
        name: schedule_clientName,
        phone: schedule_phone,
        email: schedule_email,
        instagram: schedule_instagram,
        services: schedule_services,
        date: schedule_date,
        schedule: schedule_time,
        duration: schedule_duration,
        toPay: schedule_totalPrice
    }, null, 4);
    console.log(jsonRequest);
    MakeRequest('/ajax/clients/', 'post', jsonRequest);
    Modal.DisplayModal(false);
    ClearClientForms();
});
//  || Utilidades    ---------------------------------------------------------------------------
export function ClearClientForms() {
    // Anular todos os dados do agendamento
    schedule_day = 0;
    schedule_clientName = '';
    schedule_phone = '';
    schedule_email = '';
    schedule_instagram = '';
    schedule_services.length = 0;
    schedule_time = '';
    schedule_duration = '';
    schedule_totalPrice = 0;
    schedule_dateTitle = '';
    // Resetar inputs dos dados do cliente
    INPUT_NAME.value = '';
    INPUT_PHONE.value = '';
    INPUT_EMAIL.value = '';
    INPUT_INSTAGRAM.value = '';
    // Remover avisos, e remover itens selecionados
    warningMsg.forEach(message => { message.classList.add("d-none"); });
    CALENDAR_DAY_LIST.forEach(day => { day.classList.remove("selected-day"); });
}
/* #endregion */ 
