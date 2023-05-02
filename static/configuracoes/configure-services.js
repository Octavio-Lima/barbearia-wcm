let serviceTable = document.getElementById("service-table")
let barberList = document.querySelector("#barber-select").querySelectorAll("option")
let selectedBarber = 0
let sel_shopList = document.querySelector("#shop-select")
let el_shopName = document.querySelector("#shop-name");
let sel_BarberList = document.querySelector("#barber-select")

let serviceLengthName = ["0 minutos", "15 minutos","30 minutos","45 minutos","1 hora",
    "1 hora e 15 minutos","1 hora e 30 minutos","1 hora e 45 minutos","2 horas"]

let shopId = Cookies.get("shopId")
    
function CreateTableEntry(name, value, length) {
    // Serviço
    let entryRow = document.createElement("tr")

    // Nome
    let entryTDName = document.createElement("td")
    let entryName = document.createElement("input")
    entryName.value = name
    entryTDName.append(entryName)
    entryRow.append(entryTDName)

    // Valor
    let entryTDValue = document.createElement("td")
    let entryValue = document.createElement("input")
    entryValue.value = value
    entryTDValue.append(entryValue)
    entryRow.append(entryTDValue)

    // Tempo de Duração
    let entryTDLength = document.createElement("td")
    let entryLengthSelect = document.createElement("select")

    for (let index = 0; index <= 8; index++) {
        let entryLengthOption = document.createElement("option")
        entryLengthOption.innerText = serviceLengthName[index]
        entryLengthOption.value = index

        if (entryLengthOption.value == length) {
            entryLengthOption.selected = "selected"
        }

        entryLengthSelect.append(entryLengthOption)
    }
    
    entryLengthSelect.selected = length;
    entryTDLength.append(entryLengthSelect)
    entryRow.append(entryLengthSelect)

    // Botão de Excluir
    let entryTDDelete = document.createElement("td")
    let entryDelete = document.createElement("button")
    entryDelete.innerText = "X"
    entryDelete.addEventListener("click", function() { entryRow.remove() })
    entryTDDelete.append(entryDelete)
    entryRow.append(entryTDDelete)

    serviceTable.appendChild(entryRow)
}

// CreateTableEntry(serviceList[0][0], serviceList[0][1], serviceList[0][2])

barberList.forEach(element => {
    element.addEventListener("click", function() {selectBarber(element.value)})
});

function ClearTable() {
    serviceTable.innerHTML = ''
}

function ClearBarberOptions() {
    sel_BarberList.innerHTML = ''

    let defaultEntry = document.createElement("option")
    defaultEntry.value = -1
    defaultEntry.innerText = "Selecione Um Barbeiro"
    defaultEntry.addEventListener("click", function() {ClearTable()})
    sel_BarberList.append(defaultEntry)
}

async function selectBarber(id) {
    // Limpar a Tabela
    ClearTable()

    // Obter lista de Serviços do Banco de Dados
    let params = '?ShopID=' + shopId + '&BarbeiroId=' + id;
    let serviceList = await MakeRequest('/ajax/users/barber/config' + params, 'get')
    console.log(serviceList);

    // Analisar e formatar a lista de serviços obtida
    let parsedServiceList = serviceList.Serviços.split(";")

    parsedServiceList.forEach(entry => {
        parsedEntry = entry.split(">")
        CreateTableEntry(parsedEntry[0], parsedEntry[1], parsedEntry[2])
    });
}

/* Modal Adicionar novo Serviço */
let confirmButton = document.querySelector("#btn_confirm-new-entry")
let input_newEntryName = document.querySelector("#inp_new-entry-name")
let input_newEntryValue = document.querySelector("#inp_new-entry-value")
let input_newEntryLength = document.querySelector("#inp_new-entry-length")

confirmButton.addEventListener("click", function() {
    CreateTableEntry(input_newEntryName.value, input_newEntryValue.value, input_newEntryLength.value)
})

let btn_showModal = document.querySelector("#btn_new-entry-modal")
let btn_hideModal = document.querySelector("#btn_cancel-entry")
let btn_confirmNewEntry = document.querySelector("#btn_confirm-new-entry")
let newEntryModal = document.querySelector("#new-entry-modal")

btn_showModal.addEventListener("click", function () {
    newEntryModal.classList.toggle("d-none")
})
btn_hideModal.addEventListener("click", function () {
    newEntryModal.classList.toggle("d-none")
})
btn_confirmNewEntry.addEventListener("click", function () {
    newEntryModal.classList.toggle("d-none")
})

// Carregar Lista de Barbearias
Init()

async function Init() {
    // Limpa a Tabela de Serviços
    ClearTable();
    
    // Nome da barbearia
    params = '?shopId=' + shopId;
    shopName = await MakeRequest('/ajax/shop' + params, 'get');
    el_shopName.innerText = shopName.shopName;

    GetBarberList()
}

// Carregar Lista de Barbeiros


async function GetBarberList() {
    // Limpa a Lista de Barbeiros e Tabela de Serviços
    ClearBarberOptions()
    ClearTable()

    // Obter Lista de Barbeiros da Base de Dados
    let params = '?shopId=' + shopId
    let barberList = await MakeRequest('/ajax/users' + params, 'get')
    console.log(barberList);
    
    // Criar Opção no Select para Cada Barbearia
    barberList.forEach(barber => {
        let barberEntry = document.createElement("option")
        barberEntry.value = barber.id
        barberEntry.innerText = barber.name
        barberEntry.addEventListener("click", function() {selectBarber(barberEntry.value)})
        console.log(barberEntry);
    
        sel_BarberList.appendChild(barberEntry)
    });
}

// Salvar alterações para a base de dados
let btn_SaveChanges = document.querySelector("#btn_save-to-database")

btn_SaveChanges.addEventListener("click", function() {
    if (sel_BarberList.value < 0)
        return

    let entries = []

    serviceTable.childNodes.forEach(serviceEntry => {
        let serviceName = serviceEntry.childNodes[0].firstChild.value
        let serviceValue = serviceEntry.childNodes[1].firstChild.value
        let serviceTime = serviceEntry.childNodes[2].value
        let newServiceEntry = serviceName + ">" + serviceValue + ">" + serviceTime
        entries.push(newServiceEntry)
    });

    console.log(entries);

    let entryToDatabase = ""
    for (let index = 0; index < entries.length; index++) {
        if (index < entries.length - 1) {
            entryToDatabase += entries[index] + ";"
        } else {
            entryToDatabase += entries[index]
        }
    }

    let params = '';
    let jsonRequest = JSON.stringify({
        shopID: shopId,
        barberID: sel_BarberList.value,
        serviceList: entryToDatabase
    })

    MakeRequest('/ajax/users/barber/config' + params, 'put', jsonRequest);
})

async function MakeRequest(url, method, body) {
    let headers = {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json'
    }

    if (method == 'post' || method == 'put') {
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