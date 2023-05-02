let serviceTable = document.getElementById("service-table")
let sel_shopList = document.querySelector("#shop-select")
let shopId = Cookies.get("shopId")
    
function CreateTableEntry(name, value, quantity) {
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
    
    // Quantidade
    let entryTDQuantity = document.createElement("td")
    let entryQuantity = document.createElement("input")
    entryQuantity.value = quantity
    entryQuantity.type = "number"
    entryTDQuantity.append(entryQuantity)
    entryRow.append(entryTDQuantity)

    // Botão de Excluir
    let entryTDDelete = document.createElement("td")
    let entryDelete = document.createElement("button")
    entryDelete.innerText = "X"
    entryDelete.addEventListener("click", function() { entryRow.remove() })
    entryTDDelete.append(entryDelete)
    entryRow.append(entryTDDelete)

    serviceTable.appendChild(entryRow)
}

/* Modal Adicionar novo Serviço */
let confirmButton = document.querySelector("#btn_confirm-new-entry")
let input_newEntryName = document.querySelector("#inp_new-entry-name")
let input_newEntryValue = document.querySelector("#inp_new-entry-value")
let input_newEntryQuantity = document.querySelector("#inp_new-entry-quantity")

confirmButton.addEventListener("click", function() {
    CreateTableEntry(input_newEntryName.value, input_newEntryValue.value, input_newEntryQuantity.value)
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
    // Nome da Barbearia

    // Obter lista de produtos do banco de dados
    params = '?ShopID=' + shopId
    let productList = await MakeRequest('/ajax/shop/config/products' + params, 'get')

    // Analisar e formatar a lista de serviços obtida
    let parsedProductList = productList.Produtos.split(";")

    parsedProductList.forEach(entry => {
        parsedEntry = entry.split(">")
        CreateTableEntry(parsedEntry[0], parsedEntry[1], parsedEntry[2])
    });

}

// Salvar alterações para a base de dados
let btn_SaveChanges = document.querySelector("#btn_save-to-database")

btn_SaveChanges.addEventListener("click", async function() {
    let entries = []
    
    let serviceElements = serviceTable.querySelectorAll('tr')
    serviceElements.forEach(service => {
        let serviceName = service.childNodes[0].firstChild.value
        let serviceValue = service.childNodes[1].firstChild.value
        let serviceQuantity = service.childNodes[2].firstChild.value
        let newProductEntry = serviceName + ">" + serviceValue + ">" + serviceQuantity
        
        entries.push(newProductEntry)
    });


    let serviceList = ""
    for (let index = 0; index < entries.length; index++) {
        if (index < entries.length - 1) {
            serviceList += entries[index] + ";"
        } else {
            serviceList += entries[index]
        }
    }

    let jsonRequest = JSON.stringify({
        ShopID: shopId,
        Produtos: serviceList
    });

    console.log(jsonRequest);
    await MakeRequest('/ajax/shop/config/products', 'put', jsonRequest)
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