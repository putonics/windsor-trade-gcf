export const onlyDate = (date?: Date | string | number): Date => {
    const x = date ? new Date(date) : new Date()
    x.setHours(0)
    x.setMinutes(0)
    x.setSeconds(0)
    x.setMilliseconds(0)
    return x
}