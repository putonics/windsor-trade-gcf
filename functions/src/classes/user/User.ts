import { ADMINDOCID } from './Admin';
import { COLLECTIONS } from './../Constants';
import { firestore } from "firebase-admin"
import Package from "./Package"
import Subordinate from "./Subordinate"
import Income from './Income';
import { onlyDate } from '../util';
import BankAccount from './BankAccount';

export default class User {
    appname: string
    subscriberdocid: string
    createdon: number
    modifiedon: number
    ///////////////////////
    refdocid: string
    docid: string //WC{name[0:1]}000001
    active: boolean
    name: string
    countrycode: string
    mobile: string//with country code
    email: string//validity checking with OTP
    password: string
    idproof: { name: string, number: string, issuingAuthority: string }
    /////////////////////////////////////////////////////////////////////
    bankAccount: BankAccount | null
    /////////////////////////////////////////////////////////////////////
    cryptoWalletAddress: string
    ////////////////////////////////////////////////////////////////////
    groupA: Array<Subordinate>
    groupB: Array<Subordinate>
    packages: Array<Package>
    totalWithdrawal: number
    withdrawals: Array<{ amount: number, timestamp: number }> = []
    income: Income
    /////////////////////////////--ADMIN PROPERTIES--//////////////////////////
    private totalTurnover: number = 0
    private monthlyTurnover: Array<{ amount: number, month: number, year: number }> = []

    constructor(user?: User) {
        this.appname = user && user.appname ? user.appname : ''
        this.subscriberdocid = user && user.subscriberdocid ? user.subscriberdocid : ''
        this.createdon = user && user.createdon ? user.createdon : 0
        this.modifiedon = user && user.modifiedon ? user.modifiedon : 0
        //////////////////////////////////////////////////////////////
        this.refdocid = user && user.refdocid ? user.refdocid.toUpperCase() : ''
        this.docid = user && user.docid ? user.docid.toUpperCase() : ''
        this.active = user && user.active ? user.active : false
        this.name = user && user.name ? user.name.toUpperCase() : ''
        this.countrycode = user && user.countrycode ? user.countrycode : ''
        this.mobile = user && user.mobile ? user.mobile : ''
        this.email = user && user.email ? user.email : ''
        this.password = user && user.password ? user.password : ''
        this.idproof = user && user.idproof ? user.idproof : { name: '', number: '', issuingAuthority: '' }
        //////////////////////////////////////////////////////////////
        this.bankAccount = user && user.bankAccount ? new BankAccount(user.bankAccount) : null
        //////////////////////////////////////////////////////////////
        this.cryptoWalletAddress = user && user.cryptoWalletAddress ? user.cryptoWalletAddress : ''
        //////////////////////////////////////////////////////////////
        this.groupA = user && user.groupA ? user.groupA.map(a => new Subordinate(a)) : new Array<Subordinate>()
        this.groupB = user && user.groupB ? user.groupB.map(b => new Subordinate(b)) : new Array<Subordinate>()
        this.packages = user && user.packages ? user.packages.map(p => new Package(p)) : new Array<Package>()
        this.totalWithdrawal = user && user.totalWithdrawal ? user.totalWithdrawal : 0
        this.withdrawals = user && user.withdrawals ? user.withdrawals : []
        this.income = user && user.income ? new Income(user.income) : new Income()
        /////////////////////////////////////////////////////////////////
        this.totalTurnover = user && user.totalTurnover ? user.totalTurnover : 0
        this.monthlyTurnover = user && user.monthlyTurnover ? user.monthlyTurnover : new Array<{ amount: number, month: number, year: number }>()
    }

