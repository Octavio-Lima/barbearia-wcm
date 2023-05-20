import { MakeRequest } from "/static/geral/js/request.js";

// Variaveis
let serviceTable = document.getElementById("service-table")
let hasUpdatedTable = false

let btn_SaveChanges = document.querySelector("#btn_save-to-database")
let shop_workDays = {'sun': true, 'mon': true, 'tue': true, 
    'wed': true, 'thu': true, 'fri': true, 'sat': true}

let inp_opensAt = document.querySelector("#start-work")
let inp_closesAt = document.querySelector("#end-work")
let chk_WorkDays = document.querySelector("#day-work-select").querySelectorAll('input[type=checkbox]')
let rad_FirstWorkDay = document.querySelector("#first-day-radio").querySelectorAll('input[type=radio]')

let dayNames = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"]

let shop_id = Cookies.get("shopId")

/* -------------------------------------------------------------------------- */
/*               Preencher Select Com As Barbearias Cadastradas               */
/* -------------------------------------------------------------------------- */
GetShopList()

async function GetShopList() {
    // Obter nome da barbearia
    let params = '?shopId=' + shop_id
    let shopName = await MakeRequest('/ajax/shop' + params, 'get')
    
    let shopName_el = document.querySelector('#shop-name')
    shopName_el.innerText = shopName.shopName

    // Limpa a Tabela de Serviços
    hasUpdatedTable = true

    LoadSettings()
}

async function LoadSettings() {
    // Limpar a Tabela
    hasUpdatedTable = true

    // Obter lista de Serviços do Banco de Dados
    let params = '?shopId=' + shop_id
    let shopConfig = await MakeRequest('/ajax/shop/config' + params, 'get')

    // quando a barbearia fecha e abre
    let shop_opensAt = shopConfig.opensAt;
    let shop_closesAt = shopConfig.closesAt;

    // Obter quais dias a barbearia abre ou não
    for (const [key] of Object.entries(shop_workDays)) {
        if (!shopConfig.workDays.includes(key)) {
            shop_workDays[key] = false;
        }
    }

    // Qual é o primeiro dia da semana a ser exibido no calendario
    let shop_firstWeekDay = GetFirstWorkDayNumber(shopConfig.firstWeekDay);

    // Alterar o valor da caixa para o valor obtido do banco de dados
    inp_opensAt.value = shop_opensAt
    inp_closesAt.value = shop_closesAt

    // radio de primeiro dia da semana
    rad_FirstWorkDay[shop_firstWeekDay].checked = true
    
    // checkbox de dias de trabalho
    let dayIndex = 0;
    for (const [key, value] of Object.entries(shop_workDays)) {
        chk_WorkDays[dayIndex].checked = value;
        dayIndex++;
    }
}

// Salvar alterações para a base de dados
btn_SaveChanges.addEventListener("click", async () => {
    if (!hasUpdatedTable) 
        return
    
    // horarios
    let opensAt = new Date('2023-03-31T' + inp_opensAt.value + 'Z')
    let closesAt = new Date('2023-03-31T' + inp_closesAt.value + 'Z')

    // Dias de trabalho
    let workDays = [];
    let index = 0;
    for (const [key] of Object.entries(shop_workDays)) {
        if (chk_WorkDays[index].checked) {
            workDays.push(key)
        }
        index++;
    }

    workDays = workDays.toString()

    // Primeiro dia da semana
    let firstWorkDay = 'asd';
    let fwdIndex = 0;
    for (const [key] of Object.entries(shop_workDays)) {
        if (rad_FirstWorkDay[fwdIndex].checked == true) {
            firstWorkDay = key;
            break;
        }
        fwdIndex++;
    }

    // Enviar requisição
    let jsonRequest = JSON.stringify({
        shopId: shop_id,
        opensAt: opensAt,
        closesAt: closesAt,
        workDays: workDays,
        firstWeekDay: firstWorkDay
    })

    await MakeRequest('/ajax/shop/config', 'put', jsonRequest)
})

// Obtem qual o index do dia da semana
function GetFirstWorkDayNumber(dayName) {
    let index = 0;
    for (const [key] of Object.entries(shop_workDays)) {
        if (dayName == key) {
            return index;
        }
        index++;
    };
}