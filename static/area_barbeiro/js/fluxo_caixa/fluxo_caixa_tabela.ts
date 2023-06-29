/* 
    Este é o script da tabela financeira.
    Ela é especifico da tabela financeira
    já o "Finance page" é a página em geral 
*/
import { PadNumber, ToBrazilDate, ToCurrency } from "../../../geral/js/formating.js";
import { GetCookie, MakeRequest } from "../../../geral/js/utility.js";
import * as financePage from "./fluxo_caixa.js";

const SHOP_ID = GetCookie("shopId");
const ACCESS_TYPE = GetCookie("accessType");
const USERNAME = GetCookie("accessName");

export let selectedEntry: HTMLElement | null;
let entryList: Array<Element>;

/* -------------------------------------------------------------------------- */
/*                      Seleção de Lançamentos da Tabela                      */
/* -------------------------------------------------------------------------- */

function SelectRow(entry: HTMLElement) {
    entryList.forEach((row: Element) => { row.classList.remove("selected"); });
    entry.classList.add("selected");
    selectedEntry = entry;
}

// Criar lançamento visualmente na tabela do cliente
export function ReadEntry(entry: FinanceEntry, tableIndex: number) {
    const IS_CREDIT = (entry.type === 'ENTRADA');

    // Nova Entrada
    const FINANCE_ENTRY = document.createElement("tr");
    FINANCE_ENTRY.classList.add(IS_CREDIT ? "entry-credit" : "entry-debt");
    FINANCE_ENTRY.classList.add("entry");
    FINANCE_ENTRY.addEventListener("click", (e) => {SelectRow(FINANCE_ENTRY)});
    FINANCE_ENTRY.addEventListener("dblclick", ShowDetailDoubleClick(FINANCE_ENTRY));

    // Nome do Lançamento
    const entry_name = document.createElement("td");
    entry_name.setAttribute('scope', 'row');
    if (entry_name) entry_name.innerText = entry.name;
    entry_name.classList.add("entry-name");
    FINANCE_ENTRY.appendChild(entry_name);
    
    // Tipo de Lançamento
    const ENTRY_TYPE = document.createElement("td");
    ENTRY_TYPE.innerText = (IS_CREDIT ? "ENTRADA" : "SAÍDA");
    ENTRY_TYPE.classList.add("d-none");
    ENTRY_TYPE.classList.add("d-md-table-cell");
    ENTRY_TYPE.classList.add("entry-type");
    FINANCE_ENTRY.appendChild(ENTRY_TYPE);
    
    // Dia Criado
    const ENTRY_DATE_CREATED = document.createElement("td");
    ENTRY_DATE_CREATED.innerText = ToBrazilDate(entry.createDate);
    ENTRY_DATE_CREATED.classList.add("d-none");
    ENTRY_DATE_CREATED.classList.add("d-md-table-cell");
    ENTRY_DATE_CREATED.classList.add("entry-create-date");
    FINANCE_ENTRY.appendChild(ENTRY_DATE_CREATED);
    
    // Dia Pago
    const ENTRY_DATE_PAY = document.createElement("td");
    ENTRY_DATE_PAY.innerText = ToBrazilDate(entry.payDate);
    ENTRY_DATE_PAY.classList.add("entry-pay-date");
    FINANCE_ENTRY.appendChild(ENTRY_DATE_PAY);
    
    // Criado Por
    const ENTRY_CREATED_BY = document.createElement("td");
    ENTRY_CREATED_BY.innerText = entry.createdBy;
    ENTRY_CREATED_BY.classList.add("d-none");
    ENTRY_CREATED_BY.classList.add("d-md-table-cell");
    ENTRY_CREATED_BY.classList.add("created-by");
    FINANCE_ENTRY.appendChild(ENTRY_CREATED_BY);
    
    // Valor
    const ENTRY_VALUE = document.createElement("td");
    ENTRY_VALUE.innerText = ToCurrency(entry.value);
    ENTRY_VALUE.classList.add("value");
    FINANCE_ENTRY.appendChild(ENTRY_VALUE);
    
    // Editado por
    const ENTRY_EDITED_BY = document.createElement("p");
    ENTRY_EDITED_BY.classList.add("d-none")
    ENTRY_EDITED_BY.classList.add("edited-by")
    ENTRY_EDITED_BY.innerText = "";
    FINANCE_ENTRY.appendChild(ENTRY_EDITED_BY);
    
    // Tipo de Pagamento
    const ENTRY_PAY_TYPE = document.createElement("p");
    ENTRY_PAY_TYPE.classList.add("d-none")
    ENTRY_PAY_TYPE.classList.add("entry-pay-type")
    ENTRY_PAY_TYPE.innerText = entry.paymentType;
    FINANCE_ENTRY.appendChild(ENTRY_PAY_TYPE);
    
    // ID
    const ENTRY_ID = document.createElement("p");
    ENTRY_ID.classList.add("d-none")
    ENTRY_ID.classList.add("entry-id")
    ENTRY_ID.innerText = entry.id.toString();
    FINANCE_ENTRY.appendChild(ENTRY_ID);
    
    const ENTRY_TABLE_INDEX = document.createElement("p");
    ENTRY_TABLE_INDEX.classList.add("d-none")
    ENTRY_TABLE_INDEX.classList.add("table-index")
    ENTRY_TABLE_INDEX.innerText = tableIndex.toString();
    FINANCE_ENTRY.appendChild(ENTRY_TABLE_INDEX);
    
    const entryElementList = document.querySelectorAll("tr");
    entryElementList.forEach(element => { entryList.push(element) });
    financePage.RefreshTotalProfit();
    
    return FINANCE_ENTRY;
}