    set(user?: User) {
        this.appname = user && user.appname ? user.appname : ''
        this.subscriberdocid = user && user.subscriberdocid ? user.subscriberdocid : ''
        this.createdon = user && user.createdon ? user.createdon : 0
        this.modifiedon = user && user.modifiedon ? user.modifiedon : 0
        //////////////////////////////////////////////////////////////
        this.refdocid = user && user.refdocid ? user.refdocid.toUpperCase() : ''
        this.docid = user && user.docid ? user.docid.toUpperCase() : ''
        this.active = user && user.active ? user.active : false
        this.name = user && user.name ? user.name.toUpperCase() : ''
        this.countrycode = user && user.countrycode ? user.countrycode : ''
        this.mobile = user && user.mobile ? user.mobile : ''
        this.email = user && user.email ? user.email : ''
        this.password = user && user.password ? user.password : ''
        this.idproof = user && user.idproof ? user.idproof : { name: '', number: '', issuingAuthority: '' }
        //////////////////////////////////////////////////////////////
        this.bankAccount = user && user.bankAccount ? new BankAccount(user.bankAccount) : null
        //////////////////////////////////////////////////////////////
        this.cryptoWalletAddress = user && user.cryptoWalletAddress ? user.cryptoWalletAddress : ''
        //////////////////////////////////////////////////////////////
        this.groupA = user && user.groupA ? user.groupA.map(a => new Subordinate(a)) : new Array<Subordinate>()
        this.groupB = user && user.groupB ? user.groupB.map(b => new Subordinate(b)) : new Array<Subordinate>()
        this.packages = user && user.packages ? user.packages.map(p => new Package(p)) : new Array<Package>()
        this.totalWithdrawal = user && user.totalWithdrawal ? user.totalWithdrawal : 0
        this.withdrawals = user && user.withdrawals ? user.withdrawals : []
        this.income = user && user.income ? new Income(user.income) : new Income()
        /////////////////////////////////////////////////////////////////
        this.totalTurnover = user && user.totalTurnover ? user.totalTurnover : 0
        this.monthlyTurnover = user && user.monthlyTurnover ? user.monthlyTurnover : new Array<{ amount: number, month: number, year: number }>()
    }

    addWithdrawal(amount: number) {
        if (amount < 1) return
        this.totalWithdrawal += amount
        const withdrawals = [{ amount, timestamp: new Date().getTime() }]
        this.withdrawals.filter((w, i) => i < 99).forEach(w => withdrawals.push(w))
        this.withdrawals = withdrawals
    }

    updateProfile(user: User) {
        this.modifiedon = new Date().getTime()
        //////////////////////////////////////////////////////////////
        this.name = user.name ? user.name.toUpperCase() : this.name
        this.countrycode = user.countrycode ? user.countrycode : this.countrycode
        this.mobile = user.mobile ? user.mobile : this.mobile
        this.email = user.email ? user.email : this.email
        this.password = user.password && this.password !== user.password ? user.password : this.password
        this.idproof = user.idproof ? user.idproof : this.idproof
        //////////////////////////////////////////////////////////////
        this.bankAccount = user && user.bankAccount ? new BankAccount(user.bankAccount) : null
        //////////////////////////////////////////////////////////////
        this.cryptoWalletAddress = user.cryptoWalletAddress ? user.cryptoWalletAddress : this.cryptoWalletAddress
    }

    updateSubordinate(user: User) {
        let sub = this.groupA.find(a => a.docid === user.docid)
        if (!sub) {
            sub = this.groupB.find(b => b.docid === user.docid)
        }
        if (sub) {
            sub.name = user.name
            this.modifiedon = new Date().getTime()
        }
    }

    json() {
        const {
            appname, subscriberdocid, createdon, modifiedon,
            refdocid, docid, active, name, countrycode, mobile, email, password, idproof,
            totalWithdrawal, withdrawals, cryptoWalletAddress,
        } = this
        const groupA = this.groupA.map(a => a.json())
        const groupB = this.groupB.map(b => b.json())
        const packages = this.packages.map(p => p.json())
        const totalTurnover = (this.docid === ADMINDOCID) ? this.totalTurnover : null
        const monthlyTurnover = (this.docid === ADMINDOCID) ? this.monthlyTurnover : null
        const income = this.income.json()
        const bankAccount = this.bankAccount ? this.bankAccount.json() : null
        return ({
            appname, subscriberdocid, createdon, modifiedon,
            refdocid, docid, active, name, countrycode, mobile, email, password, idproof,
            groupA, groupB, packages, totalWithdrawal, withdrawals, cryptoWalletAddress,
            totalTurnover, monthlyTurnover, income,
            bankAccount,
        })
    }

