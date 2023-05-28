/* 
    Este é o script da tabela financeira.
    Ela é especifico da tabela financeira
    já o "Finance page" é a página em geral 
*/
import { MakeRequest } from "../geral/js/request";
import * as financePage from "./finance-page";

let shopId = Cookies.get("shopId");
let accessType = Cookies.get("accessType").toUpperCase();
let accessName = Cookies.get("accessName").toUpperCase();

let storedEntries = [];
export let selectedEntry: HTMLElement | null;
let entryList: Array<Element>;

const TABLE_BODY = document.querySelector('tbody');

let paymentTypeNames = [
    'DINHEIRO',
    'C. DÉBITO',
    'C. CRÉDITO',
    'PIX'
]

/* -------------------------------------------------------------------------- */
/*                      Seleção de Lançamentos da Tabela                      */
/* -------------------------------------------------------------------------- */

function SelectRow(entry: HTMLElement) {
    entryList.forEach((row: Element) => { row.classList.remove("selected"); });
    entry.classList.add("selected");
    selectedEntry = entry;
}

// Criar lançamento visualmente na tabela do cliente
export function ReadEntry(id: string, name: string, createType: string, dateCreated: string, datePayed: string, createBy: string, value: number, payType: string, tableIndex: number) {
    let entry = document.createElement("tr");
    let entry_name = document.createElement("td");
    let ENTRY_TYPE = document.createElement("td");
    let ENTRY_DATE_CREATED = document.createElement("td");
    let ENTRY_DATE_PAY = document.createElement("td");
    let ENTRY_CREATED_BY = document.createElement("td");
    let ENTRY_VALUE = document.createElement("td");
    let ENTRY_EDITED_BY = document.createElement("p");
    let ENTRY_PAY_TYPE = document.createElement("p");
    let ENTRY_ID = document.createElement("p");
    let ENTRY_TABLE_INDEX = document.createElement("p");

    let isCredit = (createType === 'ENTRADA');

    // Nova Entrada
    entry.classList.add(isCredit ? "entry-credit" : "entry-debt");
    entry.classList.add("entry");
    entry.addEventListener("click", (e) => {SelectRow(entry)});
    entry.addEventListener("dblclick", ShowDetailDoubleClick(entry));

    // Nome do Lançamento
    entry_name.setAttribute('scope', 'row');
    entry_name.innerText = name;
    entry_name.classList.add("entry-name");
    entry.appendChild(entry_name);

    // Tipo de Lançamento
    ENTRY_TYPE.innerText = (isCredit ? "ENTRADA" : "SAÍDA");
    ENTRY_TYPE.classList.add("d-none");
    ENTRY_TYPE.classList.add("d-md-table-cell");
    ENTRY_TYPE.classList.add("entry-type");
    entry.appendChild(ENTRY_TYPE);

    // Dia Criado
    ENTRY_DATE_CREATED.innerText = dateCreated;
    ENTRY_DATE_CREATED.classList.add("d-none");
    ENTRY_DATE_CREATED.classList.add("d-md-table-cell");
    ENTRY_DATE_CREATED.classList.add("entry-create-date");
    entry.appendChild(ENTRY_DATE_CREATED);

    // Dia Pago
    ENTRY_DATE_PAY.innerText = datePayed;
    ENTRY_DATE_PAY.classList.add("entry-pay-date");
    entry.appendChild(ENTRY_DATE_PAY);

    // Criado Por
    ENTRY_CREATED_BY.innerText = createBy;
    ENTRY_CREATED_BY.classList.add("d-none");
    ENTRY_CREATED_BY.classList.add("d-md-table-cell");
    ENTRY_CREATED_BY.classList.add("created-by");
    entry.appendChild(ENTRY_CREATED_BY);

    // Valor
    ENTRY_VALUE.innerText = financePage.FloatToMoney(value);
    ENTRY_VALUE.classList.add("value");
    entry.appendChild(ENTRY_VALUE);

    // Editado por
    ENTRY_EDITED_BY.classList.add("d-none")
    ENTRY_EDITED_BY.innerText = "";
    entry.appendChild(ENTRY_EDITED_BY);

    // Tipo de Pagamento
    ENTRY_PAY_TYPE.classList.add("d-none")
    ENTRY_PAY_TYPE.classList.add("entry-pay-type")
    ENTRY_PAY_TYPE.innerText = payType;
    entry.appendChild(ENTRY_PAY_TYPE);

    // ID
    ENTRY_ID.classList.add("d-none")
    ENTRY_ID.classList.add("entry-id")
    ENTRY_ID.innerText = id;
    entry.appendChild(ENTRY_ID);

    ENTRY_TABLE_INDEX.classList.add("d-none")
    ENTRY_TABLE_INDEX.classList.add("table-index")
    ENTRY_TABLE_INDEX.innerText = tableIndex.toString();
    entry.appendChild(ENTRY_TABLE_INDEX);
    
    if (TABLE_BODY) TABLE_BODY.appendChild(entry);

    let entryElementList = document.querySelectorAll("tr");
    entryElementList.forEach(element => { entryList.push(element) });
    financePage.RefreshTotalProfit();
}

