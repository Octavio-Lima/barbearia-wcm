const EL_WORKER_NAME = document.getElementById('worker-name');
const EL_WORKER_JOB = document.getElementById('worker-job');

let access = Cookies.get("accessType").toUpperCase();

// EL_WORKER_NAME.innerHTML = localStorage.getItem("accessName");
// EL_WORKER_JOB.innerHTML = localStorage.getItem("accessType");

if (/*!access.includes("PROPRIETARIO") || */!access.includes("GERENCIADOR") ) {
  const EL_PROD_STOCK = document.getElementById('product-stock');
  const EL_CLIENT_DATA = document.getElementById('client-data');
  
  EL_PROD_STOCK.remove();
  EL_CLIENT_DATA.remove();
}

if (!access.includes("BARBEIRO")) {
  const EL_REG_CLIENT = document.getElementById('register-client');
  const EL_SCHEDULE = document.getElementById('schedules');
  const EL_CASH_FLOW = document.getElementById('cash-flow');
  
  EL_CASH_FLOW.remove();
  EL_REG_CLIENT.remove();
  EL_SCHEDULE.remove();
}

document.querySelector('#user-img').setAttribute('src', '../resources/images/worker/worker' + localStorage.getItem("loggedId") + '.jpg');
console.log(access);