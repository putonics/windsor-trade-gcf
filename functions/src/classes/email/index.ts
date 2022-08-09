import { firestore } from 'firebase-admin';
const nodemailer = require('nodemailer')

const sendMail = async (user: string, pass: string, to: string, subject: string, text: string, html: string, cc: Array<string> = []) =>
    new Promise<boolean>((resolve, reject) => {
        const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } })
        const mailOptions = { from: user, to, subject, text, html, cc }
        transporter.sendMail(mailOptions, (err: any, sucess: any) => {
            if (err) {
                console.log(err)
                resolve(false)
            } else {
                resolve(true)
            }
        })
    })

export const sendEmail = async (to: string, subject: string, text: string, html: string, cc: Array<string> = []): Promise<boolean> => {
    if (!(to && subject && (text || html))) return false
    let user = 'support@windsortrad.com'
    let pass = 'wcadmin@windsortrad'
    const snap = await firestore().collection('const').doc('EmailServer').get()
    if (snap && snap.exists) {
        const data = snap.data()
        if (data) {
            user = data.user ? data.user : user
            pass = data.pass ? data.pass : pass
        }
    }
    return await sendMail(user, pass, to, subject, text, html, cc)
}


export const sendEmail_UserRegistration = async (to: string, name: string, docid: string) => {
    await sendEmail(to, 'Registration successfull @ windsortrad.com', '',
        `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Windsor Trade</title>
            </head>
            <body>
                <h3>Welcome! ${name}</h3>
                <h1>
                    Your user-id is: <span style="color:#ff0000;font-weight:900;">${docid}</span> 
                </h1>
                <div style="display:flex;justify-content:center;">
                <img style="width:200px;" src="https://windsorcryptocoin.com/img/bg-img/bg-2.png"/>
                </div>
                <p style="font-size:20px;">You can now login at <a href="https://windsortrad.com">windsortrad.com</a> with your user-id and password.</p>
                <p style="font-size:20px;color:#000099;">Refer your friends to join with your referral id with this link <a href="https://windsortrad.com/signup/${docid}">windsortrad.com/signup/${docid}</a> and start your income.</p>
                <br/>
                <br/>
                <br/>With thanks & regards,
                <br/>
                <br/><span style="font-weight:bold;margin-left:20px;">Windsor Trade Team</span>
                <br/>
                <br/><img style="margin-left:20px;" src="https://windsorcryptocoin.com/img/core-img/logo.png" />
            </body>
        </html>   
    `
    )
}

export const sendEmail_AddPackage = async (to: string, ownername: string, ownerdocid: string,
    pkgAmount: number, totalPackageAmount: number, cc?: string
) => {
    await sendEmail(to, `Package $${pkgAmount} alloted successfully`, '',
        `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Windsor Trade</title>
            </head>
            <body>
                <h3>Thank you! ${ownername}</h3>
                <div style="display:flex;justify-content:center;flex-direction:row;">
                <h1>You won <span style="color:#ff0000;font-weight:900;">${pkgAmount * 5}</span> &times; </h1>
                <img style="width:48px;height:48px;" src="https://windsorcryptocoin.com/img/bg-img/bg-2.png"/>
                <h1> WINDSOR Coins</h1>
                </div>
                <h2>
                    A new package of <span style="color:#ff0000;font-weight:900;">$${pkgAmount}</span> has been alloted to ${ownerdocid} 
                </h2>
                <p style="font-size:20px;">Your total package amount is now ${totalPackageAmount}</p>
                <p style="font-size:20px;color:#000099;">Refer your friends to join with your referral id with this link <a href="https://windsortrad.com/signup/${ownerdocid}">windsortrad.com/signup/${ownerdocid}</a> and start your income.</p>
                <br/>
                <br/>
                <br/>With thanks & regards,
                <br/>
                <br/><span style="font-weight:bold;margin-left:20px;">Windsor Trade Team</span>
                <br/>
                <br/><img style="margin-left:20px;" src="https://windsorcryptocoin.com/img/core-img/logo.png" />
            </body>
        </html>   
    `, cc ? [cc] : [])
}

