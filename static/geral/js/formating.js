// Se um int for menor que 10, deverá retornar ex: 05
export function PadNumber(number = 0) {
    return (number < 10 ? '0' : '') + number;
}

export function ToCurrency(value = 0) {
    let moneyFormat = `R$ ${value.toFixed(2)}`;
    moneyFormat = moneyFormat.replace('.', ',');
    return moneyFormat;
}

export function ToTime(value, timeSeparator = "H ") {
    let time = ((value * 15) / 60).toString();
    let splitValue = time.split('.');
    let minutes = 0;
    let hour = parseInt(splitValue[0]);

    hour = (hour <= 9 ? PadNumber(hour) : hour);
    minutes = 60 * (parseFloat("0." + splitValue[1]));
    
    if (splitValue.length > 1) {
        // let convertExtraMinuteToHour = ("" + (parseFloat(minutes) / 60));
        // let splitMinuteFromHour = convertExtraMinuteToHour.split('.');
        // splitValue[0] = (parseFloat(splitValue[0]) + parseFloat(splitMinuteFromHour[0]));
        // minutes = splitMinuteFromHour[1]
        // console.log(splitMinuteFromHour[1]);
    } else {
        minutes = "00"
    }

    return `${hour}${timeSeparator}${minutes}`;
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
            let time = arguments[i].split(':');
    
            totalMinutes += parseInt(time[0] * 60);
            totalMinutes += parseInt(time[1]);
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
            let time = arguments[i].split(':');
    
            totalMinutes -= parseInt(time[0] * 60);
            totalMinutes -= parseInt(time[1]);
        }
    
        // Nova hora
        let hour = PadNumber(Math.floor(totalMinutes / 60));
        let minutes = PadNumber(totalMinutes % 60);

        return `${hour}:${minutes}`;
    }
}