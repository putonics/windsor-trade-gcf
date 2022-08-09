import Admin, { SUPERADMINDOCID } from './Admin';
import { sendEmail_UserRegistration, sendEmail_AddPackage, sendEmail_OTP, sendEmail_Withdrawal, sendEmail_PackageRequestSent, sendEmail_WithdrawalRequest } from './../email/index';
import { firestore } from 'firebase-admin'
import { Request, Response } from "firebase-functions"
import { decryptPassword, encryptPassword, receive, send } from '../CryptoServer'
import User from './User'
import { COLLECTIONS, isValidDocRequest } from '../Constants'
import Subordinate from './Subordinate'
import { setCacheAge } from '../TimeServer'
import { onlyDate } from '../util';
import PackageRequest from './PackageRequest';
import Package from './Package';
import Withdrawal from './Withdrawal';

const emailExists = async (email: string) => {
    const db = firestore()
    const snap = await db.collection(COLLECTIONS.USER).where('email', '==', email).get()
    return Boolean(snap && snap.docs && snap.docs.length > 0)
}

const refererExists = async (refdocid: string) => {
    const db = firestore()
    const snap = await db.collection(COLLECTIONS.USER).doc(refdocid).get()
    return Boolean(snap && snap.exists && snap.data()?.active)
}

//API:GET: check whether email exists or not
export const checkEmail = async (request: Request, response: Response) => {
    const { email } = request.params
    console.log('checkEmail-1')
    if (email && (await emailExists(email))) {
        console.log('checkEmail-2')
        setCacheAge(response, 'DAY')
        send(response, true)
    }
    console.log('checkEmail-3')
    send(response, false)
}

//API:GET: check whether referer exists or not
export const checkReferer = async (request: Request, response: Response) => {
    const { refdocid } = request.params
    if (refdocid && (await refererExists(refdocid))) {
        setCacheAge(response, 'DAY')
        send(response, true)
    }
    send(response, false)
}

const generateDocid = (lastUser: User, user: User) => {
    const { docid } = lastUser
    const name = user.name.toUpperCase().split(' ').join('').substring(0, 2)
    user.docid = 'WC' + name + ((((+('1' + docid.substring(4))) + 1) + '').substring(1))
    user.password = encryptPassword(user.password, user.docid)
}

//API:POST: new user signup
export const signup = async (request: Request, response: Response) => {
    const data = receive(request)
    if (data) {
        const user = new User(data)
        if (isValidDocRequest(user) && user.isValid() && !(await emailExists(user.email))) {
            const db = firestore()
            try {
                await db.runTransaction(async (t) => {
                    const refererReference = db.collection(COLLECTIONS.USER).doc(user.refdocid)
                    const snap = await t.get(refererReference)
                    if (snap && snap.exists) {
                        const referer = new User(snap.data() as User)
                        if (referer.active) {
                            /////////////////Generating new docid////////////////////
                            const snap2 = await t.get(db.collection(COLLECTIONS.USER).orderBy('createdon', 'desc').limit(1))
                            if (snap2 && snap2.docs && snap2.docs.length) {
                                const lastUser = new User(snap2.docs[0].data() as User)
                                generateDocid(lastUser, user)
                                /////////////////Referer Subordinate/////////////////////
                                const newSubordinate = new Subordinate()
                                newSubordinate.docid = user.docid
                                newSubordinate.name = user.name
                                if (referer.groupA.length > referer.groupB.length) {
                                    console.log('signup: groupB')
                                    referer.groupB.push(newSubordinate)
                                } else {
                                    console.log('signup: groupA')
                                    referer.groupA.push(newSubordinate)
                                }
                                //////////////WRITING TRANSACTIONS////////////////////
                                const modifiedon = new Date().getTime()
                                user.createdon = modifiedon
                                user.modifiedon = modifiedon
                                referer.modifiedon = modifiedon
                                t.set(db.collection(COLLECTIONS.USER).doc(user.docid), user.json())
                                t.update(refererReference, referer.json())

                            } else {
                                throw Error('not find any doc')
                            }
                        } else {
                            throw Error('referer-id is inactive')
                        }
                    } else {
                        throw Error('user not found')
                    }
                })//end of transaction
                await sendEmail_UserRegistration(user.email, user.name, user.docid)
                console.log('signup: success')
                send(response, user.json())
            } catch (ex) {
                console.log('signup: error: ' + ex)
                send(response, null)
            }
        } else {
            console.log('signup: invalid request')
            send(response, null)
        }
    } else {
        console.log('signup: no data')
        send(response, null)
    }
}