export const sendEmail_WithdrawalRequest = async (to: string, ownername: string, ownerdocid: string,
    amount: number) => {
    await sendEmail(to, `Withdrawal Request initiated`, '',
        `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Windsor Trade</title>
            </head>
            <body>
                <h3>Thank you! ${ownername}</h3>
                <h2>${ownerdocid}</h2>
                <h2>
                    Your request of withdrawal of amount <span style="color:#ff0000;font-weight:900;">$${amount}</span> 
                    has been initiated.
                </h2>
                <p style="font-size:20px;">Our custmer care executive will reach you shortly.</p>
                <br/>
                <br/>
                <br/>With thanks & regards,
                <br/>
                <br/><span style="font-weight:bold;margin-left:20px;">Windsor Trade Team</span>
                <br/>
                <br/><img style="margin-left:20px;" src="https://windsorcryptocoin.com/img/core-img/logo.png" />
            </body>
        </html>   
    `
    )
}

export const sendEmail_Withdrawal = async (to: string, ownername: string, ownerdocid: string,
    amount: number, balance: number
) => {
    await sendEmail(to, `Withdrawal $${amount} successfully`, '',
        `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Windsor Trade</title>
            </head>
            <body>
                <h3>Thank you! ${ownername}</h3>
                <h2>
                    You have withdrawn <span style="color:#ff0000;font-weight:900;">$${amount}</span> 
                </h2>
                <p style="font-size:20px;">Your wallet balance is now ${balance}</p>
                <p style="font-size:20px;color:#000099;">Refer your friends to join with your referral id with this link <a href="https://windsortrad.com/signup/${ownerdocid}">windsortrad.com/signup/${ownerdocid}</a> and start your income.</p>
                <br/>
                <br/>
                <br/>With thanks & regards,
                <br/>
                <br/><span style="font-weight:bold;margin-left:20px;">Windsor Trade Team</span>
                <br/>
                <br/><img style="margin-left:20px;" src="https://windsorcryptocoin.com/img/core-img/logo.png" />
            </body>
        </html>   
    `
    )
}

export const sendEmail_PackageRequestSent = async (
    toSender: string, toReceiver: string,
    ownername: string, ownerdocid: string,
    amount: number
) => {
    await sendEmail(toReceiver, `Package added successfully`, '',
        `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Windsor Trade</title>
            </head>
            <body>
                <h3>Thank you! ${ownername}</h3>
                <h2>
                    A request to add package of <span style="color:#ff0000;font-weight:900;">$${amount}</span> 
                    &nbsp;to the account of ${ownerdocid}, ${ownername} has been initiated.
                </h2>
                <p style="font-size:20px;color:#000099;">Refer your friends to join with your referral id with this link <a href="https://windsortrad.com/signup/${ownerdocid}">windsortrad.com/signup/${ownerdocid}</a> and start your income.</p>
                <br/>
                <br/>
                <br/>With thanks & regards,
                <br/>
                <br/><span style="font-weight:bold;margin-left:20px;">Windsor Trade Team</span>
                <br/>
                <br/><img style="margin-left:20px;" src="https://windsorcryptocoin.com/img/core-img/logo.png" />
            </body>
        </html>   
    `, [toSender]
    )
}

export const sendEmail_OTP = async (to: string, requestid: string, otp: string) => {
    await sendEmail(to, `OTP for request-id ${requestid}`, '',
        `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Windsor Trade</title>
            </head>
            <body>
                <p style="font-size:15px;">${otp} is the OTP for the request-id ${requestid}</p>
                <p style="font-size:15px;color:#ff0000;">Please do not share this code with anyone else.</p>
                <br/>
                <br/>
                <br/>With thanks & regards,
                <br/>
                <br/><span style="font-weight:bold;margin-left:20px;">Windsor Trade Team</span>
                <br/>
                <br/><img style="margin-left:20px;" src="https://windsorcryptocoin.com/img/core-img/logo.png" />
            </body>
        </html>   
    `
    )
}