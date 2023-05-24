// Se um int for menor que 10, deverá retornar ex: 05
export function PadNumber(number = 0) {
    if (number < 0) {
        return (number > -10 ? '0' : '') + number*-1;
    } else {
        return (number < 10 ? '0' : '') + number;
    }
}

export function ToCurrency(value = 0) {
    let moneyFormat = `R$ ${value.toFixed(2)}`;
    moneyFormat = moneyFormat.replace('.', ',');
    return moneyFormat;
}

export function ToMinutes(time) {
    let splitTime = time.split(':');
    let minutes = 0;

    minutes += parseInt(splitTime[0] * 60);
    minutes += parseInt(splitTime[1]);

    return minutes;
}

export class Time {
    sum() {
        let totalMinutes = 0;
        
        // obter argumentos
        for (let i = 0; i < arguments.length; i++) {
            let time = arguments[i].toString().split(':');

            if (time == null || time == "") {
                totalMinutes += 0;
            } else if (time.length == 1) {
                totalMinutes += parseInt(time[0]);
            } else {   
                totalMinutes += parseInt(time[0] * 60);
                totalMinutes += parseInt(time[1]);
            }
        }
    
        // Nova hora
        let hour = PadNumber(Math.floor(totalMinutes / 60));
        let minutes = PadNumber(totalMinutes % 60);

        return `${hour}:${minutes}`;
    }

    subtract() {
        let totalMinutes = 0;
        
        // obter argumentos
        for (let i = 0; i < arguments.length; i++) {
            let time = arguments[i].toString().split(':');
            
            if (i == 0) { // para o primeiro valor, tem que ter o valor original como base
                if (time == null || time == "") {
                    totalMinutes += 0;
                } else if (time.length == 1) {
                    totalMinutes += parseInt(time[0]);
                } else {
                    totalMinutes += parseInt(time[0] * 60);
                    totalMinutes += parseInt(time[1]);
                }
            } else {
                if (time == null || time == "") {
                    totalMinutes -= 0;
                } else if (time.length == 1) {
                    totalMinutes -= parseInt(time[0]);
                } else {
                    totalMinutes -= parseInt(time[0] * 60);
                    totalMinutes -= parseInt(time[1]);
                }
            }
        }
    
        // Nova hora
        let hour = PadNumber(Math.floor(totalMinutes / 60));
        let minutes = PadNumber(totalMinutes % 60);

        return `${hour}:${minutes}`;
    }
}