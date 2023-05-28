export type contacts = JSX.Element[] | null
export type filterMode = 'old' | 'new' | 'alphabet'

type setContactsFunc = (contacts: contacts) => contacts

export interface IContactContext {
    contacts: contacts
    setContacts: (contacts: contacts | setContactsFunc) => void
    sortContacts: (contact1: JSX.Element, contact2: JSX.Element) => number
    filterMode: filterMode
    setFilterMode: (filterMode: filterMode) => void
}
export interface IContactHook {
    contacts: contacts
    setContacts: (contacts: contacts | setContactsFunc) => void
    sortContacts: (contact1: JSX.Element, contact2: JSX.Element) => number
    filterMode: filterMode
    setFilterMode: (filterMode: filterMode) => void
}
export interface IRoughtField {
    web: string
    link: string
}
export interface IDetailedField extends IRoughtField {
    _id: string
}
export interface IRoughContact {
    name: string
    fields: IRoughtField[]
}
export interface IDetailedContact {
    _id: string
    name: string
    fields: IDetailedField[]
    date: Date
}