import PackageRequest from "./PackageRequest"
import User from "./User"

/**
 * Withdrawal
 * Case-1: Withdrawal to bank acoount
 * User send the request status is pending until served by the Super Admin
 * User can see pending request and served request in his login
 * Super admin can see only the pending requests and he will serve the request manualy
 * 
 * Case-2: Withdrawal to purchase PKG for himself or for other users
 * User send the request and the request will be served if the balace is available in his wallet
 */
export default class Withdrawal {
    appname: string
    subscriberdocid: string
    docid: string //user-docid
    name: string
    countrycode: string
    mobile: string
    email: string
    walletBalance: number //walletBalance at the time of request //updated at the time of served
    amount: number
    requestedon: number
    servedon: number
    description: string

    constructor(w?: Withdrawal) {
        this.appname = w && w.appname ? w.appname : ''
        this.subscriberdocid = w && w.subscriberdocid ? w.subscriberdocid : ''
        this.docid = w && w.docid ? w.docid : ''
        this.name = w && w.name ? w.name : ''
        this.countrycode = w && w.countrycode ? w.countrycode : ''
        this.mobile = w && w.mobile ? w.mobile : ''
        this.email = w && w.email ? w.email : ''
        this.walletBalance = w && w.walletBalance ? (+w.walletBalance) : 0
        this.amount = w && w.amount ? (+w.amount) : 0
        this.requestedon = w && w.requestedon ? (+w.requestedon) : new Date().getTime()
        this.servedon = w && w.servedon ? (+ w.servedon) : 0
        this.description = w && w.description ? w.description : 'Withdrawal'
    }

    set(w?: Withdrawal) {
        this.appname = w && w.appname ? w.appname : this.appname
        this.subscriberdocid = w && w.subscriberdocid ? w.subscriberdocid : this.subscriberdocid
        this.docid = w && w.docid ? w.docid : this.docid
        this.name = w && w.name ? w.name : this.name
        this.countrycode = w && w.countrycode ? w.countrycode : this.countrycode
        this.mobile = w && w.mobile ? w.mobile : this.mobile
        this.email = w && w.email ? w.email : this.email
        this.walletBalance = w && w.walletBalance ? (+w.walletBalance) : this.walletBalance
        this.amount = w && w.amount ? (+w.amount) : this.amount
        this.requestedon = w && w.requestedon ? (+w.requestedon) : this.requestedon
        this.servedon = w && w.servedon ? (+ w.servedon) : this.servedon
        this.description = w && w.description ? w.description : this.description
    }

    applyPackage(pr: PackageRequest, balance: number) {
        this.appname = pr.appname
        this.subscriberdocid = pr.subscriberdocid
        this.docid = pr.docid
        this.name = pr.name
        this.countrycode = pr.countrycode
        this.mobile = pr.mobile
        this.email = pr.email
        this.walletBalance = balance
        this.amount = pr.amount
        this.requestedon = new Date().getTime()
        this.servedon = this.requestedon
        this.description = `Purchased package of $${pr.amount} for ${pr.todocid}`
    }

    applyUser(user: User, balance: number) {
        this.appname = user.appname
        this.subscriberdocid = user.subscriberdocid
        this.docid = user.docid
        this.name = user.name
        this.countrycode = user.countrycode
        this.mobile = user.mobile
        this.email = user.email
        this.walletBalance = balance
        this.requestedon = new Date().getTime()
    }

    json() {
        const { appname, subscriberdocid, docid, name, countrycode, mobile, email, walletBalance, amount, requestedon, description, servedon } = this
        return ({ appname, subscriberdocid, docid, name, countrycode, mobile, email, walletBalance, amount, requestedon, description, servedon })
    }
}