//API:POST: old user signin
export const signin = async (request: Request, response: Response) => {
    // console.log('signin')
    const data = receive(request)
    if (data) {
        // console.log('data')
        const user = new User(data)
        if (isValidDocRequest(user)) {
            // console.log('valid')
            const db = firestore()
            const snap = await db.collection(COLLECTIONS.USER).where('docid', '==', user.docid).limit(1).get()
            if (snap && snap.docs && snap.docs.length) {
                const user2 = new User(snap.docs[0].data() as User)
                if (user.password === decryptPassword(user2.password, user2.docid)) {
                    console.log('signin: success')
                    send(response, user2.json())
                } else {
                    console.log('signin: invalid password')
                    send(response, null)
                }
            } else {
                console.log('signin: not record found')
                send(response, null)
            }
        } else {
            console.log('signin: invalid request')
            send(response, null)
        }
    } else {
        console.log('signin: no data')
        send(response, null)
    }
}

export const modify = async (request: Request, response: Response) => {
    const data = receive(request)
    if (data) {
        let user = new User(data)
        if (isValidDocRequest(user)) {
            const db = firestore()
            try {
                await db.runTransaction(async (t) => {
                    const doc = await t.get(db.collection(COLLECTIONS.USER).doc(user.docid))
                    if (doc && doc.exists) {
                        const user2 = new User(doc.data() as User)
                        if (user2.name !== user.name) {//Update parent when name changed
                            const doc2 = await t.get(db.collection(COLLECTIONS.USER).doc(user.refdocid))
                            if (doc2 && doc2.exists) {
                                const parent = new User(doc2.data() as User)
                                parent.updateSubordinate(user2)
                                t.update(doc2.ref, parent.json())
                            }
                        }
                        user2.updateProfile(user)
                        user = user2
                        t.update(doc.ref, user2.json())
                    } else {
                        throw new Error('not found any record')
                    }
                })
                console.log('modify: success')
                send(response, user.json())
            } catch (ex) {
                console.log('modify: err: ' + ex)
                send(response, null)
            }
        } else {
            console.log('modify: invalid request')
            send(response, null)
        }
    } else {
        console.log('modify: no data')
        send(response, null)
    }
}

export const modifyAdmin = async (request: Request, response: Response) => {
    const data = receive(request)
    if (data) {
        const admin = new Admin(data)
        if (isValidDocRequest(admin)) {
            const db = firestore()
            try {
                await db.runTransaction(async (t) => {
                    // const doc = await t.get(db.collection(COLLECTIONS.ADMIN).doc(admin.docid))
                    //..
                })
                console.log('modify: success')
                send(response, admin.json())
            } catch (ex) {
                console.log('modify: err: ' + ex)
                send(response, null)
            }
        } else {
            console.log('modify: invalid request')
            send(response, null)
        }
    } else {
        console.log('modify: no data')
        send(response, null)
    }
}

//API:POST: user info
export const load = async (request: Request, response: Response) => {
    const data = receive(request)
    if (data) {
        const user = new User(data)
        if (isValidDocRequest(user)) {
            const db = firestore()
            const snap = await db.collection(COLLECTIONS.USER).where('docid', '==', user.docid).limit(1).get()
            if (snap && snap.docs && snap.docs.length) {
                const user2 = new User(snap.docs[0].data() as User)
                console.log('load: success')
                send(response, user2.json())
            } else {
                console.log('load: no record found')
                send(response, null)
            }
        } else {
            console.log('load: invalid request')
            send(response, null)
        }
    } else {
        console.log('load: no data')
        send(response, null)
    }
}

