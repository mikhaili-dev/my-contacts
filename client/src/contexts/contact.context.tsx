import { createContext } from "react";
import { IContactContext } from "../interfaces/contact.interface";

const contactContext = createContext<IContactContext>({
    contacts: null,
    setContacts: () => {},
    sortContacts: () => 0,
    filterMode: 'new',
    setFilterMode: () => {}
})

export {contactContext}