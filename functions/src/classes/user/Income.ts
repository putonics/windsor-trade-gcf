import { onlyDate } from "../util"
import Package from "./Package"
import User from "./User"

export default class Income {
    totalReferralIncome = 0
    ////////////////////////////////////////
    totalLevelIncome = 0 //upto 17th level
    ////////////////////////////////////////////
    ldbDate = 0
    ldbStar = 0
    totalLdbIncome = 0//leadership bonus
    totalLdbMonth = 0
    /////////////////////////////////////////////
    rewardsAchievedOn: Array<number>
    rewardsAchieved = 0
    totalRewards = 0
    /////////////////////////////////////////////
    worldClubAchievedOn: Array<number>
    worldClubRank = 0
    totalWorldClubIncome = 0

    constructor(i?: Income) {
        this.totalReferralIncome = i && i.totalReferralIncome ? i.totalReferralIncome : 0
        ///////////////////////////////////////////////////////////////////////////////////
        this.totalLevelIncome = i && i.totalLevelIncome ? i.totalLevelIncome : 0
        //////////////////////////////////////////////////////////////////////////////////
        this.ldbDate = i && i.ldbDate ? i.ldbDate : 0
        this.ldbStar = i && i.ldbStar ? i.ldbStar : 0
        this.totalLdbIncome = i && i.totalLdbIncome ? i.totalLdbIncome : 0
        this.totalLdbMonth = i && i.totalLdbMonth ? i.totalLdbMonth : 0
        //////////////////////////////////////////////////////////////////////////////////
        this.rewardsAchievedOn = i && i.rewardsAchievedOn ? i.rewardsAchievedOn : [0]
        this.rewardsAchieved = i && i.rewardsAchieved ? i.rewardsAchieved : 0
        this.totalRewards = i && i.totalRewards ? i.totalRewards : 0
        //////////////////////////////////////////////////////////////////////////////////
        this.worldClubAchievedOn = i && i.worldClubAchievedOn ? i.worldClubAchievedOn : [0]
        this.worldClubRank = i && i.worldClubRank ? i.worldClubRank : 0
        this.totalWorldClubIncome = i && i.totalWorldClubIncome ? i.totalWorldClubIncome : 0
    }

    json() {
        const {
            totalReferralIncome, totalLevelIncome,
            ldbDate, ldbStar, totalLdbIncome, totalLdbMonth,
            rewardsAchievedOn, rewardsAchieved, totalRewards,
            worldClubAchievedOn, worldClubRank, totalWorldClubIncome,
        } = this
        return ({
            totalReferralIncome, totalLevelIncome,
            ldbDate, ldbStar, totalLdbIncome, totalLdbMonth,
            rewardsAchievedOn, rewardsAchieved, totalRewards,
            worldClubAchievedOn, worldClubRank, totalWorldClubIncome,
        })
    }

    /**
     * Referral Income:
     * Only the referer will get that i.e at level-1 up.
     * 15% from the pkg of the subordinate if subordinate pkg is under $15.
     * 20% from the pkg of the subordinate if subordinate pkg is over $15.
     */
    private absorbReferralIncome(pkg: Package, level: number) {
        if (level === 1) {
            this.totalReferralIncome += (pkg.amount * (pkg.amount > 15 ? 0.2 : 0.15))
        }
    }

    /**
     * Level Income:
     * Level-1 up: 3% from subordinate pkg
     * Level-2 up: 2% from subordinate pkg
     * Level-3-6 up: 1% from subordinate pkg
      * Level-7-12 up: 0.75% from subordinate pkg
     * Level-13-17 up: 0.05% from subordinate pkg
     * Level-18-rest up: 0% from subordinate pkg
     */
    private static levelPercentage = [
        0, .03, .02,
        .01, .01, .01, .01,
        0.0075, 0.0075, 0.0075, 0.0075, 0.0075, 0.0075,
        0.005, 0.005, 0.005, 0.005, 0.005,
    ]
    private absorbLevelIncome(pkg: Package, level: number) {
        if (level < 18) {
            this.totalLevelIncome += (pkg.amount * Income.levelPercentage[level])
        }
    }

