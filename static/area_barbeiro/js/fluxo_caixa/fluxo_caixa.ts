import * as table from "./fluxo_caixa_tabela.js";
import { CurrencyToNumber, MakeRequest, NumberToCurrency } from "../../../geral/js/utility.js";
import { BrazilToDefaultDate, ToBrazilDate } from "../../../geral/js/formating.js";

const IN_EDIT_ENTRY_NAME = document.getElementById("edit-entry-name") as HTMLInputElement;
const IN_EDIT_ENTRY_DATE = document.getElementById("edit-entry-date") as HTMLInputElement;
const IN_EDIT_ENTRY_PRICE = document.getElementById("edit-entry-price") as HTMLInputElement;
const IN_EDIT_ENTRY_TYPE = document.getElementById("edit-entry-type") as HTMLInputElement;
const OP_EDIT_ENTRY_PAYTYPE = document.getElementById("edit-pay-type") as HTMLInputElement;

const entryNameInputValue = document.querySelector("#input-entry-name") as HTMLInputElement;
const entryDateInputValue = document.querySelector("#entry-date") as HTMLInputElement;
const entryValueInputValue = document.querySelector("#entry-value") as HTMLInputElement;
const IN_ENTRY_TYPE = document.querySelector("#entry-type") as HTMLInputElement;

/* ---------- Inicializar carregando todos os lançamentos na tabela --------- */
(function () {
    table.LoadAllEntries();
})();

/* ---------------------------- Botões Principais --------------------------- */
// Botão de adicionar lançamento
const BTN_ADD_NEW_ENTRY = document.querySelector('#button-add-entry') as HTMLInputElement | null;
BTN_ADD_NEW_ENTRY?.addEventListener("click", () => { DisplayModal(true, "adicionar"); })

// Botão de eliminar lançamento
const BTN_DELETE_ENTRY = document.querySelector("#button-del-entry") as HTMLInputElement | null;
BTN_DELETE_ENTRY?.addEventListener("click", () => {
    if (table.selectedEntry !== null) {
        DisplayModal(true, "remover"); // janela de eliminar lançamento
    } else {
        DisplayAlert("Ação Incorreta", "deve ser selecionado um lançamento para que seja possível exclui-lo")
    }
})

/* ------------------------------ Confirmações ------------------------------ */
// Confirmar se os dados estão corretos para serem enviados para a base de dados
const NEW_ENTRY_FORM = document.getElementById("add-entry-form") as HTMLFormElement | null;
NEW_ENTRY_FORM?.addEventListener("submit", (event) => {
    event.preventDefault();
    table.SaveEntry(NEW_ENTRY_FORM);
    /* DisplayModal(false); */
})

// - Remover Lançamento
const BTN_CONFIRM_DELETE_ENTRY = document.querySelector("#button-confirm-del") as HTMLInputElement | null;
BTN_CONFIRM_DELETE_ENTRY?.addEventListener("click", () => {
    table.RemoveEntry();
    DisplayModal(false);
})

/* #region  Modal Principal */
export function DisplayModal(visible: boolean = true, subModalIndex?: WindowName, resetForms = false) {
    const MODAL_WINDOWS = document.querySelectorAll(".pop-up")

    if (visible) {
        BLOCK_BACKGROUND?.classList.remove("d-none");
        MODAL_WINDOWS.forEach(window => { window.classList.add("d-none"); })
        if (subModalIndex != null) {
            if (subModalIndex == "adicionar") MODAL_WINDOWS[0].classList.remove("d-none");
            else if (subModalIndex == "editar") MODAL_WINDOWS[1].classList.remove("d-none");
            else if (subModalIndex == "remover") MODAL_WINDOWS[2].classList.remove("d-none");
            else if (subModalIndex == "detalhes") MODAL_WINDOWS[3].classList.remove("d-none");
            else MODAL_WINDOWS[0].classList.remove("d-none");
        }
    } else {
        BLOCK_BACKGROUND?.classList.add("d-none");
        MODAL_WINDOWS.forEach(window => { window.classList.add("d-none"); });
    }

    // Resetar informações dos formularios
    if (resetForms) {
        NEW_ENTRY_FORM?.reset();
    }

    // Remover alertas
    let alertBox = document.querySelector(".alert-box");
    if (alertBox != null) { alertBox.remove(); }
}

