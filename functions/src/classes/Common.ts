export const bool = (text: string | boolean): boolean => {
    return typeof (text) === "boolean" ? text : Boolean(text) && text.toUpperCase() !== 'FALSE' ? true : false
}