import { Request, Response } from "firebase-functions"

const CryptoJS = require('crypto-js')
const ENC = 'L)w@~Z!0@q#₽$tbG,₼₣|pA+₾#₹₠7$x(C5.y+₩€₵n4F1}₮₱₲&u=8MD₳◊₴"o6S₦₸₺₻*5₡₢K^ev%3J-₭₤₥rV{H9<tb'
const DYC = '◊₴"4F1}L)tbG,₼₣5₡₢K^ev%35.₮₱₲&u=8MD₳|pA+₾#y+₩€₵n₠7$x(Cw@~Z!0@q#₹o6S₦₸₺₻J-₭₤₥rV{H9<tb₽$*'

export const encrypt = (text: string): string | null => {
    try {
        return CryptoJS.AES.encrypt(text, ENC).toString()
    } catch (ex) {
        return null
    }
}

export const decrypt = (cipher: string): string | null => {
    try {
        return CryptoJS.AES.decrypt(cipher, DYC).toString(CryptoJS.enc.Utf8)
    } catch (ex) {
        return null
    }
}

export const send = (response: Response, data: any) => {
    if (data) {
        response.json({ data: encrypt(JSON.stringify(data)) }) //send as {data: string}
    } else {
        response.json({ data: null })
    }
}

export const receive = (request: Request) => {
    // console.log('receive-1')
    // console.log(request.body)
    const { body } = request
    if (body) {
        // console.log('receive-2')
        try {
            // console.log('body: ' + body)
            const text = body ? decrypt(body) : null
            // console.log('text: ' + text)
            return text ? JSON.parse(text) : null
        } catch (ex) {
            // console.log('receive-3')
            return null
        }
    } else {
        // console.log('receive-4')
        return null
    }
}

/*
App level keys
const DYC = 'L)w@~Z!0@q#₽$tbG,₼₣|pA+₾#₹₠7$x(C5.y+₩€₵n4F1}₮₱₲&u=8MD₳◊₴"o6S₦₸₺₻*5₡₢K^ev%3J-₭₤₥rV{H9<tb'
const ENC = '◊₴"4F1}L)tbG,₼₣5₡₢K^ev%35.₮₱₲&u=8MD₳|pA+₾#y+₩€₵n₠7$x(Cw@~Z!0@q#₹o6S₦₸₺₻J-₭₤₥rV{H9<tb₽$*'
 */

export const encryptPassword = (text: string, key: string): string => {
    try {
        return CryptoJS.AES.encrypt(text, key).toString()
    } catch (ex) {
        return ''
    }
}

export const decryptPassword = (cipher: string, key: string): string => {
    try {
        return CryptoJS.AES.decrypt(cipher, key).toString(CryptoJS.enc.Utf8)
    } catch (ex) {
        return ''
    }
}