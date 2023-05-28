/* 
    Este é o script da Página financeira.
    Ela é geral da página,
    já o "Finance table" é especifico da tabela da página 
*/

import * as table from "./finance-table";
import { selectedEntry } from "./finance-table";

const blockBgElement = document.querySelector(".block-bg-elements");
const cancelDiagBox = document.querySelectorAll(".cancel-button")

const allDiagWindow = document.querySelectorAll(".pop-up")

const OP_ADD_ENTRY_PAYTYPE = document.getElementById("pay-type") as HTMLInputElement;

const IN_EDIT_ENTRY_NAME = document.getElementById("edit-entry-name") as HTMLInputElement;
const IN_EDIT_ENTRY_DATE = document.getElementById("edit-entry-date") as HTMLInputElement;
const IN_EDIT_ENTRY_PRICE = document.getElementById("edit-entry-price") as HTMLInputElement;
const IN_EDIT_ENTRY_TYPE = document.getElementById("edit-entry-type") as HTMLInputElement;
const OP_EDIT_ENTRY_PAYTYPE = document.getElementById("edit-pay-type") as HTMLInputElement;

const entryNameInputValue = document.querySelector("#input-entry-name") as HTMLInputElement;
const entryDateInputValue = document.querySelector("#entry-date") as HTMLInputElement;
const entryValueInputValue = document.querySelector("#entry-value") as HTMLInputElement;
const IN_ENTRY_TYPE = document.querySelector("#entry-type") as HTMLInputElement;

const EL_TOTAL_PROFIT = document.querySelector("#total-profits") as Element

let accessType = Cookies.get("accessType").toUpperCase();
let accessName = Cookies.get("accessName").toUpperCase();

const date = new Date();

let date_today = String(date.getDate()).padStart(2, "0");
let date_month = String(date.getMonth()+1).padStart(2, "0");
let date_year = String(date.getFullYear());

let today = `${date_today}/${date_month}/${date_year}`

let EL_ADD_ENTRY_DAY = document.getElementById("add-entry-day");
let EL_ADD_ENTRY_MONTH = document.getElementById("add-entry-month");
let EL_ADD_ENTRY_YEAR = document.getElementById("add-entry-year");

/* -------------------------------------------------------------------------- */
/*                                 Inicializar                                */
/* -------------------------------------------------------------------------- */
table.LoadAllEntries(); // Carregar todos os lançamentos para a tabela

/* -------------------------------------------------------------------------- */
/*                                   Botões                                   */
/* -------------------------------------------------------------------------- */
// Elementos
const BTN_ADD_NEW_ENTRY = document.querySelector('#button-add-entry') as HTMLInputElement;
const BTN_CONFIRM_NEW_ENTRY = document.querySelector("#confirm-add-entry-button") as HTMLInputElement;
const BTN_EDIT_ENTRY = document.querySelector("#button-edit-entry") as HTMLInputElement;
const BTN_CONFIRM_EDIT_ENTRY = document.querySelector("#button-confirm-edit") as HTMLInputElement;
const BTN_DELETE_ENTRY = document.querySelector("#button-del-entry") as HTMLInputElement;
const BTN_CONFIRM_DELETE_ENTRY = document.querySelector("#button-confirm-del") as HTMLInputElement;

// Adicionar Novo Lançamento
BTN_ADD_NEW_ENTRY.addEventListener("click", () => { DisplayPopup(true, 0); })
BTN_CONFIRM_NEW_ENTRY.addEventListener("click", () => { checklist_addNewEntry(); })

// Editar Lançamentos
BTN_EDIT_ENTRY.addEventListener("click", () => { DisplayEditWindow() })
BTN_CONFIRM_EDIT_ENTRY.addEventListener("click", () => { SaveEditedEntry(); })

// Apagar Lançamento
BTN_DELETE_ENTRY.addEventListener("click", () => {
    if (selectedEntry !== null) { 
        DisplayPopup(true, 2); // janela de eliminar lançamento
    } else {
        DisplayAlert("Ação Incorreta", "deve ser selecionado um lançamento para que seja possível exclui-lo")
    }
})

BTN_CONFIRM_DELETE_ENTRY.addEventListener("click", () => { 
    table.RemoveEntry();
    DisplayPopup(false);
})


