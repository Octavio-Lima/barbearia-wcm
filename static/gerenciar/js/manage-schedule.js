// import * as modal from "./modals.js";
// let apiURL = "https://cb9b-179-106-79-130.sa.ngrok.io/" // URL de teste NGROK
let apiURL = "http://localhost:5018/" // URL Local
let shopId = Cookies.get("shopId")

let shopOpensAt = 0
let shopClosesAt = 24
const SCHEDULE_TABLE = document.querySelector("#schedule-list")
let tableDate

let entriesList = [];
let scheduleList = [];

const INP_DATE = document.querySelector("#schedule-date")

/* ------------------------------- Inicializar ------------------------------ */
async function Initialize() {
    await ShopConfigurationSetup(shopId) // Configurações da Barbearia

    for (let i = shopOpensAt; i < shopClosesAt; i++) {
        CreateEntry(i, 0)
        CreateEntry(i, 1)
        CreateEntry(i, 2)
        CreateEntry(i, 3)
        updateEntryList()
    }

    ClearTableInfo()

    // Definir o dia inicial da tabela
    let newDate = new Date()
    tableDate = newDate.getFullYear() + "-" + 
        (newDate.getMonth() + 1).toString().padStart(2, '0') + "-" + 
        newDate.getDate().toString().padStart(2, '0')
    INP_DATE.value = tableDate

    // carregar lista de agenda disponivel
    UpdateScheduleTable();
}

/* -------------------------------------------------------------------------- */
/*                              Obter Infomações                              */
/* -------------------------------------------------------------------------- */

/* ------------------- Carregar Configurações da Barbearia ------------------ */
async function ShopConfigurationSetup(ShopID) {
    // Obter lista de Serviços do Banco de Dados
    let params = '?ShopID=' + shopId
    let shopConfig = await MakeRequest('/ajax/shop/config' + params, 'get')

    let opensAt = shopConfig.AbreAs.split(':');
    shopOpensAt = opensAt[0];
    
    let closesAt = shopConfig.FechaAs.split(':');
    shopClosesAt = closesAt[0];
}

async function GetShopSettings(ShopID) {    
    let url = "http://localhost:5018/api/Configuration/GetShopConfiguration";
    let jsonRequest = JSON.stringify({
        shopID: ShopID,
    });

    const response = await fetch(url, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "content-type": "application/json; charset=UTF-8"
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: jsonRequest
    });
    
    let bodyResponse = await response.text();
    let jsonResponse = JSON.parse(bodyResponse);
    return jsonResponse
}

/* --------------------------- Crianção de Horario -------------------------- */
function CreateEntry(hour, minute) {
    let entry = document.createElement("div");
    let time = document.createElement("p");
    let description = document.createElement("div");
    let topRow = document.createElement("div");
    let bottomRow = document.createElement("div");
    let EL_CLIENT = document.createElement("p");
    let EL_SERVICE = document.createElement("p");
    let EL_PHONE = document.createElement("p");
    let EL_INSTA = document.createElement("p");
    let EL_SPACER = document.createElement("p");
    let EL_SPACERTWO = document.createElement("p");

    entry.addEventListener("dblclick", (e) => { modal.displayModal(EL_CLIENT.innerText); })

    entry.classList.add("schedule-entry");
    time.classList.add("time");
    description.classList.add("container-entry-details");
    topRow.classList.add("detail-container");
    topRow.classList.add("info-top");
    EL_CLIENT.classList.add("m-0");
    EL_SERVICE.classList.add("m-0");
    bottomRow.classList.add("detail-container");
    bottomRow.classList.add("info-bottom");
    EL_SPACER.classList.add("flex-grow-1");

    time.innerText = formatTimeString(hour) + ":" + formatTimeString((15 * minute));
    
    topRow.appendChild(EL_SERVICE);
    topRow.appendChild(EL_CLIENT);
    
    bottomRow.appendChild(EL_INSTA);
    bottomRow.appendChild(EL_SPACER);
    bottomRow.appendChild(EL_PHONE);

    entry.appendChild(time);
    description.appendChild(topRow);
    description.appendChild(bottomRow);
    entry.appendChild(description);

    SCHEDULE_TABLE.appendChild(entry);
}

