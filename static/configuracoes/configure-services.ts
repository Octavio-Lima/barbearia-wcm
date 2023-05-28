import { MakeRequest } from "../geral/js/request"

const SERVICE_TABLE = document.getElementById("service-table")
let barberList = document.querySelector("#barber-select")?.querySelectorAll("option")
let BARBER_LIST = document.querySelector("#barber-select") as HTMLSelectElement

/* Modal Adicionar novo Serviço */
let CONFIRM_BUTTON = document.getElementById("btn_confirm-new-entry")
let NEW_ENTRY_NAME = document.getElementById("inp_new-entry-name") as HTMLInputElement;
let NEW_ENTRY_VALUE = document.getElementById("inp_new-entry-value") as HTMLInputElement;
let NEW_ENTRY_DURATION = document.getElementById("inp_new-entry-length") as HTMLInputElement;

const SHOW_MODAL = document.getElementById("btn_new-entry-modal")
const HIDE_MODAL = document.getElementById("btn_cancel-entry")
const CONFIRM_NEW_ENTRY = document.getElementById("btn_confirm-new-entry")
const MODAL_NEW_ENTRY = document.getElementById("new-entry-modal")

let serviceLengthName = ["0 minutos", "15 minutos","30 minutos","45 minutos","1 hora",
    "1 hora e 15 minutos","1 hora e 30 minutos","1 hora e 45 minutos","2 horas"]

let shop_id = Cookies.get("shopId")

/* -------------------------------------------------------------------------- */
/*                                 Inicializar                                */
/* -------------------------------------------------------------------------- */
function CreateTableEntry(name: string, value: string, length: string) {
    // Serviço
    let entry = document.createElement("tr")

    // Nome
    let table_name = document.createElement("td")
    let input_name = document.createElement("input")
    input_name.classList.add('service_name');
    input_name.value = name
    table_name.append(input_name)
    entry.append(table_name)

    // Valor
    let table_value = document.createElement("td")
    let input_value = document.createElement("input")
    input_value.classList.add('service_value');
    input_value.value = value
    table_value.append(input_value)
    entry.append(table_value)

    // Tempo de Duração
    let table_duration = document.createElement("td")
    let input_duration = document.createElement("input")
    input_duration.classList.add('service_duration');
    input_duration.type = 'time';
    input_duration.value = length;
    
    table_duration.append(input_duration)
    entry.append(table_duration)

    // Botão de Excluir
    let table_delete = document.createElement("td")
    let button_delete = document.createElement("button")
    button_delete.innerText = "X"
    button_delete.addEventListener("click", function() { entry.remove() })
    table_delete.append(button_delete)
    entry.append(table_delete)

    if (SERVICE_TABLE) SERVICE_TABLE.appendChild(entry)
}

// Carregar informações do barbeiro
if (barberList) barberList.forEach(barber => {
    barber.addEventListener("click", async () => {
        // Obter lista de Serviços do Banco de Dados
        let params = `?shopId=${shop_id}&barberId=${barber.id}`;
        let request = await MakeRequest(`/ajax/users/barber/config${params}`, 'get')
        let serviceList = JSON.parse(request.services);
        
        // Limpar a Tabela
        if (SERVICE_TABLE) SERVICE_TABLE.innerHTML = '';
        
        // Criar lista de serviços na tabela
        console.log(request);
        serviceList.forEach((service: any) => {
            CreateTableEntry(service.name, service.value, service.duration)
        });
    })
});

if (CONFIRM_BUTTON) CONFIRM_BUTTON.addEventListener("click", () => { CreateTableEntry(NEW_ENTRY_NAME.value, NEW_ENTRY_VALUE.value, NEW_ENTRY_DURATION.value) })
if (SHOW_MODAL) SHOW_MODAL.addEventListener("click", () => { if (MODAL_NEW_ENTRY) MODAL_NEW_ENTRY.classList.toggle("d-none"); })
if (HIDE_MODAL) HIDE_MODAL.addEventListener("click", () => { if (MODAL_NEW_ENTRY) MODAL_NEW_ENTRY.classList.toggle("d-none"); })
if (CONFIRM_NEW_ENTRY) CONFIRM_NEW_ENTRY.addEventListener("click", () => { if (MODAL_NEW_ENTRY) MODAL_NEW_ENTRY.classList.toggle("d-none"); })

// Salvar alterações para a base de dados
let SAVE_CHANGES = document.getElementById("btn_save-to-database")
if (SAVE_CHANGES) SAVE_CHANGES.addEventListener("click", function() {
    // Retornar se nenhum barbeiro foi selecionado
    if (BARBER_LIST?.value == "Selecione") {
        alert('Deve ser selecionado um barbeiro')
        return;
    }

    // Criar lista de serviços a serem salvos
    let newServiceList: Array<any> | undefined;
    if (SERVICE_TABLE) SERVICE_TABLE.childNodes.forEach(serviceEntry => {
        let name = serviceEntry.querySelector('.service_name').value;
        let value = serviceEntry.querySelector('.service_value').value;
        let duration = serviceEntry.querySelector('.service_duration').value;

        let entry = {'name': name, 'value': value, 'duration': duration};
        if (newServiceList) newServiceList.push(entry)
    });

    // Atualizar no banco de dados
    let jsonRequest = JSON.stringify({
        shopId: parseInt(shop_id),
        barberId: parseInt(BARBER_LIST?.value),
        services: JSON.stringify(newServiceList ? newServiceList : '')
    })

    MakeRequest('/ajax/users/barber/config', 'put', jsonRequest);
})