    isValid() {//first package should be greater than $15
        return (this.name.length > 4 && this.email.includes('@') && this.email.length > 4 && this.password.length > 5)
    }

    addCompanyTurnover(pkg: Package) {//only admin
        if (this.docid === ADMINDOCID) {
            this.totalTurnover += pkg.amount
            const pkgDate = new Date(pkg.date)
            const mt = this.monthlyTurnover.find(m => m.month === pkgDate.getMonth() && m.year === pkgDate.getFullYear())
            if (mt) {
                mt.amount += pkg.amount
            } else {
                this.monthlyTurnover.push({ month: pkgDate.getMonth(), year: pkgDate.getFullYear(), amount: pkg.amount })
            }
        }
    }

    getTotalTurnover() {
        return (this.docid === ADMINDOCID) ? this.totalTurnover : 0
    }

    getMonthlyTurnover(month: number, year: number) {
        const mt = this.monthlyTurnover.find(m => m.month === month && m.year === year)
        return (this.docid === ADMINDOCID && mt) ? mt.amount : 0
    }

    private setTurnover(pkg: Package) {
        if (this.docid === ADMINDOCID) {
            this.totalTurnover += pkg.amount
            const pkdt = onlyDate(pkg.date)
            const pkMonth = pkdt.getMonth()
            const pkYear = pkdt.getFullYear()
            const mt = this.monthlyTurnover.find(m => m.month === pkMonth && m.year === pkYear)
            if (mt) {
                mt.amount += pkg.amount
            } else {
                this.monthlyTurnover.push({ amount: pkg.amount, month: pkMonth, year: pkYear })
            }
        }
    }

    private async reload(t: firestore.Transaction, docref: firestore.DocumentReference) {
        const snap = await t.get(docref)
        if (snap && snap.exists) {
            this.set(snap.data() as User)
        }
    }

    //Packages are: $15, $100, $250, $500
    async addPackage(db: firestore.Firestore, t: firestore.Transaction, pkg: Package, loaded = false) {
        const docref = db.collection(COLLECTIONS.USER).doc(this.docid)
        if (!loaded) await this.reload(t, docref)
        if (pkg && pkg.amount > 0) {
            console.log('pkg amount', pkg.amount)
            this.packages.push(pkg)
            await this.sendIncomeToParent(db, t, pkg, 1)
            this.modifiedon = pkg.date
            this.active = true
            console.log('this update', this.json())
            t.update(docref, this.json())
        } else {
            console.log('pkg amount null', pkg.amount)
        }
    }

    private async sendIncomeToParent(db: firestore.Firestore, t: firestore.Transaction, pkg: Package, level: number) {//first level always starts with 1
        console.log('parent', this.refdocid)
        if (!this.refdocid) return
        const docref = db.collection(COLLECTIONS.USER).doc(this.refdocid)
        const snap = await t.get(docref)
        if (snap && snap.exists) {
            console.log('parent exists')
            const parent = new User(snap.data() as User)
            if (parent.docid === ADMINDOCID) {
                console.log('parent admin')
                parent.income.absorbTopSubordinateByAdmin(this.docid, pkg, level, parent)
                parent.setTurnover(pkg)
            } else {
                console.log('parent not-admin')
                parent.income.absorbSubordinate(this.docid, pkg, level, parent)
                await parent.sendIncomeToParent(db, t, pkg, level + 1)
            }
            parent.modifiedon = pkg.date
            console.log(this.refdocid + ' updating')
            t.update(docref, parent.json())
            console.log('parent updated')
        }
    }

    getWalletBalance(amount: number) {
        if (amount < 10) return 0
        const today = new Date()
        const tym = today.getFullYear() * 12 + today.getMonth()
        if (this && this.packages && this.packages.length) {
            let sum = 0
            this.packages.forEach(p => {
                const pdt = new Date(p.date)
                const pym = pdt.getFullYear() * 12 + pdt.getMonth()
                const diff = tym - pym
                sum += (p.amount * 0.02 * diff)
            })
            sum += (this.income.totalReferralIncome
                + this.income.totalLevelIncome
                + this.income.totalLdbIncome
                + this.income.totalWorldClubIncome
                - this.totalWithdrawal)
            return (sum < amount) ? 0 : sum
        }
        return 0
    }
}