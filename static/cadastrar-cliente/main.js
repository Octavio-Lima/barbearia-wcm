/* Tela Principal */
import { MakeRequest } from "/static/geral/js/request.js" ;
import { DisplayModal } from "/static/cadastrar-cliente/scheduler-windows.js";

// * configurações da barbearia
export let shop_id = Cookies.get("shopId");
export let shop_barberList = document.querySelectorAll(".barber");;
export let shop_opensAt = 0;
export let shop_closesAt = 0;
export let shop_firstWeekDayNumber;
export let shop_firstWeekDay = 'sun';
export let shop_workDays = {'sun': true, 'mon': true, 'tue': true, 
    'wed': true, 'thu': true, 'fri': true, 'sat': true}

// Barbeiros
export let selectedBarber = 0;

// Inicializar
await LoadShopConfig()

/* ------------------------------ Configurações ----------------------------- */
async function LoadShopConfig() {
    // Obter configurações da barbearia
    let params = '?shopId=' + shop_id
    let shopConfig = await MakeRequest('/ajax/shop/config' + params, 'get')

    // Apropriadamente formatar o horario que a barbearia abre e fecha
    shop_opensAt = shopConfig.opensAt.split(":");
    shop_opensAt = parseInt(shop_opensAt[0]);
    
    shop_closesAt = shopConfig.closesAt.split(":");
    shop_closesAt = parseInt(shop_closesAt[0]);

    // Obter quais dias a barbearia abre ou não
    for (const [key] of Object.entries(shop_workDays)) {
        if (!shopConfig.workDays.includes(key)) {
            shop_workDays[key] = false;
        }
    }

    // Qual é o primeiro dia da semana a ser exibido no calendario
    shop_firstWeekDay = shopConfig.firstWeekDay;

    let index = 0;
    for (const [key] of Object.entries(shop_workDays)) {
        if (shop_firstWeekDay == key) {
            shop_firstWeekDayNumber = index;
        }
        index++;
    };
}

/* --------------------------- Lista de Barbeiros --------------------------- */
shop_barberList.forEach(barber => {
    // evento de quando for clicado no barbeiro
    barber.addEventListener("click", () => {
        // selecionar barbeiro e abrir modal de agendamento
        selectedBarber = barber.id;
        DisplayModal();
        
        // Desativar estilos dos outros barbeiros selecionados e ativar estilo do barbeiro selecionado
        shop_barberList.forEach(otherBarbers => {
            otherBarbers.classList.remove("selected-worker")
            otherBarbers.querySelector(".worker-name").classList.remove("text-glow")
        });

        barber.classList.add("selected-worker");
        barber.querySelector(".worker-name").classList.add("text-glow");
    });
});