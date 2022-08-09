import { onlyDate } from './../util';
export default class Package {
    index: number
    amount: number
    date: number

    constructor(p?: Package) {
        this.index = p && p.index ? (+p.index) : 0
        this.amount = p && p.amount ? (+p.amount) : 15
        this.date = p && p.date ? onlyDate(p.date).getTime() : onlyDate().getTime()
    }

    json() {
        return ({ index: this.index, amount: this.amount, date: this.date })
    }
}