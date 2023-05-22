/* Gerenciado das Sub-Modais, como o 
calendario, lista de serviços, etc */ 
import * as Format from "../geral/js/formating.js";
import { selectedBarber, shop_id, shop_workDays, shop_opensAt, shop_closesAt, shop_firstWeekDayNumber } from "/static/cadastrar-cliente/main.js"; // text and number formating
import { MakeRequest } from "/static/geral/js/request.js";

// * Calendario
export let isNextMonth = false;
let hasShiftedCalendar = false;

const DATE = new Date();

const PREV_MONTH = document.querySelector("#current-month");
const NEXT_MONTH = document.querySelector("#next-month");
const CALENDAR_DAY_LIST = document.querySelectorAll(".calendar-day");
const MONTH_NAMES = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", 
"JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"]

// * Tela de informações do cliente
const INPUT_INSTAGRAM = document.querySelector("#input-client-instagram");
const INPUT_PHONE = document.querySelector("#input-client-phone");
const INPUT_NAME = document.querySelector("#input-client-name");
const INPUT_EMAIL = document.querySelector("#input-client-email");

// * Tela de Serviço
let serviceList = [];
const TIME = new Format.Time();

// * Janela de Agendamento de Horario
let scheduleEntryList;
let disabledScheduleEntryList = []
let hasUpdatedScheduleTable = false;

// * Dados do Agendamneto
export let schedule_date = new Date();
let schedule_clientName = '';
let schedule_phone = '';
let schedule_email = '';
let schedule_instagram = '';
let schedule_services = [];
let schedule_time = '';
let schedule_duration = '';
let schedule_totalPrice = 0;
let schedule_dateTitle = '';

// * Botões de confirmar informação da sub-modal
const CONFIRM_USER_INFO = document.querySelector('#confirm-user-info');
const CONFIRM_SCHEDULE = document.querySelector("#btn-finish-schedule")

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
        schedule_date.setDate(parseInt(day.innerText, 10));
        schedule_date.setMonth(GetMonth(isNextMonth));
        schedule_date.setFullYear(GetMonthYear());

        // Definir titulo usado nas demais submodais
        schedule_dateTitle = `${schedule_date.getDate()} ${MONTH_NAMES[schedule_date.getMonth()]}, ${schedule_date.getFullYear()}`;
    })
});

// Botões de Selecionar Meses no calendario
PREV_MONTH.addEventListener('click', () => { UpdateCalendar(false); })
NEXT_MONTH.addEventListener('click', () => { UpdateCalendar(true); })

/* -------------------------- Funções do Calendario ------------------------- */
// Atualizar todas as informações do calendario como o header e dias disponiveis
export function UpdateCalendar(showNextMonth) {
    isNextMonth = showNextMonth;

    // Cabeçalho do Calendario
    let month = MONTH_NAMES[GetMonth(isNextMonth)];
    let year = GetMonthYear();
    document.querySelector("#month-name").innerText = `${month}, ${year}`;

    if (!hasShiftedCalendar) {
        // Corrigir a ordem do calendario
        ShiftCalendarHeader();
    
        // Preencher dias no calendario
        FillCalendarDays();

        // Desabilitar dias de folga
        let index = 0;
        for (const [key] of Object.entries(shop_workDays)) {
            if (shop_workDays[key] == false) {
                DisableBreakDays(index)
            } 
            index++;
        }
    }

    // Disponibilidade dos dias baseado no mês
    if (isNextMonth) {
        // o mês adiante deve ser possível selecionar todos os dias
        EnableAllDays();
        PREV_MONTH.classList.remove("hide-arrow");
        NEXT_MONTH.classList.add("hide-arrow");
    } else {
        // o mês atual deve ser possível selecionar a partir do dia atual
        DisablePastDays();
        PREV_MONTH.classList.add("hide-arrow");
        NEXT_MONTH.classList.remove("hide-arrow");
    }
}

// Preenche dias no calendario
function FillCalendarDays() {
    let monthFirstDay = GetMonthFirstDay(isNextMonth) - shop_firstWeekDayNumber;
    let monthLastDay = GetMonthLastDay(isNextMonth);

    // Calculo que altera qual é o primeiro dia da semana no calendario
    let difference = shop_firstWeekDayNumber - 7;
    let shiftedFirstDay = monthFirstDay + (shop_firstWeekDayNumber - difference);
    let correctFirstDay = ((monthFirstDay < 0) ? shiftedFirstDay : monthFirstDay);
    
    // Renumerar os dias no calendario para os numeros corretos
    for (let day = 0; day < 42; day++) {
        if (day >= correctFirstDay) {
            CALENDAR_DAY_LIST[day].innerText = day - correctFirstDay + 1;
        }
        if (day < correctFirstDay || day > monthLastDay + correctFirstDay - 1) {
            CALENDAR_DAY_LIST[day].innerText = "";
        }
    }
}

