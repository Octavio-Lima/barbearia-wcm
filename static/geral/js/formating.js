// Se um int for menor que 10, deverá retornar ex: 05
export function DoubleDigitsInt(number) 
{
    return (number < 10 ? '0' : '') + number;
}

export function numberToPrice(value)
{
    let moneyFormat = ("R$ " + value.toFixed(2));
    moneyFormat = moneyFormat.replace('.', ',');
    return moneyFormat;
}

export function addClassArray(element, className)
{
    element.forEach(_element =>
    {
        _element.classList.add(className);
    })
}

export function removeClassArray(element, className)
{
    element.forEach(_element =>
    {
        _element.classList.remove(className);
    })
}

export function valueToTime(value)
{
    let time = "" + ((value * 15) / 60);
    let splitValue = time.split('.');
    let minutes = 0;
    let hour = parseInt(splitValue[0]);

    hour = (hour <= 9 ? DoubleDigitsInt(hour) : hour);
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

    return hour + "H " + minutes;
    // Total result should be 01H 45
}