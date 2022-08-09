import { Response } from "firebase-functions"

/*
response.set('Cache-Control', 'public, max-age=600, s-maxage=600')//CDN

max-age=<seconds>
The maximum amount of time a resource is considered fresh.
Unlike Expires, this directive is relative to the time of the request.

s-maxage=<seconds>
Overrides max-age or the Expires header, but only for shared caches (e.g., proxies).
Ignored by private caches.
*/

export const changeToIST = (date: Date): Date => {
    date.setMinutes(date.getMinutes() + 5.5 * 60)//IST is 5.5hrs advance than GMT
    return date
}

export const getMaxAgeFor = (days: number): number => {
    const today = new Date()
    changeToIST(today)
    const nextday = new Date()
    changeToIST(nextday)
    nextday.setDate(today.getDate() + days)
    nextday.setHours(4)
    nextday.setMinutes(0)
    nextday.setSeconds(0)
    return parseInt('' + (nextday.getTime() - today.getTime()) / 1000.0)
}

export const setCacheAge = (response: Response, duration: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR') => {
    const maxage = getMaxAgeFor(duration === 'YEAR' ? 365 : duration === 'MONTH' ? 30 : duration === 'WEEK' ? 7 : 1)
    response.set('Cache-Control', `public, max-age=${maxage}, s-maxage=${maxage}`)//CDN
}

export const setCacheAgeZero = (response: Response) => {
    response.set('Cache-Control', 'public, max-age=0, s-maxage=0')//No-CDN
}