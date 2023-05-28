import { useContext } from 'react'
import { authContext } from '../../../contexts/auth.context'
import { useHttp } from '../../../hooks/http.hook'
import { AuthError } from '../../../errors/AuthError'
import { isArrayEmpty } from '../../../usefulFuncs'
import { contactContext } from '../../../contexts/contact.context'
import { notificationContext } from '../../../contexts/notification.context'
import { ServerError } from '../../../errors/ServerError'
import { InvalidRequestError } from '../../../errors/InvalidRequestError'
import '../../../styles/modal-menu/buttons/delete-btn.css'

interface DeleteBtnProps {
    dataKey?: string
    isRequestProcessing: boolean
    setIsRequestProcessing: (state: boolean) => void
    setIsModalOpen: (state: boolean) => void
}

interface IServerData {
    message: string
    tokens?: {
        accessToken: string
        refreshToken: string
    }
}
type serverResponse = IServerData | AuthError | InvalidRequestError | ServerError

export function DeleteBtn({dataKey, setIsModalOpen, isRequestProcessing, setIsRequestProcessing}: DeleteBtnProps) {
    const {request} = useHttp()
    const {accessToken, login, logout} = useContext(authContext)
    const {setContacts} = useContext(contactContext)
    const {handleNewAlert, pushWarning} = useContext(notificationContext)

    async function deleteBtnHandler(): Promise<void> {
        if (!dataKey) return

        try {
            setIsRequestProcessing(true)

            const response = await request(
                {
                    url: 'api/contact/delete', 
                    method: 'DELETE', 
                    body: {key: dataKey}, 
                    headers: {Authorization: `Bearer ${accessToken}`}
                }) as serverResponse

            if (response instanceof Error) throw response
    
            //Сервер вернёт новые токены в случае, если accessToken устарел, а refreshToken - не устарел. Тогда Оба будут обновлены

            if (response.tokens) login(response.tokens.accessToken, response.tokens.refreshToken)
            
            setIsRequestProcessing(false)

            deleteContact()

            handleNewAlert('Контакт удалён', 'SUCCESS')

            setIsModalOpen(false)   
        } catch (error) {
            setIsRequestProcessing(false)
            
            if (error instanceof AuthError) {
                handleNewAlert('Войдите в систему', 'ERROR')
                logout()
            } else if (error instanceof InvalidRequestError) {
                error.warnings ? pushWarning(error.warnings) : handleNewAlert(error.message, 'ERROR')
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
    function deleteContact(): void {
        setContacts(contacts => {
            if (!contacts || isArrayEmpty(contacts)) return null

            let indexOfContactToDelete: number | null = null

            //Перебираем имеющиеся контакты и находим тотм, ключ которого совпадает с удаляемым (dataKey)
            contacts.forEach((contact, index) => {
                if (contact.key === dataKey) indexOfContactToDelete = index
            })
            
            //Если ключ не нашёлся - ничего не делать

            if (!indexOfContactToDelete && indexOfContactToDelete !== 0 ) return contacts

            const updContacts = [...contacts]

            //Если же ключ есть, то изменяем массив, вырезав оттуда этот контакт
            
            updContacts.splice(indexOfContactToDelete, 1)

            //Если контактов не останется, вместо пустого массив возвращаем null, чтобы корректно работал плашка "Контактов пока нету" на Mainpage
             
            if (isArrayEmpty(updContacts)) return null

            return updContacts
        })
    }
    return (
        <button
            onClick={deleteBtnHandler}
            className="delete-contact-btn"
            disabled={isRequestProcessing}>
                Удалить
        </button>
    )
}