//API:POST: inactive users
export const inactiveUsers = async (request: Request, response: Response) => {
    const data = receive(request)
    if (data) {
        const user = new User(data)
        if (isValidDocRequest(user)) {
            const db = firestore()
            const snap = await db.collection(COLLECTIONS.USER).where('active', '==', false).get()
            if (snap && snap.docs && snap.docs.length) {
                const users = new Array<any>()
                snap.docs.forEach(doc => {
                    users.push((new User(doc.data() as User)).json())
                })
                console.log('inactiveUsers: success')
                send(response, users)
            } else {
                console.log('inactiveUsers: no record found')
                send(response, null)
            }
        } else {
            console.log('inactiveUsers: invalid request')
            send(response, null)
        }
    } else {
        console.log('inactiveUsers: no data')
        send(response, null)
    }
}

//API:POST: old user signin
export const adminSignin = async (request: Request, response: Response) => {
    const data = receive(request)
    if (data) {
        const user = new User(data)
        console.log(user.json())
        if (isValidDocRequest(user)) {
            const db = firestore()
            const snap = await db.collection(COLLECTIONS.ADMIN).where('docid', '==', user.docid).limit(1).get()
            if (snap && snap.docs && snap.docs.length) {
                const user2 = new User(snap.docs[0].data() as User)
                if (user.password === decryptPassword(user2.password, user2.docid)) {
                    console.log('adminSignin: success')
                    send(response, user2.json())
                } else {
                    console.log('adminSignin: invalid password')
                    send(response, null)
                }
            } else {
                console.log('adminSignin: no record found')
                send(response, null)
            }
        } else {
            console.log('adminSignin: invalid request')
            send(response, null)
        }
    } else {
        console.log('adminSignin: no data')
        send(response, null)
    }
}

//API:POST: add new package from admin 
//Client Side: add a new Package with 0 date and lastIndex with the user obejct and then send here
export const addPackage = async (request: Request, response: Response) => {
    const data = receive(request)
    if (data) {
        const user = new User(data)
        const dt = onlyDate().getTime()
        const newPkg = user.packages.find(p => p.index === user.packages.length - 1 && p.date === dt)
        if (newPkg) {
            if (isValidDocRequest(user)) {
                const db = firestore()
                try {
                    await db.runTransaction(async (t) => {
                        await user.addPackage(db, t, newPkg)
                    })
                    let sum = 0
                    user.packages.forEach(p => {
                        sum += p.amount
                    })
                    await sendEmail_AddPackage(user.email, user.name, user.docid, newPkg.amount, sum)
                    console.log('addPackage: success')
                    send(response, user.json())
                } catch (ex) {
                    console.log('addPackage: err: ' + ex)
                    send(response, null)
                }
            } else {
                console.log('addPackage: invalid request')
                send(response, null)
            }
        } else {
            console.log('addPackage: no request')
            send(response, null)
        }
    } else {
        console.log('addPackage: no data')
        send(response, null)
    }
}

