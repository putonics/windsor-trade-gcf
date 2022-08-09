export const APPNAME = 'windsortrade'
export const SUBSCRIBERDOCID = 'WINDSOR-TRADE-MLM'
export const ADMINDOCID = 'WCWC000001'
export const SUPERADMINDOCID = 'WCSA000001'
export default class Admin {
    appname: string = APPNAME
    subscriberdocid: string = SUBSCRIBERDOCID
    createdon: number = 1652837639407
    modifiedon: number
    ///////////////////////
    docid: string = ADMINDOCID
    active: boolean = true
    name: string = 'ADMIN'
    email: string = 'admin@windsortrad.com'

    constructor(a?: Admin) {
        this.modifiedon = a && a.modifiedon ? a.modifiedon : this.createdon
    }

    json() {
        const { appname, subscriberdocid, createdon, modifiedon, docid, active, name, email } = this
        return ({ appname, subscriberdocid, createdon, modifiedon, docid, active, name, email })
    }
}