// Se clicar fora da modal, fechar a modal
const BLOCK_BACKGROUND = document.querySelector(".block-bg-elements");
BLOCK_BACKGROUND?.addEventListener("click", function () { DisplayModal(false); })

// Adicionar botão de fechar a modal em todas as janelas
const cancelDiagBox = document.querySelectorAll(".cancel-button")
cancelDiagBox.forEach(button => { button.addEventListener("click", () => { DisplayModal(false); }) });

/* #endregion */

/* #region  Janelas da Modal */
/* ------------------------ Adicionar Novo Lançamento ----------------------- */
// - Editar Lançamento
const BTN_EDIT_ENTRY = document.querySelector("#button-edit-entry") as HTMLInputElement;
BTN_EDIT_ENTRY.addEventListener("click", () => { DisplayEditWindow() })
function DisplayEditWindow() {
    // Carregar elementos com informações do lançamento
    const ENTRY_NAME = table.selectedEntry?.querySelector('.entry-name');
    const ENTRY_PAY_DATE = table.selectedEntry?.querySelector('.entry-pay-date');
    const ENTRY_VALUE = table.selectedEntry?.querySelector('.value');
    const ENTRY_TYPE = table.selectedEntry?.querySelector('.entry-type');
    const ENTRY_PAYMENT_TYPE = table.selectedEntry?.querySelector('.entry-pay-type');

    // Obter valores dos elementos
    let name = (ENTRY_NAME ? ENTRY_NAME.innerHTML : '');
    let value = (CurrencyToNumber(ENTRY_VALUE ? ENTRY_VALUE.innerHTML : '')).toString();
    let type = (ENTRY_TYPE?.innerHTML === 'ENTRADA' ? "ENTRADA" : "SAIDA");
    let paymentType = (ENTRY_PAYMENT_TYPE ? ENTRY_PAYMENT_TYPE?.innerHTML : '');
    let date = BrazilToDefaultDate(ENTRY_PAY_DATE ? ENTRY_PAY_DATE.textContent! : '');

    // Definir os valores nos inputs da janela
    IN_EDIT_ENTRY_NAME.value = name;
    IN_EDIT_ENTRY_DATE.valueAsDate = date;
    IN_EDIT_ENTRY_PRICE.value = value
    IN_EDIT_ENTRY_TYPE.value = type
    OP_EDIT_ENTRY_PAYTYPE.value = paymentType

    // Exibir janela de edição
    DisplayModal(true, "editar")
}

const BTN_CONFIRM_EDIT_ENTRY = document.querySelector("#button-confirm-edit") as HTMLInputElement;
BTN_CONFIRM_EDIT_ENTRY.addEventListener("click", () => { SaveEditedEntry(); })
async function SaveEditedEntry() {
    const ENTRY_ID_ELEMENT = table.selectedEntry?.querySelector('.entry-id')?.textContent;
    const ENTRY_ID = (ENTRY_ID_ELEMENT ? parseInt(ENTRY_ID_ELEMENT) : NaN);
    const ENTRY_NAME = IN_EDIT_ENTRY_NAME.value;
    const ENTRY_VALUE = parseFloat(String(IN_EDIT_ENTRY_PRICE.value).replace(',', '.'));
    const ENTRY_TYPE = (IN_EDIT_ENTRY_TYPE.value === 'ENTRADA' ? "ENTRADA" : "SAIDA");
    const ENTRY_PAYMENT_TYPE = OP_EDIT_ENTRY_PAYTYPE.value;
    const ENTRY_PAY_DATE = IN_EDIT_ENTRY_DATE.value;
    
    // Atualizar no banco de dados
    await table.UpdateEntry(ENTRY_ID, ENTRY_NAME, ENTRY_TYPE, ENTRY_VALUE, ENTRY_PAYMENT_TYPE, ENTRY_PAY_DATE)
    await table.LoadAllEntries();
    RefreshTotalProfit();
    
    // DisplayModal(false);
}

