import { useContext } from "react"
import { useHttp } from "../../../hooks/http.hook"
import { IDetailedContact, IRoughContact } from "../../../interfaces/contact.interface"
import { Contact } from "../../Contact"
import { AuthError } from "../../../errors/AuthError"
import { authContext } from "../../../contexts/auth.context"
import { isArrayEmpty } from "../../../usefulFuncs"
import { InvalidRequestError } from "../../../errors/InvalidRequestError"
import { contactContext } from "../../../contexts/contact.context"
import { notificationContext } from "../../../contexts/notification.context"
import { ServerError } from "../../../errors/ServerError"
import "../../../styles/modal-menu/buttons/save-data-btn.css"

type modalType = 'CHANGE' | 'ADD'

interface SaveDataBtnProps {
    dataKey?: string                                        //Если поле изменяется, а не создаётся новое, то у него есть уже есть уникальный идентификатор
    setIsModalOpen: (state: boolean) => void
    isRequestProcessing: boolean
    setIsRequestProcessing: (state: boolean) => void
}
interface IServerData {
    message: string
    contact: IDetailedContact
    tokens?: {
        accessToken: string
        refreshToken: string
    }
}
type serverResponse = IServerData | AuthError | InvalidRequestError | ServerError | Error

export function SaveDataBtn({dataKey, setIsModalOpen, isRequestProcessing, setIsRequestProcessing}: SaveDataBtnProps) {
    const modalType: modalType = dataKey ? 'CHANGE' : 'ADD'
    const btnText: string = modalType === 'ADD' ? "Сохранить" : "Изменить"

    const {request} = useHttp()
    const {accessToken, refreshToken, login, logout} = useContext(authContext)
    const {setContacts, sortContacts} = useContext(contactContext)
    const {handleNewAlert, pushWarning, removeWarnings} = useContext(notificationContext)

    async function sendData(): Promise<void> {
        removeWarnings()                                //Чтобы не множить одни и те же ошибки, если кнопка нажата не первый раз

        const contactData: IRoughContact = getData()    //Получаем информацию о контакте для сохранения на сервере

        let isItWarning: boolean = false
        
        /*
            Отправка будет отменена, если 
                не будет введено имя или
                не будет введено ни одного сочетания web/link
            В случае таких ошибок, они будут выведены в красном окне
        */
        if (!contactData.name) {
            pushWarning('Не введено имя')
            isItWarning = true
        }
        if (isArrayEmpty(contactData.fields)) {
            pushWarning('Не введено ни одного сочетания <сеть/ссылка>')
            isItWarning = true
        }

        if (isItWarning) return

        try {
            setIsRequestProcessing(true)

            if (modalType === 'ADD') {
                const response = await request({
                    url: 'api/contact/save', 
                    body: contactData, 
                    method: "POST", 
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        refreshToken: `Bearer ${refreshToken}`
                    }
                }) as serverResponse

                setIsRequestProcessing(false)

                if (response instanceof Error) throw response

                //Сервер вернёт новые токены в случае, если accessToken устарел, а refreshToken - не устарел. Тогда Оба будут обновлены

                if (response.tokens) login(response.tokens.accessToken, response.tokens.refreshToken)

                addContact(response.contact)

                handleNewAlert(response.message, 'SUCCESS')
            } else if (modalType === 'CHANGE') {
                const response = await request({
                    url: 'api/contact/change', 
                    body: {...contactData, key: dataKey}, 
                    method: "POST", 
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        refreshToken: `Bearer ${refreshToken}`
                    }
                }) as serverResponse

                setIsRequestProcessing(false)

                if (response instanceof Error) throw response

                if (response.tokens) login(response.tokens.accessToken, response.tokens.refreshToken)

                changeContact(response.contact)
                
                handleNewAlert(response.message, 'SUCCESS')
            }
            //При обновлении или добавлении контакта, нужно отсортировать массив контактов на случай, если новый или изменённый контакт нарушит порядок сортировки
            
            sortContactsHandler()

            setIsModalOpen(false)
        } catch (error) {
            setIsRequestProcessing(false)
            
            if (error instanceof AuthError) {
                //Если вернётся такая ошибка, значит что-то не так с токеном - в таком случае выходим из системы

                handleNewAlert('Войдите в систему', 'ERROR')
                
                logout()
            } else if (error instanceof InvalidRequestError) {
                /* 
                    Если форма была заполнена неверно, то:
                        1. Если с сервера пришёл массив warnings - значит, его элементы (сообщения об ошибках) нужно отобразить в окошке с ошибками.
                        2. Иначе, показать справа сверху, в чём причина ошибки
                */
               error.warnings ? pushWarning(error.warnings) : handleNewAlert(error.message, 'ERROR')
               //Останавливаем выполнение, чтобы не сработал setIsModalOpen(false)
               return  

            } else if (error instanceof ServerError) {
                handleNewAlert('Не удалось загрузить данные. Ошибка сервера. Попробуйте позже', 'ERROR')
            } else {
                handleNewAlert('Что-то пошло не так. Попробуйте снова', 'ERROR')
            }
            setIsModalOpen(false)
            console.error(error)
        }
    }
    function sortContactsHandler(): void {
        setContacts(contacts => {
            if (!contacts || isArrayEmpty(contacts)) return null
            const sortedArr = [...contacts.sort(sortContacts)]

            return sortedArr
        })
    }
    function getData(): IRoughContact {
        /*
            Формируем информацию для запроса:
                1. Получае имя
                2. Берём все заполненные сочетания web/link - незаполненные отсеиваются и сохранены не будут    
        */
        const name: string | null = document.querySelector<HTMLInputElement>('#name')!.value.trim()
        const fieldsWrappers: NodeListOf<Element> = document.querySelectorAll('.modal-field-wrapper')
        const fields: Array<{web: string, link: string}> = []

        for (let i = 0; i < fieldsWrappers.length; i++) {
            const web = fieldsWrappers[i].querySelector<HTMLInputElement>('#web')!.value.trim()
            const link = fieldsWrappers[i].querySelector<HTMLInputElement>('#link')!.value.trim()

            if (!web || !link) continue

            fields.push({web, link})
        }
        return {
            name: name,
            fields: fields
        }
    }
    function addContact(newContact: IDetailedContact): void {
        //Для возможности сортировать контакты по новизне, на сервере сохраняем время создания контакта и отправляем информацию сюда

        const timestamp = new Date(newContact.date).getTime()

        const newReactContact = <Contact 
            dataKey={newContact._id} 
            key={newContact._id} 
            name={newContact.name} 
            fields={newContact.fields} 
            date={timestamp}
        />
        setContacts((prevContacts) => {
            if (prevContacts) {
                return [newReactContact, ...prevContacts]
            } else {
                return [newReactContact]
            }
        })
    }
    function changeContact(newContact: IDetailedContact) {
        setContacts(contacts => {
            if (!contacts) return null          //Если контактов нету, то и изменть нечего -- оставляем значение null

            const updContacts = contacts.map(contact => {
                const key = contact.key

                    //Перебираем имеющиеся контакты и находим тот, ключ которого совпадает с изменяемым, и заменям его новым
                    if (newContact._id === key) {
                        const timestamp = new Date(newContact.date).getTime()
                        const newReactContact = <Contact 
                            dataKey={newContact._id} 
                            key={newContact._id} 
                            name={newContact.name} 
                            fields={newContact.fields} 
                            date={timestamp}
                        />
                        return newReactContact
                    }
                    return contact
            })
            return updContacts
        })
    }
    return (
        <button 
            className="save-data-btn"
            onClick={sendData}
            disabled={isRequestProcessing}>
            {btnText}
        </button>
    )
}