/* -------------------------------------------------------------------------- */
/*                                Janela Pop Up                               */
/* -------------------------------------------------------------------------- */
// Exibir janelas
export function DisplayPopup(showWindows: boolean, windowIndex?: number, resetForm = false) {
    if (showWindows) {
        allDiagWindow.forEach(window => { window.classList.add("d-none") })
        blockBgElement?.classList.remove("d-none");
        if (windowIndex) allDiagWindow[windowIndex].classList.remove("d-none");
    } else {
        blockBgElement?.classList.add("d-none");
        allDiagWindow.forEach(window => { window.classList.add("d-none"); });
    }

    // reset forms
    if (resetForm) {
        const ADD_ENTRY_FORM = document.getElementById("add-entry-form") as HTMLFormElement | null;
        if (ADD_ENTRY_FORM) ADD_ENTRY_FORM.reset();
    }

    // remove alert boxes
    let alertBox = document.querySelector(".alert-box");
    if (alertBox != null) { alertBox.remove(); }
}

async function SaveEditedEntry() {
    DisplayPopup(false);
    
    let isTrue = (IN_EDIT_ENTRY_TYPE.value === 'ENTRADA');
    
    let id = (selectedEntry ? selectedEntry.querySelector('.entry-id')?.textContent : '');
    let name = IN_EDIT_ENTRY_NAME.value;
    let entryType = (isTrue ? "ENTRADA" : "SAIDA");
    let value = parseFloat(String(IN_EDIT_ENTRY_PRICE.value).replace(',','.'));
    let payType = OP_EDIT_ENTRY_PAYTYPE.value;
    let payDate = IN_EDIT_ENTRY_DATE.value;

    console.log(entryType);

    await table.UpdateEntry(id, name, entryType, payDate, value, payType);
    await table.LoadAllEntries();

    RefreshTotalProfit();
}

// Editar dados
function DisplayEditWindow() {
    // Exibir janela de edição
    DisplayPopup(true, 1)

    // - Carregar dados do lançamento
    // nome
    let nameElement = selectedEntry?.querySelector('.entry-name');
    let name = (nameElement ? nameElement.innerHTML : '');

    // // dia de pagamento
    // let payDay = selectedEntry.querySelector('.entry-pay-date').innerText;
    // let parsedDATE = Date.parse(payDay).toLocaleString()

    
    let dateFromEntry = new Date();
    let entryDate: Array<string> | undefined;

    if (selectedEntry) {
        entryDate = (selectedEntry.querySelector('.entry-pay-date')?.textContent)?.split('/');
        if (entryDate) dateFromEntry.setDate(parseInt(entryDate[0]));
        if (entryDate) dateFromEntry.setMonth(parseInt(entryDate[1]) - 1);
        if (entryDate) dateFromEntry.setFullYear(parseInt(entryDate[2]));
    }

    // valor do pagamento
    let valueElement = selectedEntry?.querySelector('.value');
    let value = (MoneyToFloat(valueElement ? valueElement.innerHTML : '')).toString();
    
    // tipo de pagamento
    let entryTypeElement = selectedEntry?.querySelector('.entry-type');
    let isTrue = (entryTypeElement?.innerHTML === 'ENTRADA');
    let type = (isTrue ? "ENTRADA" : "SAIDA");

    // forma de pagamento
    let paymentTypeElement = selectedEntry?.querySelector('.entry-pay-type');
    let paymentType = (paymentTypeElement ? paymentTypeElement?.innerHTML : '');

    // Colocar os valores nos inputs da janela
    IN_EDIT_ENTRY_NAME.value = name;
    IN_EDIT_ENTRY_DATE.valueAsDate = dateFromEntry;
    IN_EDIT_ENTRY_PRICE.value = value
    IN_EDIT_ENTRY_TYPE.value = type
    OP_EDIT_ENTRY_PAYTYPE.value = paymentType
}

/* ------------------------- Detalhes do Lançamento ------------------------- */

