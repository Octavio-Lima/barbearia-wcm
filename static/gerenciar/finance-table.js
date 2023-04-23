/* 
    Este é o script da tabela financeira.
    Ela é especifico da tabela financeira
    já o "Finance page" é a página em geral 
*/

import {PopUp_UpdateDetailWindow} from "./finance-page.js";
import {updateProfitCounter} from "./finance-page.js";
import {toMoneyFormat} from "./finance-page.js";
import {displayPopup} from "./finance-page.js";
import {showContextMenu} from "./finance-page.js";

// {id:"", name:"", createType:"", dateCreated:"", datePayed:"", createBy:"", value:"", payType:""}
export let storedEntries = [];
export let selectedEntry = null;
let entryList;

let paymentTypeNames = [
    'DINHEIRO',
    'C. DÉBITO',
    'C. CRÉDITO',
    'PIX'
]

/* -------------------------------------------------------------------------- */
/*                      Seleção de Lançamentos da Tabela                      */
/* -------------------------------------------------------------------------- */

function selectRow(entry)
{
    entryList.forEach((row) =>
    {
        row.classList.remove("selected");
    });

    entry.classList.add("selected");
    selectedEntry = entry;
}

/* -------------------------- Criar Novo Lançamento ------------------------- */

export function addNewEntry(storeIt, id,  name, createType, dateCreated, datePayed, createBy, value, payType, tableIndex)
{
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

    let isCredit = (createType === 'true');

    // Nova Entrada
    entry.classList.add(isCredit ? "entry-credit" : "entry-debt");
    entry.classList.add("entry");
    entry.addEventListener("click", (e) => {selectRow(entry)});
    entry.addEventListener("dblclick", showDetailDoubleClick(entry));
    entry.addEventListener("contextmenu", (e) =>
    {
        e.preventDefault();
        selectRow(entry);
        showContextMenu(e.clientX, e.clientY)
    })

    // Nome do Lançamento
    entry_name.setAttribute('scope', 'row');
    entry_name.innerText = name;
    entry.appendChild(entry_name);

    // Tipo de Lançamento
    ENTRY_TYPE.innerText = (isCredit ? "Entrada" : "Saída");
    ENTRY_TYPE.classList.add("d-none");
    ENTRY_TYPE.classList.add("d-md-table-cell");
    entry.appendChild(ENTRY_TYPE);

    // Dia Criado
    ENTRY_DATE_CREATED.innerText = dateCreated;
    ENTRY_DATE_CREATED.classList.add("d-none");
    ENTRY_DATE_CREATED.classList.add("d-md-table-cell");
    entry.appendChild(ENTRY_DATE_CREATED);

    // Dia Pago
    ENTRY_DATE_PAY.innerText = datePayed;
    entry.appendChild(ENTRY_DATE_PAY);

    // Criado Por
    ENTRY_CREATED_BY.innerText = createBy;
    ENTRY_CREATED_BY.classList.add("d-none");
    ENTRY_CREATED_BY.classList.add("d-md-table-cell");
    ENTRY_CREATED_BY.classList.add("created-by");
    entry.appendChild(ENTRY_CREATED_BY);

    // Valor
    ENTRY_VALUE.innerText = toMoneyFormat(value);
    ENTRY_VALUE.classList.add("value");
    entry.appendChild(ENTRY_VALUE);

    // Editado por
    ENTRY_EDITED_BY.classList.add("d-none")
    ENTRY_EDITED_BY.innerText = "";
    entry.appendChild(ENTRY_EDITED_BY);

    // Tipo de Pagamento
    ENTRY_PAY_TYPE.classList.add("d-none")
    ENTRY_PAY_TYPE.innerText = payType;
    entry.appendChild(ENTRY_PAY_TYPE);

    // ID
    ENTRY_ID.classList.add("d-none")
    ENTRY_ID.innerText = id;
    entry.appendChild(ENTRY_ID);

    ENTRY_TABLE_INDEX.classList.add("d-none")
    ENTRY_TABLE_INDEX.classList.add("table-index")
    ENTRY_TABLE_INDEX.innerText = tableIndex;
    entry.appendChild(ENTRY_TABLE_INDEX);
    
    document.querySelector("tbody").appendChild(entry);

    // Store it, Update List and Total Value
    
    if (storeIt) { storeNewEntry(name, createType, dateCreated, datePayed, createBy, value, payType); }

    refreshEntryList()
    updateProfitCounter();
}

export function showDetailDoubleClick(entry)
{
    return function ()
    {
        // selectRow(entry);
        displayPopup(true, 3);
        PopUp_UpdateDetailWindow();
    }
}

/* -------------------------------------------------------------------------- */
/*        Gerenciamento de Lançamentos Guardados no Armazenamento Local       */
/* -------------------------------------------------------------------------- */

export function refreshEntryList()
{
    entryList = document.querySelectorAll("tr");
}

export function checkEntryList()
{
    const localStorageEntries = JSON.parse(localStorage.getItem("entryList"));
    
    // console.table(localStorageEntries);

    if (localStorageEntries != null) {
        storedEntries = localStorageEntries;
        // console.log(storedEntries);
    //     storedEntries.push(localStorageEntries);
    //     console.table(storedEntries);
    }
}

