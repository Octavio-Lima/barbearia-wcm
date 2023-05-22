import { MakeRequest } from "/static/geral/js/request.js";

let serviceTable = document.getElementById("service-table")
let barberList = document.querySelector("#barber-select").querySelectorAll("option")
let sel_BarberList = document.querySelector("#barber-select")

/* Modal Adicionar novo Serviço */
let confirmButton = document.querySelector("#btn_confirm-new-entry")
let input_newEntryName = document.querySelector("#inp_new-entry-name")
let input_newEntryValue = document.querySelector("#inp_new-entry-value")
let input_newEntryLength = document.querySelector("#inp_new-entry-length")

let btn_showModal = document.querySelector("#btn_new-entry-modal")
let btn_hideModal = document.querySelector("#btn_cancel-entry")
let btn_confirmNewEntry = document.querySelector("#btn_confirm-new-entry")
let newEntryModal = document.querySelector("#new-entry-modal")

let serviceLengthName = ["0 minutos", "15 minutos","30 minutos","45 minutos","1 hora",
    "1 hora e 15 minutos","1 hora e 30 minutos","1 hora e 45 minutos","2 horas"]

let shop_id = Cookies.get("shopId")

/* -------------------------------------------------------------------------- */
/*                                 Inicializar                                */
/* -------------------------------------------------------------------------- */
function CreateTableEntry(name, value, length) {
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

    serviceTable.appendChild(entry)
}

// Carregar informações do barbeiro
barberList.forEach(barber => {
    barber.addEventListener("click", async () => {
        // Obter lista de Serviços do Banco de Dados
        let params = `?shopId=${shop_id}&barberId=${barber.id}`;
        let request = await MakeRequest(`/ajax/users/barber/config${params}`, 'get')
        let serviceList = JSON.parse(request.services);
        
        // Limpar a Tabela
        serviceTable.innerHTML = '';
        
        // Criar lista de serviços na tabela
        console.log(request);
        serviceList.forEach(service => {
            CreateTableEntry(service.name, service.value, service.duration)
        });
    })
});

confirmButton.addEventListener("click", () => { CreateTableEntry(input_newEntryName.value, input_newEntryValue.value, input_newEntryLength.value) })
btn_showModal.addEventListener("click", () => { newEntryModal.classList.toggle("d-none"); })
btn_hideModal.addEventListener("click", () => { newEntryModal.classList.toggle("d-none"); })
btn_confirmNewEntry.addEventListener("click", () => { newEntryModal.classList.toggle("d-none"); })

// Salvar alterações para a base de dados
let btn_SaveChanges = document.querySelector("#btn_save-to-database")

btn_SaveChanges.addEventListener("click", function() {
    // Retornar se nenhum barbeiro foi selecionado
    if (sel_BarberList.value == "Selecione") {
        alert('Deve ser selecionado um barbeiro')
        return;
    }

    // Criar lista de serviços a serem salvos
    let newServiceList = [];
    serviceTable.childNodes.forEach(serviceEntry => {
        let name = serviceEntry.querySelector('.service_name').value;
        let value = serviceEntry.querySelector('.service_value').value;
        let duration = serviceEntry.querySelector('.service_duration').value;

        let entry = {'name': name, 'value': value, 'duration': duration};
        newServiceList.push(entry)
    });

    // Atualizar no banco de dados
    let jsonRequest = JSON.stringify({
        shopId: parseInt(shop_id),
        barberId: parseInt(sel_BarberList.value),
        services: JSON.stringify(newServiceList)
    })

    MakeRequest('/ajax/users/barber/config', 'put', jsonRequest);
})