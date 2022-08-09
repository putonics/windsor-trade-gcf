import User from "./User"

export default class PackageRequest {
    appname: string
    subscriberdocid: string
    docid: string //WC{name[0:1]}000001
    todocid: string
    amount: number
    ///////////////////
    name: string
    countrycode: string
    mobile: string
    email: string
    ////////////////////
    toname: string
    tocountrycode: string
    tomobile: string
    toemail: string
    ////////////////////
    requestedon: number
    servedon: number

    constructor(pr?: PackageRequest) {
        this.appname = pr && pr.appname ? pr.appname : ''
        this.subscriberdocid = pr && pr.subscriberdocid ? pr.subscriberdocid : ''
        this.docid = pr && pr.docid ? pr.docid.toUpperCase() : ''
        this.todocid = pr && pr.todocid ? pr.todocid.toUpperCase() : ''
        this.amount = pr && pr.amount ? pr.amount : 0
        ////////////////////////////////////////////////////
        this.name = pr && pr.name ? pr.name.toUpperCase() : ''
        this.countrycode = pr && pr.countrycode ? pr.countrycode : ''
        this.mobile = pr && pr.mobile ? pr.mobile : ''
        this.email = pr && pr.email ? pr.email : ''
        ////////////////////////////////////////////////////
        this.toname = pr && pr.toname ? pr.toname.toUpperCase() : ''
        this.tocountrycode = pr && pr.tocountrycode ? pr.tocountrycode : ''
        this.tomobile = pr && pr.tomobile ? pr.tomobile : ''
        this.toemail = pr && pr.toemail ? pr.toemail : ''
        ////////////////////////////////////////////////////
        this.requestedon = pr && pr.requestedon ? pr.requestedon : 0
        this.servedon = pr && pr.servedon ? pr.servedon : 0
    }

    set(pr?: PackageRequest) {
        this.appname = pr && pr.appname ? pr.appname : this.appname
        this.subscriberdocid = pr && pr.subscriberdocid ? pr.subscriberdocid : this.subscriberdocid
        this.docid = pr && pr.docid ? pr.docid.toUpperCase() : this.docid
        this.todocid = pr && pr.todocid ? pr.todocid.toUpperCase() : this.todocid
        this.amount = pr && pr.amount ? pr.amount : this.amount
        ////////////////////////////////////////////////////
        this.name = pr && pr.name ? pr.name.toUpperCase() : this.name
        this.countrycode = pr && pr.countrycode ? pr.countrycode : this.countrycode
        this.mobile = pr && pr.mobile ? pr.mobile : this.mobile
        this.email = pr && pr.email ? pr.email : this.email
        ////////////////////////////////////////////////////
        this.toname = pr && pr.toname ? pr.toname.toUpperCase() : this.toname
        this.tocountrycode = pr && pr.tocountrycode ? pr.tocountrycode : this.tocountrycode
        this.tomobile = pr && pr.tomobile ? pr.tomobile : this.tomobile
        this.toemail = pr && pr.toemail ? pr.toemail : this.toemail
        ////////////////////////////////////////////////////
        this.requestedon = pr && pr.requestedon ? pr.requestedon : this.requestedon
        this.servedon = pr && pr.servedon ? pr.servedon : this.servedon
    }

    setSender(user: User) {
        this.name = user.name ? user.name.toUpperCase() : this.name
        this.countrycode = user.countrycode ? user.countrycode : this.countrycode
        this.mobile = user.mobile ? user.mobile : this.mobile
        this.email = user.email ? user.email : this.email
        this.requestedon = new Date().getTime()
    }

    setReceiver(user: User) {
        this.toname = user.name ? user.name.toUpperCase() : this.toname
        this.tocountrycode = user.countrycode ? user.countrycode : this.tocountrycode
        this.tomobile = user.mobile ? user.mobile : this.tomobile
        this.toemail = user.email ? user.email : this.toemail
    }

    json() {
        const {
            appname, subscriberdocid, docid, todocid, amount,
            name, countrycode, mobile, email,
            toname, tocountrycode, tomobile, toemail,
            requestedon, servedon,
        } = this
        return ({
            appname, subscriberdocid, docid, todocid, amount,
            name, countrycode, mobile, email,
            toname, tocountrycode, tomobile, toemail,
            requestedon, servedon,
        })
    }
}