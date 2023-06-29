import { GetCookie, MakeRequest } from "../../../geral/js/utility.js";
// Variaveis
let SHOP_WORK_DAYS = { 'sun': false, 'mon': false, 'tue': false,
    'wed': false, 'thu': false, 'fri': false, 'sat': false };
let OPENS_AT = document.getElementById("start-work");
let CLOSES_AT = document.getElementById("end-work");
let WORKDAY_CHECKBOXES = document.getElementById("day-work-select")?.querySelectorAll('input[type=checkbox]');
let RADIO_FIRST_WORKDAY = document.getElementById("first-day-radio")?.querySelectorAll('input[type=radio]');
/* -------------------------------------------------------------------------- */
/*               Preencher Select Com As Barbearias Cadastradas               */
/* -------------------------------------------------------------------------- */
LoadSettings();
async function LoadSettings() {
    // Obter lista de Serviços do Banco de Dados
    let params = '?shopId=' + GetCookie('shopId');
    let request = await MakeRequest('/ajax/shop/config' + params, 'get');
    if (request.status != 200)
        return;
    let shopConfig = await request.json();
    // quando a barbearia fecha e abre
    const shop_opensAt = shopConfig.opensAt;
    const shop_closesAt = shopConfig.closesAt;
    // Obter quais dias a barbearia não abre
    // Se o nome do dia (chave) não estiver presente no JSON, 
    // marcar que nesse dia a barbearia não abre 
    for (const [dayName] of Object.entries(SHOP_WORK_DAYS)) {
        if (shopConfig.workDays.includes(dayName)) {
            SHOP_WORK_DAYS[dayName] = true;
        }
    }
    // Qual é o primeiro dia da semana a ser exibido no calendario
    let shop_firstWeekDay = 0;
    Object.keys(SHOP_WORK_DAYS).forEach((key, index) => {
        if (key == shopConfig.firstWeekDay) {
            shop_firstWeekDay = index;
        }
    });
    /* ----------------------- Atualizar valores na tabela ---------------------- */
    // Alterar o valor da caixa para o valor obtido do banco de dados
    if (OPENS_AT)
        OPENS_AT.value = shop_opensAt;
    if (CLOSES_AT)
        CLOSES_AT.value = shop_closesAt;
    // radio de primeiro dia da semana
    if (RADIO_FIRST_WORKDAY)
        RADIO_FIRST_WORKDAY[shop_firstWeekDay].checked = true;
    // checkbox de dias de trabalho
    Object.values(SHOP_WORK_DAYS).forEach((workDay, index) => {
        if (WORKDAY_CHECKBOXES)
            WORKDAY_CHECKBOXES[index].checked = workDay;
    });
}
/* -------------------------------------------------------------------------- */
/*                   Salvar alterações para a base de dados                   */
/* -------------------------------------------------------------------------- */
const CONFIGURATION_FORM = document.getElementById("configuration-form");
CONFIGURATION_FORM.addEventListener("submit", async (event) => {
    event.preventDefault();
    let formData = new URLSearchParams(new FormData(CONFIGURATION_FORM)).toString();
    await MakeRequest('/ajax/shop/config/', 'post', formData, true);
});
