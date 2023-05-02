// Variaveis
let serviceTable = document.getElementById("service-table")
let hasUpdatedTable = false

let btn_SaveChanges = document.querySelector("#btn_save-to-database")

let OpensAt = 0;
let ClosesAt = 0;
let WorkDays = [1,1,1,1,1,1,1];
let FirstWorkDay = 0;

let inp_opensAt = document.querySelector("#start-work")
let inp_closesAt = document.querySelector("#end-work")
let chk_WorkDays = document.querySelector("#day-work-select").querySelectorAll('input[type=checkbox]')
let rad_FirstWorkDay = document.querySelector("#first-day-radio").querySelectorAll('input[type=radio]')

let dayNames = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"]

let shopId = Cookies.get("shopId")

/* -------------------------------------------------------------------------- */
/*               Preencher Select Com As Barbearias Cadastradas               */
/* -------------------------------------------------------------------------- */
GetShopList()

async function GetShopList() {
    // Obter nome da barbearia
    let params = '?shopId=' + shopId
    let shopName = await MakeRequest('/ajax/shop' + params, 'get')
    
    let shopName_el = document.querySelector('#shop-name')
    shopName_el.innerText = shopName.shopName

    // Limpa a Tabela de Serviços
    hasUpdatedTable = true

    LoadSettings()
}

async function LoadSettings(ShopID) {
    // Limpar a Tabela
    hasUpdatedTable = true

    // Obter lista de Serviços do Banco de Dados
    params = '?ShopID=' + shopId
    let shopConfig = await MakeRequest('/ajax/shop/config' + params, 'get')

    let OpensAt = shopConfig.AbreAs;
    let ClosesAt = shopConfig.FechaAs;

    // Carregar quais dias a Barbearia abre ou não
    // Se não está presente na configuração da Barbearia, o dia será desabilitado
    WorkDays = [1,1,1,1,1,1,1]
    if (!shopConfig.DiasDeTrabalho.includes("dom"))
        WorkDays[0] = 0
    if (!shopConfig.DiasDeTrabalho.includes("seg"))
        WorkDays[1] = 0
    if (!shopConfig.DiasDeTrabalho.includes("ter"))
        WorkDays[2] = 0
    if (!shopConfig.DiasDeTrabalho.includes("qua"))
        WorkDays[3] = 0
    if (!shopConfig.DiasDeTrabalho.includes("qui"))
        WorkDays[4] = 0
    if (!shopConfig.DiasDeTrabalho.includes("sex"))
        WorkDays[5] = 0
    if (!shopConfig.DiasDeTrabalho.includes("sab"))
        WorkDays[6] = 0

    // Qual é o primeiro dia da semana a ser exibido no calendario
    switch (shopConfig.PrimeiroDiaDaSemana) {
        default:
            FirstWorkDay = 0;
            break;
        case "seg":
            FirstWorkDay = 1;
            break;
        case "ter":
            FirstWorkDay = 2;
            break;
        case "qua":
            FirstWorkDay = 3;
            break;
        case "qui":
            FirstWorkDay = 4;
            break;
        case "sex":
            FirstWorkDay = 5;
            break;
        case "sab":
            FirstWorkDay = 6;
            break;
    }

    // Alterar o valor da caixa para o valor obtido do banco de dados
    inp_opensAt.value = OpensAt
    inp_closesAt.value = ClosesAt
    rad_FirstWorkDay[FirstWorkDay].checked = true
    for (let day = 0; day < chk_WorkDays.length; day++) {
        chk_WorkDays[day].checked = WorkDays[day]
    }
}

// Salvar alterações para a base de dados
btn_SaveChanges.addEventListener("click", async function() {
    if (!hasUpdatedTable) 
        return
        
    let AbreAs = new Date('2023-03-31T' + inp_opensAt.value + 'Z')
    let FechaAs = new Date('2023-03-31T' + inp_closesAt.value + 'Z')
    let DiasDeTrabalho = ""
    let DiasDeTrabalhoArray = []
    let PrimeiroDiaDaSemana = ""
    for (let index = 0; index < rad_FirstWorkDay.length; index++) {
        if (rad_FirstWorkDay[index].checked == true)
        {
            PrimeiroDiaDaSemana = dayNames[index]
            break
        }
    }

    if (chk_WorkDays[0].checked)
        DiasDeTrabalhoArray.push("dom")
    if (chk_WorkDays[1].checked)
        DiasDeTrabalhoArray.push("seg")
    if (chk_WorkDays[2].checked)
        DiasDeTrabalhoArray.push("ter")
    if (chk_WorkDays[3].checked)
        DiasDeTrabalhoArray.push("qua")
    if (chk_WorkDays[4].checked)
        DiasDeTrabalhoArray.push("qui")
    if (chk_WorkDays[5].checked)
        DiasDeTrabalhoArray.push("sex")
    if (chk_WorkDays[6].checked)
        DiasDeTrabalhoArray.push("sab")

    DiasDeTrabalho = DiasDeTrabalhoArray.toString()

    console.log(shopId, AbreAs, FechaAs, DiasDeTrabalho, PrimeiroDiaDaSemana);

    let jsonRequest = JSON.stringify({
        ShopID: shopId,
        AbreAs: AbreAs,
        FechaAs: FechaAs,
        DiasDeTrabalho: DiasDeTrabalho,
        PrimeiroDiaDaSemana: PrimeiroDiaDaSemana
    })

    await MakeRequest('/ajax/shop/config', 'put', jsonRequest)
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