export function PopUp_UpdateDetailWindow() {
    const DETAIL_NAME = document.getElementById("det-name");
    const DETAIL_TOTAL_VALUE = document.getElementById("det-total-value");
    const DETAIL_PAY_TYPE = document.getElementById("det-pay-type");
    const DETAIL_PAYED_IN = document.getElementById("det-payed-in");
    const DETAIL_CREATED_IN = document.getElementById("det-created-in");
    const DETAIL_CREATED_BY = document.getElementById("det-created-by");
    const DETAIL_EDITED_BY = document.getElementById("det-edited-by");

    let entry = selectedEntry?.children;

    const PAYTYPE = ["Dinheiro", "Cartão de Débito", "Cartão de Crédito", "Pix"]

    // ! Mudar o "entry.item(n).inner text" para um query selector, 
    // ! isso irá evitar de pegar dados errados se mudar o layout no DOM
    if (entry) {
        if (DETAIL_NAME) DETAIL_NAME.innerText = (entry.item(0) ? entry.item(0)?.innerHTML! : '');
        if (DETAIL_TOTAL_VALUE) DETAIL_TOTAL_VALUE.innerText = (entry.item(5) ? entry.item(5)?.innerHTML! : '');
        if (DETAIL_PAY_TYPE) DETAIL_PAY_TYPE.innerText = (entry.item(8) ? entry.item(8)?.innerHTML! : '');
        if (DETAIL_PAYED_IN) DETAIL_PAYED_IN.innerText = (entry.item(3) ? entry.item(3)?.innerHTML! : '');
        if (DETAIL_CREATED_IN) DETAIL_CREATED_IN.innerText = (entry.item(2) ? entry.item(2)?.innerHTML! : '');
        if (DETAIL_CREATED_BY) DETAIL_CREATED_BY.innerText = (entry.item(4) ? entry.item(4)?.innerHTML! : '');
        if (DETAIL_EDITED_BY) DETAIL_EDITED_BY.innerText = (entry.item(7) ? entry.item(7)?.innerHTML! : '');
    }

    let hasBeenEdited = (entry?.item(7)?.innerHTML.length! > 0)
    if (hasBeenEdited) {
        // ! Mudar Parente element para um querry selector,
        // ! pois se for mudado o layout do DOM essa função irá quebrar
        if (DETAIL_EDITED_BY) DETAIL_EDITED_BY.parentElement?.classList.remove("d-none");
    } else {
        if (DETAIL_EDITED_BY) DETAIL_EDITED_BY.parentElement?.classList.add("d-none");
    }
}

cancelDiagBox.forEach(button => {
    button.addEventListener("click", function() { DisplayPopup(false); })
});

if (blockBgElement) blockBgElement.addEventListener("click", function() {
    DisplayPopup(false);
})

/* -------------------------------------------------------------------------- */
/*                               Mensagem Alerta                              */
/* -------------------------------------------------------------------------- */
let el_alert = document.querySelector(".alert-box");
let el_alertTitle = document.getElementById("alert-title");
let el_alertMsg = document.getElementById("alert-message");

function DisplayAlert(title: string, message: string) {
    // Se já existe, apagar para criar um novo
    if (el_alert != null)
        el_alert.remove();

    // Criar elemento
    el_alert = document.createElement("div")
    el_alert.classList.add("alert-box");

    let el_alertHeader = document.createElement("div");
    el_alertHeader.classList.add("d-flex");

    el_alertTitle = document.createElement("p");
    el_alertTitle.innerText = title;
    el_alertTitle.id = "alert-title";

    let el_alertSpan = document.createElement("span");
    el_alertSpan.classList.add("flex-grow-1");

    let el_alertButton = document.createElement("button");
    el_alertButton.classList.add("fa-solid");
    el_alertButton.classList.add("fa-xmark");
    el_alertButton.addEventListener("click", CloseAlert());

    let el_alertHR = document.createElement("hr");

    el_alertMsg = document.createElement("p");
    el_alertMsg.innerHTML = message;
    el_alertMsg.id = "alert-message";

    el_alertHeader.appendChild(el_alertTitle);
    el_alertHeader.appendChild(el_alertSpan);
    el_alertHeader.appendChild(el_alertButton);

    el_alert.appendChild(el_alertHeader);
    el_alert.appendChild(el_alertHR);
    el_alert.appendChild(el_alertMsg);

    document.body.appendChild(el_alert);
}

function CloseAlert() {
    return function () {
        const alertBox = this.closest(".alert-box");
        alertBox.remove();
    }
}

// || OUTROS ---------------------

// Calcular Valor Total
let entryValueList;

