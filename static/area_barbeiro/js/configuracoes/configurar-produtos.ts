import { ToCurrency } from "../../../geral/js/formating.js"
import { CurrencyToNumber, GetCookie, MakeRequest } from "../../../geral/js/utility.js"

let shopId = GetCookie("shopId")
let productList: Array<Product> = []
const PRODUCT_TABLE = document.getElementById("service-table") as HTMLTableElement | null

// Obter lista de produtos
// (async function() {
//     // Obter lista de produtos do banco de dados
//     let params = `?shopId=${shopId}`
//     let request = await MakeRequest(`/ajax/shop/config/products${params}`, 'get')
//     let requestProductList = JSON.parse(request.products) as Array<any> | null

//     // Criar elementos na tabela
//     requestProductList?.forEach((entry) => {
//         let newEntry = new Product(entry.name, entry.value, entry.quantity);
//         PRODUCT_TABLE?.appendChild(newEntry.CreateElement());
//     });
// })();

// Salvar alterações
const SAVE_CHANGES = document.querySelector("#btn_save-to-database") as HTMLButtonElement | null
SAVE_CHANGES?.addEventListener("click", async () => {
    // Criar lista a ser enviada
    let updatedProductList: Array<any> = []
    productList.forEach(entry => {
        if (!entry.deleted) {
            updatedProductList.push({
                "name": entry.input.name?.value,
                "value": CurrencyToNumber(entry.input.value ? entry.input.value?.value : "0"),
                "quantity": entry.input.quantity?.value
            })
        }
    });

    // Requisição
    let jsonRequest = JSON.stringify(updatedProductList);
    console.log(jsonRequest);
    await MakeRequest('/ajax/shop/config/products', 'put', jsonRequest)
})

class Product {
    name = ""
    value = 0
    quantity = "00:00"
    deleted = false
    input = {
        name: null as HTMLInputElement | null,
        value: null as HTMLInputElement | null,
        quantity: null as HTMLInputElement | null
    }

    constructor(name: string, value: number, quantity: string) {
        this.name = name;
        this.value = value;
        this.quantity = quantity;
        this.deleted = false;
        productList.push(this)
    }

    CreateElement(): HTMLTableRowElement {
        // Serviço
        let entryRow = document.createElement("tr")

        // Nome
        let entryTDName = document.createElement("td")
        let entryName = document.createElement("input")
        this.input.name = entryName
        entryName.value = this.name
        entryTDName.append(entryName)
        entryRow.append(entryTDName)

        // Valor
        let entryTDValue = document.createElement("td")
        let entryValue = document.createElement("input")
        this.input.value = entryValue
        entryValue.value = ToCurrency(this.value)
        entryTDValue.append(entryValue)
        entryRow.append(entryTDValue)

        // Duração
        let entryTDQuantity = document.createElement("td")
        let entryQuantity = document.createElement("input")
        this.input.quantity = entryQuantity
        entryQuantity.value = this.quantity
        entryQuantity.type = "number"
        entryTDQuantity.append(entryQuantity)
        entryRow.append(entryTDQuantity)

        // Botão de Excluir
        let entryTDDelete = document.createElement("td")
        let entryDelete = document.createElement("button")
        entryDelete.innerText = "X"
        entryDelete.addEventListener("click", () => { entryRow.remove(); this.deleted = true})
        entryTDDelete.append(entryDelete)
        entryRow.append(entryTDDelete)

        return entryRow
    }
}

/* #region  Modal */
// Exibir / Esconder
const MODAL_NEW_ENTRY = document.querySelector("#new-entry-modal")
const BUTTON_SHOW_MODAL = document.querySelector("#btn_new-entry-modal")
const BUTTON_HIDE_MODAL = document.querySelector("#btn_cancel-entry")
BUTTON_SHOW_MODAL?.addEventListener("click", () => { MODAL_NEW_ENTRY?.classList.toggle("d-none"); });
BUTTON_HIDE_MODAL?.addEventListener("click", () => { MODAL_NEW_ENTRY?.classList.toggle("d-none"); });
    

// Confirmar adicionar novo produto
const NEW_ENTRY_NAME = document.getElementById('inp_new-entry-name') as HTMLInputElement | null
const NEW_ENTRY_VALUE = document.getElementById('inp_new-entry-value') as HTMLInputElement | null
const NEW_ENTRY_QUANTITY = document.getElementById('inp_new-entry-quantity') as HTMLInputElement | null
const CONFIRM_BUTTON = document.getElementById("btn_confirm-new-entry")
CONFIRM_BUTTON?.addEventListener("click", function() {
    if (NEW_ENTRY_NAME && NEW_ENTRY_VALUE && NEW_ENTRY_QUANTITY) {
        let newEntry = new Product(NEW_ENTRY_NAME.value, parseFloat(NEW_ENTRY_VALUE.value), NEW_ENTRY_QUANTITY.value);
        PRODUCT_TABLE?.appendChild(newEntry.CreateElement());
        MODAL_NEW_ENTRY?.classList.toggle("d-none");
    } else {
        alert('somethin is wrong here')
    }
})
/* #endregion */