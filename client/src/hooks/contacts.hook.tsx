import { useCallback, useState } from "react"
import { IContactHook, contacts, filterMode } from "../interfaces/contact.interface"

export function useContacts(): IContactHook {
    const [contacts, setContacts] = useState<contacts>(null)

    const [filterMode, setFilterMode] = useState<filterMode>('new')


    /*
        Ниже - функция, используемая в .sort() для сортировки контактов с учётом выставленного режима.
        Используется при изменении режима фильтрации или добавлении/изменении контакта
    */
   
    const sortContacts = useCallback(function (contact1: JSX.Element, contact2: JSX.Element): number {
        switch (filterMode) {
            case 'alphabet':
                return sortByAlphabet(contact1, contact2)
            case 'new':
                return sortByRecency(contact1, contact2)
            case 'old':
                return sortByRecencyReverse(contact1, contact2)
        }
    }, [filterMode])
    function sortByAlphabet(contact1: JSX.Element, contact2: JSX.Element): number {
        const name1: string = contact1.props.name
        const name2: string = contact2.props.name

        if (name1 > name2) {
            return 1
        } else if (name1 < name2) {
            return -1
        } else {
            return 0
        }
    }
    function sortByRecency(contact1: JSX.Element, contact2: JSX.Element): number {
        const number1: number = contact1.props.date
        const number2: number = contact2.props.date

        return number2 - number1
    }
    function sortByRecencyReverse(contact1: JSX.Element, contact2: JSX.Element): number {
        const number1: number = contact1.props.date
        const number2: number = contact2.props.date
        
        return number1 - number2

    }
    return {contacts, setContacts, sortContacts, filterMode, setFilterMode}
}