export function RefreshTotalProfit() {
    let allEntries = document.querySelectorAll('.value');
    let sum = 0;
    
    allEntries.forEach(entry => {
        // limpar a string até retornar uma float
        let textContent = entry.textContent || '';
        let value = MoneyToFloat(textContent)

        // Verificar se é debito
        let isDebt = entry.closest("tr")?.classList.contains("entry-debt");

        sum += (isDebt ? -value : value);
    });

    // Colorir o texto de acordo com a situação da conta
    if (sum < 0) {
        EL_TOTAL_PROFIT.classList.add("red-text"); 
    } else {
        EL_TOTAL_PROFIT.classList.remove("red-text");
    }

    EL_TOTAL_PROFIT.textContent = FloatToMoney(sum);
}

function RefreshTotalProfit_worker(worker_id: number, worker_name: string) {
    let el_workerProfit = document.getElementById(`total-profits-worker-${worker_id + 2}`) as HTMLInputElement | null;
    let sum = 0;

    // obter lançamentos especificos do trabalhador informado
    let myEntryList: Array<Element> | undefined;

    let createByList = document.querySelectorAll(".created-by")
    createByList.forEach(by => {
        if (by.textContent == worker_name) {
            // obter valor do lançamento
            let element = by.closest("tr")?.querySelector(".value")
            if (element && myEntryList) myEntryList.push(element)
        }
    });

    // Remover Cifrão e trocar virgulas por pontos
    if (myEntryList) myEntryList.forEach(entry => {
        // Filtrar
        let value = MoneyToFloat(entry.textContent ? entry.textContent : '')
        let isDebt = entry.closest("tr")?.classList.contains("entry-debt");
        
        sum += (isDebt ? -value : value);
    });

    // Formatar texto de acordo com o valor
    if (sum < 0) {
        if (el_workerProfit) el_workerProfit.classList.add("red-text");
    } else {
        if (el_workerProfit) el_workerProfit.classList.remove("red-text");
    }

    // Definir valor na tela
    if (el_workerProfit) el_workerProfit.textContent = FloatToMoney(sum);
}

/* -------------------------------------------------------------------------- */
/*                            Confirmação de Dados                            */
/* -------------------------------------------------------------------------- */
// Confirmar se os dados estão corretos para serem enviados para a base de dados
function checklist_addNewEntry() {
    if (entryNameInputValue.value == "") {
        DisplayAlert("Informações Incompletas", "Deve ser preenchido o <span>nome do lançamento</span> para que seja possível cria-lo")
    } 
    else if (entryDateInputValue.value == "") { 
        DisplayAlert("Informações Incompletas", "Deve ser escolhido um <span>dia válido</span> para que seja possível cria-lo") 
    } 
    else if (OP_ADD_ENTRY_PAYTYPE.value == "0") { 
        DisplayAlert("Informações Incompletas", "Deve ser escolhido a <span>forma de pagamento</span> do lançamento para que seja possível cria-lo") 
    } 
    else if (IN_ENTRY_TYPE.value == "0") { 
        DisplayAlert("Informações Incompletas", "Deve ser escolhido o <span>tipo de pagamento</span> do lançamento para que seja possível cria-lo") 
    } else {
        table.SaveEntry(entryNameInputValue.value, IN_ENTRY_TYPE.value, today, entryDateInputValue.value,
            accessName, entryValueInputValue.value, OP_ADD_ENTRY_PAYTYPE.value);
        DisplayPopup(false);
    }
}
/* ------------------------------ Usuário Ativo ----------------------------- */

const ACCESS_NAME = document.getElementById("active-user-name");
if (ACCESS_NAME) ACCESS_NAME.textContent = accessName;

/* -------------------------------------------------------------------------- */
/*                           Conversões de formatos                           */
/* -------------------------------------------------------------------------- */
function MoneyToFloat(value: string) {
    // limpar a string até retornar uma float
    let result: number;
    let newValue = value.replace(',', '.');
    newValue = newValue.replace('R$', '');
    result = parseFloat(newValue);
    
    return result;
}

export function FloatToMoney(value: number) {
    let stringValue = String(value) // converter numero para string
    let toNumber = parseFloat(stringValue); // converter corretamente
    let parseAgain = toNumber.toFixed(2); // adicionar decimais
    let result = parseAgain.replace('.', ','); // ponto para virgula

    return `R$ ${result}`;
}