// Muda a ordem do cabeçalho do calendario, muda qual o primeiro dia da semana
function ShiftCalendarHeader() {
    const CALENDAR_HEADERS = document.querySelectorAll(".calendar-header")
    let correctHeader = []

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
    const DAY_NAME = ['Dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']
    CALENDAR_HEADERS.forEach((day, index) => {
        let correctIndex = index + shop_firstWeekDayNumber;

        if (correctIndex > 6) {
            day.innerText = DAY_NAME[correctIndex - 7];
        } else {
            day.innerText = DAY_NAME[correctIndex];
        }
    });
}

function DisablePastDays() {
    // desmarcar o dia seleciondo 
    CALENDAR_DAY_LIST.forEach(day => { day.classList.remove('selected-day'); })
    schedule_date.setDate(0);

    // * calculo complicado
    // * calcula os dias anteriores a serem desabilitados
    let underflow = (GetMonthFirstDay(false) - shop_firstWeekDayNumber) < 0;
    let today = ((DATE.getDate() - 1) + GetMonthFirstDay(false) - shop_firstWeekDayNumber);
    let correctIndex = (underflow ? (today + 7) : today)

    for (let day = 0; day < correctIndex; day++) {
        CALENDAR_DAY_LIST[day].classList.add("disabled-day");
    }
}

function EnableAllDays() {
    // habilita todos os dias, pois é o mês que vem
    CALENDAR_DAY_LIST.forEach(day => { 
        day.classList.remove('selected-day'); 
        day.classList.remove('disabled-day'); 
    })

    // desmarcar o dia seleciondo 
    CALENDAR_DAY_LIST.forEach(day => { day.classList.remove('selected-day'); })
    schedule_date.setDate(0);
}

// Desabilita dias de folga
function DisableBreakDays(day) {
    for (let column = 0; column < 6; column++) {
        let columnSlot = -shop_firstWeekDayNumber + day + (column * 7);

        if (columnSlot < 0) {
            CALENDAR_DAY_LIST[columnSlot + 7].classList.add("unavailable-day");
        } else {
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
    } else {
        return new Date(DATE.getFullYear(), GetMonth(false), 1).getDay();
    }
}

function GetMonthLastDay(getNextMonthsTotalDay) {
    // Se o mês que vem for janeiro, deve usar o ano novo
    let year = (GetMonth(true) == 0 ? DATE.getFullYear() + 1 : DATE.getFullYear());

    if (getNextMonthsTotalDay) {
        return new Date(year, GetMonth(true) + 1, 0).getDate();
    } else {
        return new Date(DATE.getFullYear(), GetMonth(false) + 1, 0).getDate();
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
    return (GetMonth(true) == 0 ? DATE.getFullYear() + 1 : DATE.getFullYear());
}

/* -------------------------------------------------------------------------- */
/*                           INFORMAÇÕES DO CLIENTE                           */
/* -------------------------------------------------------------------------- */
/* ---------------------- Corrigir Inputs em tempo real --------------------- */
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
})

// corrigir input do instagram
INPUT_INSTAGRAM.addEventListener("keyup", () => {
    let input = INPUT_INSTAGRAM.value;
    if (input.length > 0 && !input.includes("@")) {
        input = "@" + input
    }
    
    INPUT_INSTAGRAM.value = input;
})

// Salvar informações das inputs
CONFIRM_USER_INFO.addEventListener("click", () => {
    schedule_clientName = INPUT_NAME.value;
    schedule_phone = INPUT_PHONE.value.replace(/\D/g, '');
    schedule_email = INPUT_EMAIL.value;
    schedule_instagram = INPUT_INSTAGRAM.value;
})

/* -------------------------------------------------------------------------- */
/*                              LISTA DE SERVIÇOS                             */
/* -------------------------------------------------------------------------- */
const EL_TOTAL_TIME = document.getElementById("total-time");
const EL_TOTAL_PRICE = document.getElementById("total-price");

// ! Apagar essa váriavel, está sendo usada temporariamente para substituir a variavel de tempo total
let totalDuration = 0;

function SelectServiceEntry(entry) {
    let serviceEntry_duration = parseInt(entry.querySelector('[data-duration]').getAttribute('data-duration'));
    let serviceEntry_value = parseInt(entry.querySelector('[data-value]').getAttribute('data-value'));
    let serviceEntry_id = parseInt(entry.id, 10);
    
    console.log(serviceEntry_duration);

    if (entry.classList.contains("selected")) {
        // Remove o serviço selecionado
        entry.classList.remove("selected");
        let entryToRemove = schedule_services.indexOf(serviceList[serviceEntry_id]);
        schedule_services.splice(entryToRemove, 1);

        // Subtrai tempo de duração e valor
        totalDuration -= serviceEntry_duration;
        schedule_totalPrice -= serviceEntry_value;
    } else {
        // Seleciona o serviço selecionado
        entry.classList.add("selected");
        schedule_services.push(serviceList[serviceEntry_id]);

        // Adiciona tempo de duração e valor
        totalDuration += serviceEntry_duration;
        schedule_totalPrice += serviceEntry_value;
    }

    // Tempo total
    schedule_duration = Format.ToTime(totalDuration, ":");
    
    // Atualizar a soma de tempo e valor total
    EL_TOTAL_TIME.innerHTML = Format.ToTime(totalDuration);
    EL_TOTAL_PRICE.innerHTML = Format.ToCurrency(schedule_totalPrice);
}