export function ShowDetailDoubleClick(entry: HTMLElement) {
    return function () {
        // SelectRow(entry);
        financePage.DisplayModal(true, "detalhes");
        financePage.PopUp_UpdateDetailWindow();
    }
}

/* -------------------------------------------------------------------------- */
/*                               Gerenciar dados                              */
/* -------------------------------------------------------------------------- */
// Salvar no Banco de Dados
export async function SaveEntry(formElement: HTMLFormElement/*name: string, createType: string, dateCreated: string, datePayed: string, createBy: string, valor: string, payType: string*/) {
    // Criar o formulario em dados
    const FORM = new FormData(formElement);
    
    // Obter se é entrada ou saida
    const ENTRY_TYPE = (FORM.get('entry-type') === 'ENTRADA' ? 'ENTRADA' : 'SAÍDA')
    
    // Obter dia criado
    const CREATION_DATE = new Date();

    // Realizar requisição
    const JSON_REQUEST = JSON.stringify({
        name: FORM.get('entry-name'),
        type: ENTRY_TYPE,
        createDate: `${CREATION_DATE.getFullYear()}-${PadNumber(CREATION_DATE.getMonth() + 1)}-${PadNumber(CREATION_DATE.getDate())}`,
        payDate: FORM.get('entry-date'),
        createdBy: (FORM.get('entry-created-by') === null ? '' : FORM.get('entry-created-by')),
        value: FORM.get('entry-value'),
        paymentType: FORM.get('pay-type'),
        client: (FORM.get('entry-client') === null ? '' : FORM.get('entry-client')),
        shopId: SHOP_ID
    });

    await MakeRequest('/ajax/financial/', 'post', JSON_REQUEST);
}

// Salvar no Banco de Dados
export async function UpdateEntry(id: number, name: string, createType: string, value: number, payType: string, datePayed: string) {
    let jsonRequest = JSON.stringify({
        id: id,
        name: name,
        type: createType,
        value: value,
        payDate: datePayed,
        paymentType: payType,
        shopId: SHOP_ID
    });

    await MakeRequest('/ajax/financial/', 'put', jsonRequest);
}

// Carregar todos os lançamentos do banco de dados
export async function LoadAllEntries() {
    // Obter Lista de Lançamentos da base de dados
    let params = `?shopId=${SHOP_ID}`;
    let request = await MakeRequest(`/ajax/financial${params}`, 'get')

    if (request.status != 200) return;

    const databaseEntryList = await request.json();
    
    // Limpar tabela atual do lado cliente
    const TABLE_BODY = document.querySelector('tbody');
    if (TABLE_BODY) TABLE_BODY.innerHTML = '';

    // Resetar lista de lançamentos
    entryList = [];
    
    // Adicionar lançamentos, porém não exibir todos se não for proprietário
    databaseEntryList.forEach((entry: FinanceEntry, index: number) => {
        // TODO: No futuro adicionar que apenas o gerente pode ver todos os lançamentos, usuario comum só deve ver o dele
        // Se não for gerente, exibir apenas pagamentos do individuo
        // if (!ACCESS_TYPE.includes("GERENCIADOR") && entry.createBy != USERNAME) {
        //     return;
        // }
        
        // criar lançamento
        const NEW_ENTRY = ReadEntry(entry, index);
        TABLE_BODY?.append(NEW_ENTRY);
    });
}

// Remover lançamento da base de dados
export async function RemoveEntry() {
    const ENTRY_ID = selectedEntry?.querySelector(".entry-id")?.innerHTML;
    const PARAMS = `?id=${ENTRY_ID}&shopId=${SHOP_ID}`;
    await MakeRequest(`/ajax/financial${PARAMS}`, 'delete')
    
    // Recarregar tabela
    await LoadAllEntries();
    selectedEntry = null;
}

// Types
type FinanceEntry = {
    id: number,
    name: string,
    type: string,
    createDate: Date,
    payDate: Date,
    createdBy: string,
    value: number,
    paymentType: string,
    client: string,
    shopId: number
}