const PKGS = [15, 100, 250, 500]
//API: Post: Request for add package by User
export const requestPackage = async (request: Request, response: Response) => {
    const data = receive(request)
    if (data) {
        const pr = new PackageRequest(data)
        if (isValidDocRequest(pr) && PKGS.includes(pr.amount)) {
            const db = firestore()
            try {
                await db.runTransaction(async (t) => {
                    const doc = await t.get(db.collection(COLLECTIONS.USER).doc(pr.docid))
                    if (doc && doc.exists) {
                        const sender = new User(doc.data() as User)
                        let receiver = sender
                        pr.setSender(sender)
                        pr.setReceiver(sender)
                        if (pr.docid !== pr.todocid) {
                            const doc2 = await t.get(db.collection(COLLECTIONS.USER).doc(pr.todocid))
                            if (doc2 && doc2.exists) {
                                receiver = new User(doc2.data() as User)
                                pr.setReceiver(receiver)
                            }
                        }
                        ///////////////////////////////////////////////////////////////////////////
                        const balance = sender.getWalletBalance(pr.amount)
                        //////////////////////////////////////////////////////////////////////////////////
                        if (pr.amount <= balance) {
                            sender.addWithdrawal(pr.amount)
                            const newPkg = new Package({
                                index: receiver.packages.length,
                                amount: pr.amount,
                                date: new Date().getTime(),
                            } as Package)
                            await receiver.addPackage(db, t, newPkg)
                            if (pr.docid !== pr.todocid) {
                                t.update(doc.ref, sender.json())
                            }
                            let sum = 0
                            receiver.packages.forEach(p => {
                                sum += p.amount
                            })
                            /////////////////////////////////////////////
                            const withdrawal = new Withdrawal()
                            withdrawal.applyPackage(pr, balance - pr.amount)
                            t.create(db.collection(COLLECTIONS.WITHDRAWALS).doc(), withdrawal.json())
                            ////////////////////////////////////////////
                            await sendEmail_AddPackage(receiver.email, receiver.name, receiver.docid, newPkg.amount, sum)
                            await sendEmail_Withdrawal(sender.email, sender.name, sender.docid, newPkg.amount, balance - newPkg.amount)
                        } else {
                            t.create(db.collection(COLLECTIONS.PACKAGES).doc(), pr.json())
                            await sendEmail_PackageRequestSent(sender.email, receiver.email, receiver.name, receiver.docid, pr.amount)
                        }
                    } else {
                        throw new Error('No record found')
                    }
                })//end of runTransaction
                console.log('requestPackage: success')
                send(response, pr.json())
            } catch (ex) {
                console.log('requestPackage: err: ' + ex)
                send(response, null)
            }
        } else {
            console.log('requestPackage: invalid request')
            send(response, null)
        }
    } else {
        console.log('requestPackage: no data')
        send(response, null)
    }
}

//API: POST: Send OTP
//Takes user info
export const sendOtp = async (request: Request, response: Response) => {
    const data = receive(request)
    if (data) {
        const user = new User(data)
        if (isValidDocRequest(user)) {
            const db = firestore()
            const snap = await db.collection(
                user.docid === SUPERADMINDOCID ? COLLECTIONS.ADMIN : COLLECTIONS.USER
            ).where('docid', '==', user.docid).limit(1).get()
            if (snap && snap.docs && snap.docs.length) {
                const user2 = new User(snap.docs[0].data() as User)
                const rand = (Math.random() + '').substring(4, 15)
                const x = user2.email.split('@')
                const email = x[0].substring(0, 2) + '****' + x[0].substring(x[0].length - 2, x[0].length) + '@'
                    + x[1]
                const requestid = rand.substring(0, 5)
                const otp = rand.substring(5, 15)
                await sendEmail_OTP(user2.email, requestid, otp)
                console.log('sendOtp: success')
                send(response, { email, requestid, otp })
            } else {
                console.log('sendOtp: no record found')
                send(response, null)
            }
        } else {
            console.log('sendOtp: invalid request')
        }
    } else {
        console.log('sendOtp: no data')
    }
}

//API: Request for money withdrawal
//Takes user info
export const requestWithdrawal = async (request: Request, response: Response) => {
    const data = receive(request)
    if (data) {
        const withdrawal = new Withdrawal(data)
        if (isValidDocRequest(withdrawal)) {
            const db = firestore()
            try {
                let user = new User()
                await db.runTransaction(async (t) => {
                    const doc = await t.get(db.collection(COLLECTIONS.USER).doc(withdrawal.docid))
                    if (doc && doc.exists) {
                        user = new User(doc.data() as User)
                        const balance = user.getWalletBalance(withdrawal.amount)
                        if (balance) {
                            withdrawal.applyUser(user, balance)
                            t.create(db.collection(COLLECTIONS.WITHDRAWALS).doc(), withdrawal.json())
                        } else {
                            throw new Error('insufficient balance')
                        }
                    } else {
                        throw new Error('no record found')
                    }
                })
                await sendEmail_WithdrawalRequest(user.email, user.name, user.docid, withdrawal.amount)
                console.log('requestWithdrawal: success')
                send(response, withdrawal.json())
            } catch (e) {
                console.log('requestWithdrawal: err: ' + e)
                send(response, null)
            }
        } else {
            console.log('requestWithdrawal: invalid request')
            send(response, null)
        }
    } else {
        console.log('requestWithdrawal: no data')
        send(response, null)
    }
}