// Atualizar a Tabela de serviços e produtos
export async function UpdateServiceTable() {
    // Atualiza o titulo da tela de serviço
    const service_title = document.querySelector("#service-title");
    service_title.innerText = schedule_dateTitle;

    const table = document.querySelector("#service-table");

    // Resetar Dados
    schedule_duration = "";
    schedule_totalPrice = 0;
    serviceList = []
    
    EL_TOTAL_TIME.innerHTML = Format.ToTime(schedule_duration);
    EL_TOTAL_PRICE.innerHTML = Format.ToCurrency(schedule_totalPrice);

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
        table.appendChild(CreateServiceElement(product.name, product.value, entryId, ''))

        // * adicionar duração ao produto para que o calculo fique correto
        product['duration'] = 0;
        serviceList.push(product);
        entryId++;
    });
}

function CreateServiceElement(name, value, id, duration) {
    let tableRow = document.createElement("tr");
    tableRow.addEventListener("click", () => { SelectServiceEntry(tableRow); })
    tableRow.classList.add("service-entry");
    tableRow.id = id;

    let serviceName = document.createElement("td");
    serviceName.classList.add("service-name");
    serviceName.classList.add("col-3");
    serviceName.innerHTML = name;
    serviceName.setAttribute('data-name', name)
    
    let servicePrice = document.createElement("td");
    servicePrice.classList.add("service-price");
    servicePrice.classList.add("col-1");
    servicePrice.innerHTML = Format.ToCurrency(parseInt(value));
    servicePrice.setAttribute('data-value', value)

    let serviceTime = document.createElement("td");
    serviceTime.classList.add("service-time");
    serviceTime.classList.add("col-1");
    serviceTime.innerHTML = duration.replace(':', 'H ');
    serviceTime.setAttribute('data-duration', duration)

    tableRow.appendChild(serviceName);
    tableRow.appendChild(servicePrice);
    tableRow.appendChild(serviceTime);
    
    return tableRow;
}

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
    SCHEDULE_TITLE.innerText = schedule_dateTitle;
    
    // Limpa a tabela de marcações, e mostra todos os horarios disponiveis
    scheduleEntryList.forEach(schedule => {
        schedule.classList.remove('unavailable');
        schedule.classList.remove('row-unav');
        schedule.classList.remove("row-unav-cuz-dumb"); 
    })

    // limpar lista de horarios desabilitados
    disabledScheduleEntryList.length = 0;
    
    // carregar lista de agenda disponivel
    let date = `${schedule_date.getFullYear()}-${Format.PadNumber(schedule_date.getMonth() + 1)}-${Format.PadNumber(schedule_date.getDate())}`;
    let params = '?date=' + date
    let RENAME_THIS_LIST_AS_SOON_AS_POSSIBLE = await MakeRequest('/ajax/clients' + params, 'get')

    RENAME_THIS_LIST_AS_SOON_AS_POSSIBLE.forEach(schedule => {
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

// Quando é clicado em um horario na lista de horarios
function SelectScheduleEntry (entry) {
    if (!entry.classList.contains("unavailable")) {
        // Desmarcar outros horarios
        scheduleEntryList.forEach(schedule => { 
            schedule.classList.remove("unavailable"); 
            schedule.classList.remove("selected")
        });

        // Selecionar
        entry.classList.add("selected");
        schedule_time = entry.querySelector(".entry-time").innerHTML;
    }
}

// Criar horario da tabela de horarios
function CreateScheduleTime(time, minute) {
    let entry = document.createElement("tr");
    entry.classList.add("schedule-entry");
    entry.addEventListener("click", () => { SelectScheduleEntry(entry) })
    
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
    const SCHEDULE_DATE = document.querySelector("#summary-client-date");
    const SCHEDULE_SERVICES = document.querySelector("#summary-info-service");
    const SCHEDULE_SUMMARY = document.querySelector("#summary-schedule");
    
    // Definir a lista de serviços
    let serviceText = '';
    schedule_services.forEach(service => { serviceText += service.name + "\n"; });

    SCHEDULE_DATE.innerHTML = schedule_dateTitle;
    SCHEDULE_SUMMARY.innerText = `${schedule_time.replace(':', 'H')} - ${Format.ToTime(schedule_duration)}`;
    SCHEDULE_SERVICES.innerText = serviceText;
}

CONFIRM_SCHEDULE.addEventListener('click', () => {
    // Preparar para agendar no banco de dados
    let jsonRequest = JSON.stringify({
        shopId: shop_id,
        barberID: selectedBarber,
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
    // MakeRequest('/ajax/clients/', 'post', jsonRequest);
    // DisplayModal(false, true);
})

//  || Utilidades    ---------------------------------------------------------------------------
export function ClearClientForms() {
    // Anular todos os dados do agendamento
    schedule_date.setDate(0);
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