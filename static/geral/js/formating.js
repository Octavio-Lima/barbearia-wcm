// Se um int for menor que 10, deverá retornar ex: 05
export function PadNumber(number = 0) {
    if (number < 0) {
        return (number > -10 ? '0' : '') + number * -1;
    }
    else {
        return (number < 10 ? '0' : '') + number;
    }
}
export function ToCurrency(value = 0) {
    let moneyFormat = `R$ ${value.toFixed(2)}`;
    moneyFormat = moneyFormat.replace('.', ',');
    return moneyFormat;
}
export function ToMinutes(time = '00:00') {
    let splitTime = time.split(':');
    let minutes = 0;
    minutes += parseFloat(splitTime[0]) * 60;
    minutes += parseInt(splitTime[1]);
    return minutes;
}
export function ToBrazilDate(date) {
    if (typeof date === 'string') {
        const SPLIT_DATE = date.split('-');
        return `${PadNumber(parseInt(SPLIT_DATE[2]))}/${PadNumber(parseInt(SPLIT_DATE[1]))}/${parseInt(SPLIT_DATE[0])}`;
    }
    else {
        return `${PadNumber(date.getDate())}/${PadNumber(date.getMonth())}/${date.getFullYear()}`;
    }
}
export function BrazilToDefaultDate(date) {
    const DATE = new Date();
    const SPLIT_DATE = date.split('/');
    DATE.setFullYear(parseInt(SPLIT_DATE[2]));
    DATE.setMonth(parseInt(SPLIT_DATE[1]) - 1);
    DATE.setDate(parseInt(SPLIT_DATE[0]));
    return DATE;
}
// TODO: No momento, o horario em que a barbearia abre só leva em conta as horas, deve ser atualizado para que use os minutos também
export function TimeToScheduleIndex(time, shop_OpensAt) {
    const SCHEDULE_PER_HOUR = 4;
    const HOUR = time.getHours();
    const MINUTE = time.getMinutes();
    // Se for definido o horario que a barbearia abre, subtrair o horario de quando abre
    const INDEX = ((HOUR + (MINUTE / 60)) - (shop_OpensAt != undefined ? shop_OpensAt : 0)) * SCHEDULE_PER_HOUR;
    return INDEX;
}
// Converter um index para tempo
export function IndexToTime(index, shop_OpensAt) {
    const SINGLE_SCHEDULE_DURATION = 15; // in minutes
    const TOTAL_MINUTES = index * SINGLE_SCHEDULE_DURATION;
    const HOURS = Math.floor(TOTAL_MINUTES / 60);
    const MINUTES = (TOTAL_MINUTES % 60);
    // Converter para objeto Date
    const DATE = new Date();
    DATE.setHours(HOURS, MINUTES, 0);
    return DATE;
}
export class Time {
    sum(...args) {
        let totalMinutes = 0;
        // obter argumentos
        for (let i = 0; i < args.length; i++) {
            let time = args[i].toString().split(':');
            if (!time) {
                totalMinutes += 0;
            }
            else if (time.length == 1) {
                totalMinutes += parseInt(time[0]);
            }
            else {
                totalMinutes += parseInt(time[0]) * 60;
                totalMinutes += parseInt(time[1]);
            }
        }
        // Nova hora
        let hour = PadNumber(Math.floor(totalMinutes / 60));
        let minutes = PadNumber(totalMinutes % 60);
        return `${hour}:${minutes}`;
    }
    subtract(...args) {
        let totalMinutes = 0;
        // obter argumentos
        for (let i = 0; i < args.length; i++) {
            let time = args[i].toString().split(':');
            if (i == 0) { // para o primeiro valor, tem que ter o valor original como base
                if (!time) {
                    totalMinutes += 0;
                }
                else if (time.length == 1) {
                    totalMinutes += parseInt(time[0]);
                }
                else {
                    totalMinutes += parseInt(time[0]) * 60;
                    totalMinutes += parseInt(time[1]);
                }
            }
            else {
                if (!time) {
                    totalMinutes -= 0;
                }
                else if (time.length == 1) {
                    totalMinutes -= parseInt(time[0]);
                }
                else {
                    totalMinutes -= parseInt(time[0]) * 60;
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
