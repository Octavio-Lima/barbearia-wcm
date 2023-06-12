import { GetCookie, MakeRequest, NumberToCurrency } from "../../../geral/js/utility.js";
const SHOP_ID = GetCookie("shopId");
const SERVICE_TABLE = document.getElementById("service-table");
const SELECT_BARBER = document.querySelector("#barber-select");
let serviceList = [];
// Adicionar evento a todos os barbeiros do Select
let availableBarbers = SELECT_BARBER?.querySelectorAll("option");
availableBarbers?.forEach(barber => {
    barber.addEventListener("click", async () => LoadBarberServices(barber.id));
});
// Carregar serviços do Barbeiro
async function LoadBarberServices(barberId) {
    // Obter lista de Serviços do Banco de Dados
    let params = `?shopId=${SHOP_ID}&barberId=${barberId}`;
    let request = await MakeRequest(`/ajax/users/barber/config${params}`, 'get');
    // Limpar a Tabela
    if (SERVICE_TABLE)
        SERVICE_TABLE.innerHTML = '';
    // Criar lista de serviços na tabela
    let DataBaseServiceList = JSON.parse(request.services);
    DataBaseServiceList.forEach((service) => {
        let newService = new Service(service.service, service.value, service.duration);
        SERVICE_TABLE?.append(newService.element);
    });
}
/* -------------------------------------------------------------------------- */
/*                               Salvar Serviços                              */
/* -------------------------------------------------------------------------- */
async function Upload() {
    // Criar lista de serviços a serem salvos
    let newServiceList;
    let tableEntries = SERVICE_TABLE?.querySelectorAll('.service-entry');
    tableEntries?.forEach(entry => {
        const name = entry?.querySelector('.service_name')?.value;
        const value = entry?.querySelector('.service_value')?.value;
        const duration = entry?.querySelector('.service_duration')?.value;
        const newEntry = { 'name': name, 'value': value, 'duration': duration };
        if (newServiceList)
            newServiceList.push(newEntry);
    });
    // Atualizar no banco de dados
    let jsonRequest = JSON.stringify({
        shopId: parseInt(SHOP_ID),
        barberId: parseInt(SELECT_BARBER ? SELECT_BARBER.value : ''),
        services: JSON.stringify(newServiceList ? newServiceList : '')
    });
    MakeRequest('/ajax/users/barber/config', 'put', jsonRequest);
}
// Salvar alterações para a base de dados
let SAVE_CHANGES = document.getElementById("btn_save-to-database");
SAVE_CHANGES?.addEventListener("click", function () {
    Upload();
});
/* -------------------------------------------------------------------------- */
/*                                 Inicializar                                */
/* -------------------------------------------------------------------------- */
class Service {
    service = "";
    value = 0;
    duration = "00:00";
    element;
    input = {
        service: null,
        value: null,
        duration: null
    };
    constructor(service, value, duration) {
        this.service = service;
        this.value = value;
        this.duration = duration;
        this.NewElement();
        serviceList.push(this);
    }
    NewElement() {
        // Serviço
        let entry = document.createElement("tr");
        entry.classList.add('service-entry');
        // Nome
        let table_name = document.createElement("td");
        let input_name = document.createElement("input");
        this.input.service = input_name;
        input_name.classList.add('service_name');
        input_name.value = this.service;
        table_name.append(input_name);
        entry.append(table_name);
        // Valor
        let table_value = document.createElement("td");
        let input_value = document.createElement("input");
        this.input.value = input_value;
        input_value.classList.add('service_value');
        input_value.value = NumberToCurrency(this.value);
        table_value.append(input_value);
        entry.append(table_value);
        // Tempo de Duração
        let table_duration = document.createElement("td");
        let input_duration = document.createElement("input");
        this.input.duration = input_duration;
        input_duration.classList.add('service_duration');
        input_duration.type = 'time';
        input_duration.value = this.duration;
        table_duration.append(input_duration);
        entry.append(table_duration);
        // Botão de Excluir
        let table_delete = document.createElement("td");
        let button_delete = document.createElement("button");
        button_delete.innerText = "X";
        button_delete.addEventListener("click", () => entry.remove());
        table_delete.append(button_delete);
        entry.append(table_delete);
        this.element = entry;
    }
}
/* #region  Modal */
// Exibir / Esconder
const SHOW_MODAL = document.getElementById("btn_new-entry-modal");
const HIDE_MODAL = document.getElementById("btn_cancel-entry");
const MODAL_NEW_ENTRY = document.getElementById("new-entry-modal");
SHOW_MODAL?.addEventListener("click", () => { MODAL_NEW_ENTRY?.classList.toggle("d-none"); });
HIDE_MODAL?.addEventListener("click", () => { MODAL_NEW_ENTRY?.classList.toggle("d-none"); });
// Adicionar novo serviço
const NEW_ENTRY_FORM = document.getElementById("new-entry-form");
const NEW_ENTRY_NAME = document.getElementById("inp_new-entry-name");
const NEW_ENTRY_VALUE = document.getElementById("inp_new-entry-value");
const NEW_ENTRY_DURATION = document.getElementById("inp_new-entry-length");
NEW_ENTRY_FORM?.addEventListener("submit", (event) => {
    event.preventDefault();
    MODAL_NEW_ENTRY?.classList.toggle("d-none");
    if (NEW_ENTRY_NAME && NEW_ENTRY_VALUE && NEW_ENTRY_DURATION) {
        let newService = new Service(NEW_ENTRY_NAME.value, parseFloat(NEW_ENTRY_VALUE.value), NEW_ENTRY_DURATION.value);
        SERVICE_TABLE?.append(newService.element);
    }
});
/* #endregion */ 
