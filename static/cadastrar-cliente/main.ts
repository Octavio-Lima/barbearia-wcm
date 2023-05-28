/* Tela Principal */
import { MakeRequest } from "../geral/js/request";
import { DisplayModal } from "./scheduler-windows";
declare function Cookies(greeting: string): void;

// * configurações da barbearia
export let shop_id = Cookies.get("shopId");
export let shop_barberList = document.querySelectorAll(".barber");;
export let shop_opensAt : number;
export let shop_closesAt : number;
export let shop_firstWeekDayNumber : number;
export let shop_firstWeekDay = 'sun';
export let shop_workDays = {'sun': true, 'mon': true, 'tue': true, 
    'wed': true, 'thu': true, 'fri': true, 'sat': true}

// Barbeiros
export let selectedBarber : number;

// Inicializar
await LoadShopConfig()

/* ------------------------------ Configurações ----------------------------- */
async function LoadShopConfig() {
    // Obter configurações da barbearia
    let params = '?shopId=' + shop_id
    let shopConfig = await MakeRequest('/ajax/shop/config' + params, 'get')

    // Apropriadamente formatar o horario que a barbearia abre e fecha
    let parseOpenAt = shopConfig.opensAt.split(":");
    shop_opensAt = parseInt(parseOpenAt[0]);
    
    let parseClosesAt = shopConfig.closesAt.split(":");
    shop_closesAt = parseInt(parseClosesAt[0]);

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
        selectedBarber = parseInt(barber.id);
        DisplayModal();
        
        // Desativar estilos dos outros barbeiros selecionados e ativar estilo do barbeiro selecionado
        shop_barberList.forEach(otherBarbers => {
            otherBarbers.classList.remove("selected-worker")
            otherBarbers.querySelector(".worker-name")?.classList.remove("text-glow")
        });

        barber.classList.add("selected-worker");
        barber.querySelector(".worker-name")?.classList.add("text-glow");
    });
});