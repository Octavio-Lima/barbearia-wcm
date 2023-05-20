/* Passos atuais durante o processo de restaurar o acesso*/
const PASSOS = {'email': document.querySelector("#step-1"), 
    'codigo': document.querySelector("#step-2"),
    'senha': document.querySelector("#step-3")};

// Ir para o passo de informar o código recebido no email
PASSOS['email'].addEventListener('click', (event) => {
    event.preventDefault();
    
    PASSOS['email'].classList.add('d-none'); // esconder
    PASSOS['codigo'].classList.remove('d-none'); // mostrar
})

// Passo que vai verificar se o código é válido
PASSOS['codigo'].addEventListener('click', (event) => {
    event.preventDefault();
    
    // TODO: Verificar se o código é valido para redefinir a senha
    PASSOS['codigo'].classList.add('d-none'); // esconder
    PASSOS['senha'].classList.remove('d-none'); // mostrar
})

// Passo que vai redefinir a senha
PASSOS['codigo'].addEventListener('click', (event) => {
    event.preventDefault();
    
    // TODO: programação para redefinir senha aqui!
})