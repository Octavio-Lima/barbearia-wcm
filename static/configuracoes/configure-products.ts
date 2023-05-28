import { MakeRequest } from "../geral/js/request";

const SERVICE_TABLE = document.getElementById("service-table")
let sel_shopList = document.querySelector("#shop-select")
let shopId = Cookies.get("shopId")
    
function CreateTableEntry(name: string, value: string, quantity: string) {
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

    if (SERVICE_TABLE) SERVICE_TABLE.appendChild(entryRow)
}

/* Modal Adicionar novo Serviço */
const CONFIRM_BUTTON = document.querySelector("#btn_confirm-new-entry")
const input_newEntryName = document.querySelector("#inp_new-entry-name") as HTMLInputElement;
const input_newEntryValue = document.querySelector("#inp_new-entry-value") as HTMLInputElement;
const input_newEntryQuantity = document.querySelector("#inp_new-entry-quantity") as HTMLInputElement;

if (CONFIRM_BUTTON) CONFIRM_BUTTON.addEventListener("click", function() {
    CreateTableEntry(input_newEntryName.value, input_newEntryValue.value, input_newEntryQuantity.value)
})

const BUTTON_SHOW_MODAL = document.querySelector("#btn_new-entry-modal")
const BUTTON_HIDE_MODAL = document.querySelector("#btn_cancel-entry")
const BUTTON_CONFIRM_NEW_ENTRY = document.querySelector("#btn_confirm-new-entry")
const MODAL_NEW_ENTRY = document.querySelector("#new-entry-modal")

if (BUTTON_SHOW_MODAL) BUTTON_SHOW_MODAL.addEventListener("click", () => {
    if (MODAL_NEW_ENTRY) MODAL_NEW_ENTRY.classList.toggle("d-none");
})
if (BUTTON_HIDE_MODAL) BUTTON_HIDE_MODAL.addEventListener("click", () => {
    if (MODAL_NEW_ENTRY) MODAL_NEW_ENTRY.classList.toggle("d-none");
})
if (BUTTON_CONFIRM_NEW_ENTRY) BUTTON_CONFIRM_NEW_ENTRY.addEventListener("click", () => {
    if (MODAL_NEW_ENTRY) MODAL_NEW_ENTRY.classList.toggle("d-none");
})

// Carregar Lista de Barbearias

Init()

async function Init() {
    // Nome da Barbearia

    // Obter lista de produtos do banco de dados
    let params = `?ShopID=${shopId}`
    let productList = await MakeRequest(`/ajax/shop/config/products${params}`, 'get')

    // Analisar e formatar a lista de serviços obtida
    let parsedProductList = productList.Produtos.split(";")

    parsedProductList.forEach((entry: string) => {
        let parsedEntry = entry.split(">")
        CreateTableEntry(parsedEntry[0], parsedEntry[1], parsedEntry[2])
    });

}

// Salvar alterações para a base de dados
let BUTTON_SAVE_CHANGES = document.querySelector("#btn_save-to-database")

if (BUTTON_SAVE_CHANGES) BUTTON_SAVE_CHANGES.addEventListener("click", async () => {
    let entries: Array<string> | undefined
    
    let serviceElements = SERVICE_TABLE?.querySelectorAll('tr')
    if (serviceElements) serviceElements.forEach(service => {
        let nodeList = [
            service.childNodes[0].firstChild as HTMLInputElement,
            service.childNodes[1].firstChild as HTMLInputElement,
            service.childNodes[2].firstChild as HTMLInputElement
        ]
        let serviceName = nodeList[0].value
        let serviceValue = nodeList[1].value
        let serviceQuantity = nodeList[2].value
        let newProductEntry = `${serviceName}>${serviceValue}>${serviceQuantity}`
        
        entries!.push(newProductEntry)
    });


    let serviceList = ""
    if (entries) for (let index = 0; index < entries.length; index++) {
        if (index < entries.length - 1) {
            serviceList += `${entries[index]};`
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