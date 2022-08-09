export default class Subordinate {
    docid: string
    name: string
    /////////////////////////////////////////////////////////////
    dp: number //direct package i.e only the subordinate package
    tp: number //total package price of this member
    mp: number //total monthly package price of this member

    constructor(s?: Subordinate) {
        this.docid = s && s.docid ? s.docid.toUpperCase() : ''
        this.name = s && s.name ? s.name.toUpperCase() : ''
        this.dp = s && s.dp ? s.dp : 0
        this.tp = s && s.tp ? s.tp : 0
        this.mp = s && s.mp ? s.mp : 0
    }

    json() {
        const { docid, name, dp, tp, mp } = this
        return ({ docid, name, dp, tp, mp })
    }
}