/* -------------------------------------------------------------------------- */
/*                                 Inicializar                                */
/* -------------------------------------------------------------------------- */
await Initialize()

function AddEntryInfo(startHour, startMinute, scheduleLength, service, client, phone, insta) {
    let correctIndex = ((startHour * 4) + startMinute) - (shopOpensAt * 4);
    let entries = [];

    for (let i = 0; i < scheduleLength; i++) {
        let j = correctIndex + i
        entries[i] = entriesList[j].children;
    }

    // let entry = entriesList[correctIndex].children;
    let entryDescription = entries[0].item(1).children;
    let descriptionTop = entryDescription.item(0).children;
    let descriptionBot = entryDescription.item(1).children;

    let el_name = descriptionTop.item(0);
    let el_service = descriptionTop.item(1);
    let el_phone = descriptionBot.item(0);
    let el_insta = descriptionBot.item(2);

    for (let i = 0; i < scheduleLength; i++) {
        if (i == 0) { 
            entries[i].item(1).classList.add("row-busy-top");
            entries[i].item(0).parentElement.classList.add("top"); 
        } else if (i == scheduleLength - 1) { 
            entries[i].item(1).classList.add("row-busy-bottom");
            entries[i].item(0).parentElement.classList.add("base");
        } else { 
            entries[i].item(1).classList.add("row-busy");
            /*console.log("middle")*/;
            entries[i].item(0).parentElement.classList.add("middle");
            entries[i].item(0).parentElement.children.item(0).classList.add("hidden"); 
        }
    }

    el_name.innerHTML = client + "&nbsp;";
    el_service.innerText = "(" + service + ")";
    el_phone.innerText = phone;
    el_insta.innerText = insta;

    // entry.item(3).innerText = service;
    // el_client.innerText = client;
    // el_phone.innerText = phone;
    // el_insta.innerText = insta;
}

function ClearTableInfo() {
    let entries = [];
    entriesList.forEach(entry => {
        let scheduleEntry = entry.children;

        let entryDescription = scheduleEntry.item(1).children;
        let descriptionTop = entryDescription.item(0).children;
        let descriptionBot = entryDescription.item(1).children;
    
        let el_name = descriptionTop.item(0);
        let el_service = descriptionTop.item(1);
        let el_phone = descriptionBot.item(0);
        let el_insta = descriptionBot.item(2);
        
        el_name.innerHTML = "";
        el_service.innerText = "";
        el_phone.innerText = "";
        el_insta.innerText = "";

        scheduleEntry.item(1).classList.remove("row-busy-top");
        scheduleEntry.item(1).classList.remove("row-busy-bottom");
        scheduleEntry.item(1).classList.remove("row-busy");
        scheduleEntry.item(0).parentElement.classList.remove("top");
        scheduleEntry.item(0).parentElement.classList.remove("base");
        scheduleEntry.item(0).parentElement.classList.remove("middle");
        scheduleEntry.item(0).parentElement.children.item(0).classList.remove("hidden"); 
    });
}

/* ---------------------------- Atualizar Tabela ---------------------------- */
INP_DATE.addEventListener("change", async function() {
    await ShopConfigurationSetup(shopId) // Configurações da Barbearia
    ClearTableInfo()

    UpdateScheduleTable()
})

async function UpdateScheduleTable() {
    // carregar lista de agenda disponivel
    let params = '?date=' + INP_DATE.value
    let scheduleList = await MakeRequest('/ajax/clients' + params, 'get')

    console.log(scheduleList);

    // Adicionar Agendamentos a lista de horarios preenchidos
    scheduleList.forEach(entry => {
        // console.log(entry);
        AddEntryInfo(entry.horaInicio, entry.minuto, entry.duracao, "corte de cabelo", entry.nome, entry.celular, entry.instagram);
    });
}



// || Extra

function formatTimeString(n) {
    let value = parseInt(n)
    if (value <= 9) { return "0" + value; } else { return value }
}

function updateEntryList() {
    entriesList = document.querySelectorAll(".schedule-entry");
}

async function MakeRequest(url, method, body) {
    let headers = {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json'
    }

    if (method == 'post' || method == 'put' || method == 'delete') {
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