export function ShowDetailDoubleClick(entry: HTMLElement) {
    return function () {
        // SelectRow(entry);
        financePage.DisplayPopup(true, 3);
        financePage.PopUp_UpdateDetailWindow();
    }
}

/* -------------------------------------------------------------------------- */
/*                               Gerenciar dados                              */
/* -------------------------------------------------------------------------- */
// Salvar no Banco de Dados
export async function SaveEntry(name: string, createType: string, dateCreated: string, datePayed: string, createBy: string, valor: string, payType: string) {
    let TipoDeLancamento, DiaCriado
    TipoDeLancamento = (createType === 'ENTRADA' ? 'ENTRADA' : 'SAÍDA')

    let DiaCriadoSplit = dateCreated.split('/')
    DiaCriado = DiaCriadoSplit[2] + '-' + DiaCriadoSplit[1] + '-' + DiaCriadoSplit[0]

    let jsonRequest = JSON.stringify({
        nome: name,
        tipo: TipoDeLancamento,
        diaCriado: DiaCriado,
        diaPago: datePayed,
        criadoPor: createBy,
        valor: parseFloat(valor),
        formaDePagamento: payType,
        cliente: "",
        id_barbearia: shopId
    });

    MakeRequest('/ajax/financial/', 'post', jsonRequest);
}

// Salvar no Banco de Dados
export async function UpdateEntry(id: number, name: string, createType: string, datePayed: string, valor: number, payType: string) {
    let jsonRequest = JSON.stringify({
        id: id,
        nome: name,
        tipo: createType,
        diaPago: datePayed,
        valor: valor,
        formaDePagamento: payType,
        cliente: "",
        id_barbearia: shopId
    });

    MakeRequest('/ajax/financial/', 'put', jsonRequest);
}

// Carregar todos os lançamentos do banco de dados
export async function LoadAllEntries() {
    // Obter Lista de Lançamentos da base de dados
    let params = '?shopId=' + shopId;
    let loadEntryList = await MakeRequest('/ajax/financial' + params, 'get')

    // Limpar tabela atual do lado cliente
    
    if (TABLE_BODY) while (TABLE_BODY.firstChild) {
        TABLE_BODY.removeChild(TABLE_BODY.firstChild);
    }

    // Resetar lista de lançamentos
    entryList = [];
    
    // Adicionar lançamentos, porém não exibir todos se não for proprietário
    loadEntryList.forEach((entry: any, index: number) => {
        // Se não for gerente, exibir apenas pagamentos do individuo
        if (!accessType.includes("GERENCIADOR") && entry.createBy != accessName) {
            return;
        }

        // criar lançamento
        let diaCriado = entry.diaCriado.split("-")
        diaCriado = `${diaCriado[2]}/${diaCriado[1]}/${diaCriado[0]}`
        
        let diaPago = entry.diaPago.split("-")
        diaPago = `${diaPago[2]}/${diaPago[1]}/${diaPago[0]}`

        ReadEntry (
            entry.id,
            entry.nome,
            entry.tipo,
            diaCriado,
            diaPago,
            entry.criadoPor,
            entry.valor,
            entry.formaDePagamento,
            index
        );
    });
}

// Remover lançamento da base de dados
export async function RemoveEntry() {
    let entryToDelete = selectedEntry?.querySelector(".entry-id")?.innerHTML;
    let params = `'?id=${entryToDelete}&shopId=${shopId}`;

    await MakeRequest('/ajax/financial' + params, 'delete')

    await LoadAllEntries();

    selectedEntry = null;
    financePage.RefreshTotalProfit();
}

// /* -------------------------------------------------------------------------- */
// /*                  Menu de Contexto, botão direito do mouse                  */
// /* -------------------------------------------------------------------------- */
// export function ShowContextMenu(positionX, positionY) {
//     let el_contextMenu = document.querySelector(".context-menu");
//     if (el_contextMenu != null) { el_contextMenu.remove(); }

//     CreateContextMenu(positionX, positionY);
// }

// function CreateContextMenu(positionX, positionY)
// {
//     let el_contextMenu = document.createElement("div")
//     el_contextMenu.classList.add("context-menu");
//     el_contextMenu.style.setProperty('--mouseX', positionX + 'px');
//     el_contextMenu.style.setProperty('--mouseY', positionY + 'px');

//     let el_editButton = document.createElement("a");
//     el_editButton.innerText = "Editar";
//     el_editButton.addEventListener("click", (event) => 
//     {
//         event.preventDefault();
//         displayEditWindow();
//     })

//     let el_detailButton = document.createElement("a");
//     el_detailButton.innerText = "Detalhes";
//     el_detailButton.addEventListener("click", table.ShowDetailDoubleClick())

//     el_contextMenu.appendChild(el_editButton);
//     el_contextMenu.appendChild(el_detailButton);

//     document.body.appendChild(el_contextMenu);
// }