/* ------------------------ Salvar no Banco de Dados ------------------------ */
async function storeNewEntry(name, createType, dateCreated, datePayed, createBy, value, payType)
{
    let TipoDeLancamento, DiaCriado, FormaDePagamento
    TipoDeLancamento = (createType === 'true' ? 'ENTRADA' : 'SAÍDA')

    let DiaCriadoSplit = dateCreated.split('/')
    DiaCriado = DiaCriadoSplit[2] + '-' + DiaCriadoSplit[1] + '-' + DiaCriadoSplit[0]

    let jsonRequest = JSON.stringify({
        nomeLançamento: name,
        tipoDeLançamento: TipoDeLancamento,
        diaCriado: DiaCriado,
        diaPago: datePayed,
        criadoPor: createBy,
        valor: parseFloat(value),
        formaDePagamento: payType
    });

    let url = "http://localhost:5018/api/finance/CreateFinanceTableEntry"

    const response = await fetch (url, {
        method:"POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers:{
            "content-type":"application/json; charset=UTF-8"
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: jsonRequest
    });

    if (response.ok) {
        let bodyResponse = await response.text();
    } else {
        alert("HTTP-Error: " + response.status);
    }
}

/* ----------------------- Ler do Armazenamento Local ----------------------- */

export async function loadSavedEntries()
{
    // Obter Lista de Lançamentos da base de dados
    let jsonRequest = JSON.stringify({
        nomeLançamento: "",
        tipoDeLançamento: "",
        diaCriado: "",
        diaPago: "",
        criadoPor: "",
        valor: 0,
        formaDePagamento: ""
    });

    let url = "http://localhost:5018/api/finance/LoadFinanceTableEntries"

    const response = await fetch (url, {
        method:"POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers:{
            "content-type":"application/json; charset=UTF-8"
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: jsonRequest
    });

    if (!response.ok)
        return
    
    let bodyResponse = await response.text();
    let dbEntryList = JSON.parse(bodyResponse)
    console.log(dbEntryList);

    if (dbEntryList.length == 0)
        return

    // Limpar tabela atual do lado cliente
    let tableList = document.querySelector("tbody")
    while (tableList.firstChild)
    {
        tableList.removeChild(tableList.firstChild);
    }

    refreshEntryList();
    
    // Adicionar lançamentos, porém não exibir todos se não for proprietário
    let userAccessType = localStorage.getItem("accessType");
    let userName = localStorage.getItem("accessName");
    
    if (!userAccessType.includes("GERENCIADOR"))
    {
        for (let index = 0; index < dbEntryList.length; index++)
        {
            if (dbEntryList[index].createBy == userName)
            {
                let DiaCriadoSplit = dbEntryList[index].diaCriado.split("T")
                DiaCriadoSplit = DiaCriadoSplit[0].split("-")
                let DiaCriado = DiaCriadoSplit[2] + "/" + DiaCriadoSplit[1] + "/" + DiaCriadoSplit[0]
    
                let DiaPagoSplit = dbEntryList[index].diaPago.split("T")
                DiaPagoSplit = DiaPagoSplit[0].split("-")
                let DiaPago = DiaPagoSplit[2] + "/" + DiaPagoSplit[1] + "/" + DiaPagoSplit[0]
                addNewEntry
                (
                    false,
                    0, // dbEntryList[index].id,
                    dbEntryList[index].nomeLançamento,
                    dbEntryList[index].tipoDeLançamento,
                    DiaCriado,
                    DiaPago,
                    dbEntryList[index].criadoPor,
                    dbEntryList[index].valor,
                    dbEntryList[index].formaDePagamento,
                    index
                );
            }
        }
    }
    else
    {
        for (let index = 0; index < dbEntryList.length; index++)
        {
            let DiaCriadoSplit = dbEntryList[index].diaCriado.split("T")
            DiaCriadoSplit = DiaCriadoSplit[0].split("-")
            let DiaCriado = DiaCriadoSplit[2] + "/" + DiaCriadoSplit[1] + "/" + DiaCriadoSplit[0]

            let DiaPagoSplit = dbEntryList[index].diaPago.split("T")
            DiaPagoSplit = DiaPagoSplit[0].split("-")
            let DiaPago = DiaPagoSplit[2] + "/" + DiaPagoSplit[1] + "/" + DiaPagoSplit[0]
            addNewEntry
            (
                false,
                0, // dbEntryList[index].id,
                dbEntryList[index].nomeLançamento,
                dbEntryList[index].tipoDeLançamento,
                DiaCriado,
                DiaPago,
                dbEntryList[index].criadoPor,
                dbEntryList[index].valor,
                dbEntryList[index].formaDePagamento,
                index
            );
        }
    }
}

/* --------------------- Remover do Armazenamento Local --------------------- */

export function removeEntry()
{
    removedSavedEntry(selectedEntry);
    selectedEntry.remove();
    selectedEntry = null;
    updateProfitCounter();
}

export function removedSavedEntry(entry)
{
    let indexToDelete = entry.querySelector(".table-index").innerText;
    storedEntries.splice(indexToDelete, 1);

    localStorage.removeItem("entryList");
    localStorage.setItem("entryList", JSON.stringify(storedEntries));

    loadSavedEntries();
}