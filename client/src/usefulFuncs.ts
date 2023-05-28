//Сюда выненсены используемые в нескольких местах функции

function isArrayEmpty(arr: Array<any> | NodeListOf<Element>): boolean {
    // eslint-disable-next-line
    for (let e of arr) {
        return false
    }
    return true
}
function getRandomKey(): string {
    const key = (Math.round(Date.now() * Math.random())).toString()

    return key
}

export {isArrayEmpty, getRandomKey}