export const getWithdrawalList = async (request: Request, response: Response) => {
    const data = receive(request)
    if (data) {
        const user = new User(data)
        if (isValidDocRequest(user)) {
            const db = firestore()
            const snap = await db.collection(COLLECTIONS.WITHDRAWALS)
                .where('docid', '==', user.docid)
                .orderBy('requestedon', 'desc')
                .limit(10).get()
            if (snap && snap.docs && snap.docs.length) {
                const withdrawals = new Array<Withdrawal>()
                snap.docs.forEach(doc => {
                    withdrawals.push(new Withdrawal(doc.data() as Withdrawal))
                })
                console.log('getWithdrawalList: success')
                send(response, withdrawals.map(m => m.json()))
            } else {
                console.log('getWithdrawalList: no record found')
                send(response, null)
            }
        } else {
            console.log('getWithdrawalList: invalid request')
            send(response, null)
        }
    } else {
        console.log('getWithdrawalList: no data')
        send(response, null)
    }
}

export const getPendingPackages = async (request: Request, response: Response) => {
    const data = receive(request)
    if (data) {
        const user = new User(data)
        if (isValidDocRequest(user)) {
            const db = firestore()
            const snap = await db.collection(COLLECTIONS.PACKAGES)
                .where('servedon', '==', 0)
                .orderBy('requestedon', 'desc')
                .get()
            if (snap && snap.docs && snap.docs.length) {
                const packages = new Array<PackageRequest>()
                snap.docs.forEach(doc => {
                    packages.push(new PackageRequest(doc.data() as PackageRequest))
                })
                console.log('getPendingPackages: success')
                send(response, packages.map(m => m.json()))
            } else {
                console.log('getPendingPackages: no record found')
                send(response, null)
            }
        } else {
            console.log('getPendingPackages: invalid request')
            send(response, null)
        }
    } else {
        console.log('getPendingPackages: no data')
        send(response, null)
    }
}

export const servePackage = async (request: Request, response: Response) => {
    console.log('1-serve pkg')
    const data = receive(request)
    console.log('2')
    if (data) {
        console.log('3')
        const pkg = new PackageRequest(data)
        const user = new User()
        if (isValidDocRequest(pkg)) {
            console.log('4')
            const db = firestore()
            try {
                console.log('5')
                await db.runTransaction(async (t) => {
                    console.log('6')
                    const snap = await t.get(db.collection(COLLECTIONS.PACKAGES)
                        .where('docid', '==', pkg.docid)
                        .where('requestedon', '==', pkg.requestedon)
                        .where('servedon', '==', 0)
                        .limit(1))
                    if (snap && snap.docs && snap.docs.length) {
                        console.log('7')
                        pkg.set(snap.docs[0].data() as PackageRequest)
                        const doc = await t.get(db.collection(COLLECTIONS.USER).doc(pkg.todocid))
                        if (doc && doc.exists) {
                            console.log('8')
                            user.set(doc.data() as User)
                            const newPkg = new Package()
                            newPkg.index = user.packages.length
                            newPkg.amount = pkg.amount
                            newPkg.date = onlyDate().getTime()
                            await user.addPackage(db, t, newPkg, true)
                            pkg.servedon = new Date().getTime()
                            t.update(snap.docs[0].ref, pkg.json())
                        } else {
                            console.log('9')
                            throw new Error('no receiver record found')
                        }
                        console.log('10')
                    } else {
                        console.log('11')
                        throw new Error('no package-request record found')
                    }
                    console.log('12')
                })
                console.log('13')
                let sum = 0
                user.packages.forEach(p => {
                    console.log('14')
                    sum += p.amount
                })
                console.log('15')
                await sendEmail_AddPackage(pkg.toemail, pkg.toname, pkg.todocid, pkg.amount, sum, pkg.email)
                console.log('servePackage: success')
                send(response, pkg.json())
            } catch (ex) {
                console.log('servePackage: err: ' + ex)
                send(response, null)
            }
        } else {
            console.log('servePackage: invalid request')
            send(response, null)
        }
    } else {
        console.log('servePackage: no data')
        send(response, null)
    }
}