    /**
     * Leadership Bonus Income:
     * Star-1: 
     */
    private static LDB_STAR = [
        0, 3000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000, 2000000, 4000000,
    ]
    private static LDB_MONTHLY_TARGET = [
        0, 500, 1500, 2500, 5000, 10000, 25000, 50000, 100000, 0, 0,
    ]
    private static LDB = [
        0, 10, 25, 75, 150, 300, 800, 1600, 3200, 6500, 0,
    ]
    private absorbLdbIncome(user: User, aTotal: number, aMonthly: number, bTotal: number, bMonthly: number) {
        const today = onlyDate()
        const ldbDate = onlyDate(this.ldbDate)
        if (today.getTime() > ldbDate.getTime() && (today.getFullYear() > ldbDate.getFullYear() || today.getMonth() > ldbDate.getMonth())) {//1st calculation of next month
            this.ldbDate = today.getTime()
            //////////////////////////////////////////////////
            let ldbStar = 0
            Income.LDB_STAR.forEach((star, index) => {
                if (aTotal >= star && bTotal >= star) ldbStar = index
            })
            const upgraded = this.ldbStar < ldbStar
            ////////////////////////////////////////////////////////
            if (upgraded) {
                this.ldbStar = ldbStar
                this.totalLdbIncome += Income.LDB[this.ldbStar]
                this.totalLdbMonth = 1
            } else if (this.totalLdbMonth < 12 && (aMonthly >= Income.LDB_MONTHLY_TARGET[this.ldbStar] && bMonthly >= Income.LDB_MONTHLY_TARGET[this.ldbStar])) {
                this.totalLdbIncome += Income.LDB[this.ldbStar]
                this.totalLdbMonth++
            }
            user.groupA.forEach(s => { s.mp = 0 })
            user.groupB.forEach(s => { s.mp = 0 })
        }
    }

    private static REWARD_MATCHING = [0, 1000, 2500, 5000, 10000, 20000, 40000, 100000, 250000, 700000, 1500000, 3000000, 7000000]
    private absorbRewards(aTotal: number, bTotal: number) {
        const a = aTotal - this.rewardsAchieved
        const b = bTotal - this.rewardsAchieved
        let rewardsAchieved = this.rewardsAchieved
        Income.REWARD_MATCHING.forEach(r => {
            if (a >= r && b >= r) rewardsAchieved = r
        })
        if (rewardsAchieved > this.rewardsAchieved) {
            this.rewardsAchieved = rewardsAchieved
            this.rewardsAchievedOn.push(onlyDate().getTime())
        }
    }

    private static WORLD_CLUB_MEMBER_COUNT = [0, 5, 10, 20, 50]
    // private static WORLD_CLUB_RANK = ['SILVER', 'GOLD', 'RUBI', 'PEARL', 'DIAMOND']
    private absorbWorldClubRank(user: User) {
        let ownSum = 0
        user.packages.forEach(p => {
            ownSum += p.amount
        })
        if (ownSum < 100) return
        let count = 0
        user.groupA.forEach(a => {
            count += (a.dp >= 100 ? 1 : 0)
        })
        user.groupB.forEach(b => {
            count += (b.dp >= 100 ? 1 : 0)
        })
        let worldClubRank = 0
        Income.WORLD_CLUB_MEMBER_COUNT.forEach((c, index) => {
            if (count >= c) worldClubRank = index
        })
        if (worldClubRank > this.worldClubRank) {
            this.worldClubRank = worldClubRank
            this.worldClubAchievedOn.push(onlyDate().getTime())
        }
    }

    absorbSubordinate(subordinatedocid: string, pkg: Package, level: number, user: User) {
        this.absorbReferralIncome(pkg, level)
        this.absorbLevelIncome(pkg, level)
        let aTotal = 0
        let aMonthly = 0
        user.groupA.forEach(a => {
            aTotal += a.tp
            aMonthly += a.mp
        })
        let bTotal = 0
        let bMonthly = 0
        user.groupB.forEach(b => {
            bTotal += b.tp
            bMonthly += b.mp
        })
        this.absorbLdbIncome(user, aTotal, aMonthly, bTotal, bMonthly)
        let subordinate = user.groupA.find(a => a.docid === subordinatedocid)
        if (subordinate) {
            if (level === 1) subordinate.dp += pkg.amount
            subordinate.tp += pkg.amount
            subordinate.mp += pkg.amount
            aTotal += pkg.amount
        } else {
            subordinate = user.groupB.find(b => b.docid === subordinatedocid)
            if (subordinate) {
                if (level === 1) subordinate.dp += pkg.amount
                subordinate.tp += pkg.amount
                subordinate.mp += pkg.amount
                bTotal += pkg.amount
            }
        }
        this.absorbRewards(aTotal, bTotal)
        this.absorbWorldClubRank(user)
    }

    absorbTopSubordinateByAdmin(subordinatedocid: string, pkg: Package, level: number, admin: User) {
        const today = onlyDate()
        const ldbDate = onlyDate(this.ldbDate)
        if (today.getTime() > ldbDate.getTime() && (today.getFullYear() > ldbDate.getFullYear() || today.getMonth() > ldbDate.getMonth())) {//1st calculation of next month
            this.ldbDate = today.getTime()
            admin.groupA.forEach(s => { s.mp = 0 })
            admin.groupB.forEach(s => { s.mp = 0 })
        }
        let subordinate = admin.groupA.find(a => a.docid === subordinatedocid)
        if (subordinate) {
            if (level === 1) subordinate.dp += pkg.amount
            subordinate.tp += pkg.amount
            subordinate.mp += pkg.amount
        } else {
            subordinate = admin.groupB.find(b => b.docid === subordinatedocid)
            if (subordinate) {
                if (level === 1) subordinate.dp += pkg.amount
                subordinate.tp += pkg.amount
                subordinate.mp += pkg.amount
            }
        }
    }
}