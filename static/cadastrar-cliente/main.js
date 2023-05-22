/* Tela Principal */
import { MakeRequest } from "/static/geral/js/request.js" ;
import { DisplayModal } from "/static/cadastrar-cliente/scheduler-windows.js";

// * configurações da barbearia
export let shop_id = Cookies.get("shopId");
export let shop_barberList;
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
await CreateBarberList();

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
async function CreateBarberList() {
    let param = '?shopId=' + shop_id
    let barberList = await MakeRequest('/ajax/users' + param, 'get')
    
    // Mostrar na página que os barbeiros não foram encontrados
    if (barberList == null) {
        document.querySelector(".title-agendamento").text("Não foi possível carregar lista de barbeiros :(")
        return
    }
    
    // criar cada barbeiro na página
    barberList.forEach(barber => { 
        NewBarberElement(barber.name, barber.id);
    });
    
    // obter todos os barbeiros da página
    shop_barberList = document.querySelectorAll(".barber");
}

function NewBarberElement(barberName = '', id) {
    let BARBER = document.createElement('div');
    BARBER.classList.add('barber');
    BARBER.setAttribute('id', id);

    const BARBER_IMG = document.createElement('img');
    BARBER_IMG.setAttribute('src', '/static/geral/profilePictures/worker' + id + '.jpg');
    BARBER_IMG.setAttribute('alt', 'Barbeiro');
    BARBER_IMG.classList.add('worker-img');
    BARBER.append(BARBER_IMG);
    
    const BARBER_NAME = document.createElement('h3')
    BARBER_NAME.classList.add('worker-name')
    BARBER_NAME.innerText = barberName.toUpperCase()
    BARBER.append(BARBER_NAME)

    // evento de quando for clicado no barbeiro
    BARBER.addEventListener("click", () => {
        // selecionar barbeiro e abrir modal de agendamento
        selectedBarber = id;
        DisplayModal();
        
        // Desativar estilos dos outros barbeiros selecionados e ativar estilo do barbeiro selecionado
        shop_barberList.forEach(barber => {
            barber.classList.remove("selected-worker")
            barber.querySelector(".worker-name").classList.remove("text-glow")
        });

        BARBER.classList.add("selected-worker");
        BARBER_NAME.classList.add("text-glow");
    })
    
    // anexar ao container de lista de barbeiros
    document.getElementById("barber-list-container").append(BARBER);
}