import { useState } from "react"
import { IDetailedField } from "../interfaces/contact.interface"
import { Field } from "./Field"
import { ModalMenu } from "./modal-menu/ModalMenu"
import '../styles/contact.css'

interface ContactProps {
    name: string
    fields: IDetailedField[]
    dataKey: string
    date: number
}

export function Contact({name, fields, dataKey}: ContactProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    function toggleContactInfoBtn(event: React.MouseEvent<HTMLSpanElement, MouseEvent>): void {
        const btn = event.currentTarget
        const contact = btn.closest('li')

        btn!.classList.toggle('active')
        contact!.classList.toggle('active')
    }
    function toggleModal() {
        setIsModalOpen(prevState => !prevState)
    }
    return (
        <>
            <li className='contact'>
                <div className="contact-initial-info-container">
                    <span>{name}</span>
                    <span className="show-info-btn" onClick={toggleContactInfoBtn}>
                        <svg xmlnsXlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" width="31px" height="16px" viewBox="0 0 31 16" version="1.1">
                            <path d="M15.5 0.5L0.5 15.5" id="Линия" fill="none" fillRule="evenodd" stroke="#fff" strokeWidth="1" strokeLinecap="square"/>
                            <path d="M15.5 0.5L30.5 15.5" id="Линия-2" fill="none" fillRule="evenodd" stroke="#fff" strokeWidth="1" strokeLinecap="square"/>
                        </svg>
                    </span>
                </div>
                <div className="contact-info-container">
                    <ul className="fields-list">
                        {fields.map((field) => 
                            <Field 
                                web={field.web} 
                                link={field.link} 
                                key={field._id.toString()}
                            />
                        )}
                    </ul>
                    <button 
                        className="change-contact-btn"
                        onClick={toggleModal}>изменить
                    </button>
                </div>
            </li>
            {isModalOpen ? <ModalMenu setIsModalOpen={setIsModalOpen} initialNameValue={name} initialFilledFields={fields} dataKey={dataKey}/> : null}
        </>
    )
}