export default class BankAccount {
    acName = ''
    acNo = ''
    ifsc = ''
    bank = ''
    branch = ''

    constructor(b?: BankAccount) {
        this.acName = b?.acName || ''
        this.acNo = b?.acNo || ''
        this.ifsc = b?.ifsc || ''
        this.bank = b?.bank || ''
        this.branch = b?.branch || ''
    }

    json() {
        const { acName, acNo, ifsc, bank, branch } = this
        return ({ acName, acNo, ifsc, bank, branch })
    }
}