// - Detalhes do Lançamento
export function PopUp_UpdateDetailWindow() {
    // Elementos de Informação
    const DETAIL_NAME = document.getElementById("det-name");
    const DETAIL_TOTAL_VALUE = document.getElementById("det-total-value");
    const DETAIL_PAY_TYPE = document.getElementById("det-pay-type");
    const DETAIL_PAYED_IN = document.getElementById("det-payed-in");
    const DETAIL_CREATED_IN = document.getElementById("det-created-in");
    const DETAIL_CREATED_BY = document.getElementById("det-created-by");
    const DETAIL_EDITED_BY = document.getElementById("det-edited-by");

    // Informação do Lançamento a ser mostrado os detalhes
    const NAME = table.selectedEntry?.querySelector('.entry-name')?.textContent;
    const VALUE = table.selectedEntry?.querySelector('.value')?.textContent;
    const PAY_TYPE = table.selectedEntry?.querySelector('.entry-pay-type')?.textContent;
    const PAYMENT_DATE = table.selectedEntry?.querySelector('.entry-pay-date')?.textContent;
    const CREATE_DATE = table.selectedEntry?.querySelector('.entry-create-date')?.textContent;
    const CREATED_BY = table.selectedEntry?.querySelector('.created-by')?.textContent;
    const EDITED_BY = table.selectedEntry?.querySelector('.edited-by')?.textContent;

    // Adicionar detalhes do elemento selecionado
    if (DETAIL_NAME) DETAIL_NAME.innerText = (NAME ? NAME : '');
    if (DETAIL_TOTAL_VALUE) DETAIL_TOTAL_VALUE.innerText = (VALUE ? VALUE : '');
    if (DETAIL_PAY_TYPE) DETAIL_PAY_TYPE.innerText = (PAY_TYPE ? PAY_TYPE : '');
    if (DETAIL_PAYED_IN) DETAIL_PAYED_IN.innerText = (PAYMENT_DATE ? PAYMENT_DATE : '');
    if (DETAIL_CREATED_IN) DETAIL_CREATED_IN.innerText = (CREATE_DATE ? CREATE_DATE : '');
    if (DETAIL_CREATED_BY) DETAIL_CREATED_BY.innerText = (CREATED_BY ? CREATED_BY : '');
    if (DETAIL_EDITED_BY) DETAIL_EDITED_BY.innerText = (EDITED_BY ? EDITED_BY : '');

    // Se for um lançamento editado, exibir que já foi editado
    if (EDITED_BY?.length! > 0) {
        if (DETAIL_EDITED_BY) DETAIL_EDITED_BY.parentElement?.classList.remove("d-none");
    } else {
        if (DETAIL_EDITED_BY) DETAIL_EDITED_BY.parentElement?.classList.add("d-none");
    }
}

/* #endregion */

/* #region  Alerta */
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

/* #endregion */

// || OUTROS ---------------------
// Calcular Valor Total
export function RefreshTotalProfit() {
    const EL_TOTAL_PROFIT = document.querySelector("#total-profits")

    let allEntries = document.querySelectorAll('.value');
    let sum = 0;

    allEntries.forEach(entry => {
        // limpar a string até retornar uma float
        let textContent = entry.textContent || '';
        let value = CurrencyToNumber(textContent)

        // Verificar se é debito
        let isDebt = entry.closest("tr")?.classList.contains("entry-debt");

        sum += (isDebt ? -value : value);
    });

    // Colorir o texto de acordo com a situação da conta
    if (sum < 0) {
        EL_TOTAL_PROFIT?.classList.add("red-text");
    } else {
        EL_TOTAL_PROFIT?.classList.remove("red-text");
    }

    if (EL_TOTAL_PROFIT) EL_TOTAL_PROFIT.textContent = NumberToCurrency(sum);
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
        let value = CurrencyToNumber(entry.textContent ? entry.textContent : '')
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
    if (el_workerProfit) el_workerProfit.textContent = NumberToCurrency(sum);
}

// Tipos
type WindowName = 'adicionar' | 'editar' | 'remover' | 'detalhes'