// Gerenciar requisições
type Methods = 'post' | 'put' | 'delete' | 'get';
export async function MakeRequest(url: string, method: Methods, body?: string, form = false): Promise<any> {
    let headers = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': ''
    }

    if (form) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    if (method == 'post' || method == 'put' || method == 'delete') {
        const csrf = (document.querySelector('[name=csrfmiddlewaretoken]') as HTMLInputElement)?.value;
        headers['X-CSRFToken'] = csrf;
    }

    const response: Response = await fetch(url, { method: method, headers: headers, body: body });
    let text = await response.text();
    
    // Conferir se possui json
    if (text) return JSON.parse(text);

    return response.status;
}

// Gerenciar cookies
export function GetCookie(desiredCookie: string) {
    let cookies = document.cookie;
    let selectedCookie = '';

    // Filtrar cookies
    let cookieList = new Array();
    cookies.split(';').forEach(cookie => {
        let splitCookie = cookie.split('=');
        
        cookieList.push({'name': splitCookie[0].trim(), 'value': splitCookie[1].trim()});
    });

    // retornar o valor desejado
    cookieList.forEach((cookie: any) => {
        if (cookie.name == desiredCookie) {
            selectedCookie = cookie['value'];
            return;
        }
    })

    return selectedCookie;
}

// Formatar vários formatos formatadores de formateiros formaticos
export function NumberToCurrency(value: number) {
    let result = 'R$ ' + (value.toFixed(2)).replace('.', ',');
    return result;
}

export function CurrencyToNumber(valueInCurrency: string) {
    // Remover simbolos
    let result: number
    let value = valueInCurrency.replace('R$ ', '').replace('R$', '');
    let negativeMultiplier: number; // se for 1 é positivo, se for -1 negativo, usado para saber se o numero é negativo

    // Encontrar o ponto/virgula decimal
    let decimalPosition = null;
    for (let letter = value.length - 1; letter >= 0; letter--) {
        if (value[letter] == ',' || value[letter] == '.') {
            decimalPosition = letter;
            break;
        }
    }

    // se não encontrou o ponto é porque já é um numero inteiro
    if (decimalPosition == null) {
        // Verificar se é um numero negativo, pois quando remover tudo que não for numero, o sinal será removido
        // Então tenho que preservar o sinal de negativo
        negativeMultiplier = ((value.slice(0, 1) == '-') ? -1 : 1);

        // remover o que não é numero e já converter para float
        let wholeNumber = parseFloat(value.replace(/\D/g, ''));

        result = wholeNumber * negativeMultiplier;
    } else {
        // Separar decimal do numero inteiro
        let wholeNumber = value.slice(0, decimalPosition);
        let decimalValue = value.slice(decimalPosition + 1, value.length);

        negativeMultiplier = ((wholeNumber.slice(0, 1) == '-') ? -1 : 1);

        // Remover tudo que não for numero das strings, arredondar o decimal e converter para int
        let parsedWholeNumber = parseInt(wholeNumber.replace(/\D/g, ''));
        let parsedDecimalValue = parseInt(decimalValue.replace(/\D/g, '').slice(0, 2));

        // Criar float
        result = parseFloat(`${parsedWholeNumber}.${parsedDecimalValue}`) * negativeMultiplier;
    }

    if (isNaN(result)) {
        return 0;
    }

    return result;
}

export function ToPhoneNumber(phoneNumber: string | number) {
    // Remover tudo que não for numero
    let result = phoneNumber.toString().replace(/\D/g, '');

    // De acordo com a quantidade de digitos, ir adicionando enfeites
    let numberLength = result.length;
    if (numberLength > 4 && numberLength <= 8) {
        return `${result.slice(0, 4)}-${result.slice(4, numberLength)}`
    }
    else if (numberLength == 9) {
        return `${result.slice(0, 5)}-${result.slice(5, numberLength)}`
    } else
    if (numberLength == 10) {
        return `(${result.slice(0, 2)}) ${result.slice(2, 6)}-${result.slice(6, numberLength)}`
    } else
    if (numberLength >= 11) {
        return `(${result.slice(0, 2)}) ${result.slice(2, 7)}-${result.slice(7, numberLength)}`
    }

    return result
}