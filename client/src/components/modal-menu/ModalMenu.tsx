import { useCallback, useContext, useEffect, useRef, useState } from "react"
import { FieldModal } from "./FieldModal"
import { SaveDataBtn } from "./buttons/SaveDataBtn"
import { DeleteBtn } from "./buttons/DeleteBtn"
import { IDetailedField } from "../../interfaces/contact.interface"
import { LoadIcon } from "../LoadIcon"
import { Warnings } from "../Warnings"
import { notificationContext } from "../../contexts/notification.context"
import { getRandomKey } from "../../usefulFuncs"
import "../../styles/modal-menu/modal-menu.css"

type modalType = 'CHANGE' | 'ADD'               //Цель открытия модального окна: добавить новый контакт или изменить уже существующий 

interface ModalMenuProps {
    setIsModalOpen: (state: boolean) => void
    initialFilledFields?: IDetailedField[]      //Если контакт изменяется, то у него уже есть хотя бы одно поле (сочетание web/link)
    initialNameValue?: string                    //Если контакт изменяется, то у него есть имя
    dataKey?: string                            //Если контакт изменяется, у него есть уникальный ключ
}

export function ModalMenu({setIsModalOpen, initialNameValue, initialFilledFields, dataKey}: ModalMenuProps) {
    const [fields, setFields] = useState<JSX.Element[]>([])
    const [isRequestProcessing, setIsRequestProcessing] = useState<boolean>(false)
    const nameRef = useRef<HTMLInputElement>(null)
    const {formWarnings, removeWarnings} = useContext(notificationContext)

    const modalType: modalType = dataKey ? 'CHANGE' : 'ADD'
    
    let isItInitialFieldAddition = useRef<boolean>(true)                     //Для предотвращения двойного срабатывания useEffect()

    let isItInitialCHANGEAddition = useRef<boolean>(true)                    //Для корректной загрузке полей при режиме изменения

    const setFieldsHandler = useCallback(function (): void {
        setFields((prevFields: JSX.Element[]): JSX.Element[] => {
            const newFields: JSX.Element[] = []
            
            switch (modalType) {
                case 'ADD': 
                    newFields.push(getNewFiled())
                    break;
                case 'CHANGE':
                    if (!initialFilledFields) break
                    
                    /*
                        Если это изменение контакта, то сначало нужно заполнить поля модально окна уже имющимися сочетаниями web/link, 
                        а уже затем добавлять по одному полю, что применяется в FieldModal
                    */
                    if (isItInitialCHANGEAddition) {
                        initialFilledFields.forEach((field) => {
                            newFields.push(getNewFiled(field.web, field.link, field._id))
                        })
                        newFields.push(getNewFiled())

                        isItInitialCHANGEAddition.current = false
                    } else {
                        newFields.push(getNewFiled())
                    }
            }
            
            const updatedFieldsArr = [...prevFields, ...newFields]

            return updatedFieldsArr

            function getNewFiled(web = '', link = '', key: string = getRandomKey()): JSX.Element {

                return <FieldModal 
                            initialWeb={web} 
                            initialLink={link} 
                            addField={setFieldsHandler} 
                            dataKey={key}
                            key={key}
                        />
            }
        })
    }, [modalType, initialFilledFields])
    const setInitialField = useCallback(function () {
        if (!isItInitialFieldAddition.current) return               //Проверка, чтобы при загрузке страницы не было два поля из-за двойного срабатывания useEffect()

        isItInitialFieldAddition.current = false

        setFieldsHandler()
    }, [setFieldsHandler])

    useEffect(() => {
        if (initialNameValue) changeNameHandler()            //Если уже есть имя (т.е режим изменения), отодвигаем label, чтобы он не накладывался на текст
        setInitialField()
    }, [initialNameValue, setInitialField])

    function closeModalHandler(event: React.MouseEvent): void {
        const [x, y]: number[] = [event.clientX, event.clientY]

        const topmostElem: Element | null = document.elementFromPoint(x, y)
        const modalWindow: Element = document.querySelector('.modal-wrapper')!

        if (!topmostElem || topmostElem === modalWindow) {
            setIsModalOpen(false)
            removeWarnings()
        }
    }
    function changeNameHandler(): void {
        const name: string | null = nameRef.current!.value

        const label = document.querySelector('#name ~ label')!

        if (name) {
            label.classList.add('not-empty')
        } else {
            label.classList.remove('not-empty')
        }
    }
    return (
        <div 
            className="modal-wrapper"
            onMouseDown={closeModalHandler}>
            <div className="modal-menu">
                <div className="name-input">
                    <div>
                        <input
                            type="text" 
                            id="name"
                            onChange={changeNameHandler}
                            ref={nameRef}
                            defaultValue={initialNameValue}>
                        </input>   
                        <label htmlFor="name">Имя</label>
                    </div>
                </div>
                <div className="fields-headers">
                    <span>Сеть</span>
                    <span>Ссылка</span>
                </div>
                <div className="modal-fields-wrapper">
                    {fields}
                </div>
                {(formWarnings) ? <Warnings warnings={formWarnings}/> : null}
                {isRequestProcessing ? <LoadIcon/> : null}
                <div className="handle-contact-btns">
                    {modalType === 'CHANGE' ? 
                        <DeleteBtn 
                            dataKey={dataKey} 
                            setIsModalOpen={setIsModalOpen} 
                            isRequestProcessing={isRequestProcessing} 
                            setIsRequestProcessing={setIsRequestProcessing}
                        /> : null}
                    <SaveDataBtn 
                        dataKey={dataKey} 
                        setIsModalOpen={setIsModalOpen} 
                        isRequestProcessing={isRequestProcessing} 
                        setIsRequestProcessing={setIsRequestProcessing}/>
                </div>
            </div>
        </div>
    )
}