export const getPendingWithdrawals = async (request: Request, response: Response) => {
    const data = receive(request)
    if (data) {
        const user = new User(data)
        if (isValidDocRequest(user)) {
            const db = firestore()
            const snap = await db.collection(COLLECTIONS.WITHDRAWALS)
                .where('servedon', '==', 0)
                .orderBy('requestedon', 'desc')
                .get()
            if (snap && snap.docs && snap.docs.length) {
                const withdrawals = new Array<Withdrawal>()
                snap.docs.forEach(doc => {
                    withdrawals.push(new Withdrawal(doc.data() as Withdrawal))
                })
                console.log('getPendingWithdrawals: success')
                send(response, withdrawals.map(m => m.json()))
            } else {
                console.log('getPendingWithdrawals: no record found')
                send(response, null)
            }
        } else {
            console.log('getPendingWithdrawals: invalid request')
            send(response, null)
        }
    } else {
        console.log('getPendingWithdrawals: no data')
        send(response, null)
    }
}

export const serveWithdrawal = async (request: Request, response: Response) => {
    const data = receive(request)
    if (data) {
        const withdrawal = new Withdrawal(data)
        if (isValidDocRequest(withdrawal)) {
            const db = firestore()
            try {
                await db.runTransaction(async (t) => {
                    const snap = await t.get(db.collection(COLLECTIONS.WITHDRAWALS)
                        .where('docid', '==', withdrawal.docid)
                        .where('requestedon', '==', withdrawal.requestedon)
                        .where('servedon', '==', 0)
                        .limit(1))
                    if (snap && snap.docs && snap.docs.length) {
                        withdrawal.set(snap.docs[0].data() as Withdrawal)
                        const doc = await t.get(db.collection(COLLECTIONS.USER).doc(withdrawal.docid))
                        if (doc && doc.exists) {
                            const user = new User(doc.data() as User)
                            const balance = user.getWalletBalance(withdrawal.amount)
                            if (balance) {
                                user.addWithdrawal(withdrawal.amount)
                                withdrawal.walletBalance = balance
                                withdrawal.servedon = new Date().getTime()
                                t.set(snap.docs[0].ref, withdrawal.json())
                                t.set(db.collection(COLLECTIONS.USER).doc(withdrawal.docid), user.json())
                            } else {
                                throw new Error('insufficient wallet balance')
                            }
                        } else {
                            throw new Error('no withdrawal request record found')
                        }
                    } else {
                        throw new Error('no record found')
                    }
                })
                await sendEmail_Withdrawal(withdrawal.email, withdrawal.name, withdrawal.docid,
                    withdrawal.amount, withdrawal.walletBalance)
                console.log('serveWithdrawal: success')
                send(response, withdrawal.json())
            } catch (ex) {
                console.log('serveWithdrawal: err: ' + ex)
                send(response, null)
            }
        } else {
            console.log('serveWithdrawal: invalid request')
            send(response, null)
        }
    } else {
        console.log('serveWithdrawal: no data')
        send(response, null)
    }
}

export const shareTurnover = async (request: Request, response: Response) => {
    const data = receive(request)
    if (data) {
        const user = new User(data)
        if (isValidDocRequest(user)) {
            const db = firestore()
            const snap = await db.collection(COLLECTIONS.ADMIN).doc(user.docid).get()
            if (snap && snap.exists) {
                //const user2 = new User(snap.docs[0].data() as User)
                //--code here
                send(response, {})
            } else {
                send(response, null)
            }
        }
    }
}