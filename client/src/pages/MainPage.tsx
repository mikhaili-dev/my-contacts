import { useState, useContext, useEffect } from "react"
import { ModalMenu } from "../components/modal-menu/ModalMenu"
import { Navbar } from "../components/Navbar"
import { IDetailedContact, filterMode } from "../interfaces/contact.interface"
import { authContext } from "../contexts/auth.context"
import { useHttp } from "../hooks/http.hook"
import { Contact } from "../components/Contact"
import { AuthError } from "../errors/AuthError"
import { isArrayEmpty } from "../usefulFuncs"
import { contactContext } from "../contexts/contact.context"
import { LoadIcon } from "../components/LoadIcon"
import { ServerError } from "../errors/ServerError"
import { notificationContext } from "../contexts/notification.context"
import "../styles/pages/main-page.css"

type Tokens = {
    accessToken: string
    refreshToken: string
}
interface ISuccessServerResponse {
    message: string
    tokens?: Tokens
    contacts: IDetailedContact[]
}
type serverResponse = ISuccessServerResponse | Error | AuthError | ServerError

export function MainPage() {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [isRequestProcessing, setIsRequestProcessing] = useState<boolean>(false)
    const {request} = useHttp()
    const {accessToken, refreshToken, logout, login} = useContext(authContext)
    const {contacts, setContacts, filterMode, setFilterMode, sortContacts} = useContext(contactContext)
    const {handleNewAlert} = useContext(notificationContext)
    
    useEffect(() => {
        showContacts()
        
        async function showContacts(): Promise<void> {
            setIsRequestProcessing(true)
            
            const body = await fetchContacts()

            if (!body) return

            if (body instanceof Error) throw body

            /*
                Сервер вернёт новые токены в случае, если accessToken устарел, 
                а refreshToken - не устарел. Тогда оба будут обновлены 
            */

            if (body.tokens) setTokens(body.tokens)

            setIsRequestProcessing(false)

            const serverContacts: IDetailedContact[] = body.contacts

            if (isArrayEmpty(serverContacts)) return             //Если контактов сохранено не было - вернётся пустой массив, значит, сортировать и выставлять нечего

            doInitialSorting(serverContacts)                     //по умолчанию сортируем от новейшего

            setContactsHandler(serverContacts)  
        }
        async function fetchContacts(): Promise<serverResponse | undefined> {
            try {
                const body = await request({
                    url: "api/contact/get", 
                    method: 'GET', 
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        refreshToken: `Bearer ${refreshToken}` 
                    }
                }) as serverResponse
        
                return body
            } catch (error) {
                setIsRequestProcessing(false)
    
                //Если что-то не так с accessToken, будет ошибка авторизации -- в этом случае выходим из системы
    
                if (error instanceof AuthError) {
                    logout()
                    handleNewAlert('Войдите в систему', 'WARNING')
                } else if (error instanceof ServerError) {
                    handleNewAlert('Не удалось загрузить данные. Ошибка сервера. Попробуйте позже', 'ERROR')
                } else {
                    handleNewAlert('Не удалось загрузить данные. Попробуйте позже', 'ERROR')
                    throw error
                }
            }
        }
        function setTokens(tokens: Tokens): void {
            login(tokens.accessToken, tokens.refreshToken)
        }
        function doInitialSorting(serverContacts: IDetailedContact[]): void {
            serverContacts.reverse()
        }
        function setContactsHandler(serverContacts: IDetailedContact[]): void {
            setContacts(serverContacts.map((contact): JSX.Element => {
                            const timestamp = new Date(contact.date).getTime()
                            
                            return <Contact 
                                        name={contact.name} 
                                        fields={contact.fields} 
                                        key={contact._id.toString()}
                                        dataKey={contact._id.toString()}
                                        date={timestamp}
                                        />
                                    })
                        )
        }
    }, [handleNewAlert, login, logout, accessToken, refreshToken, request, setContacts])

    useEffect(() => {
        sortContactsHandler()
        
        function sortContactsHandler(): void {
            setContacts(contacts => {
                if (!contacts || isArrayEmpty(contacts)) return null    //Если контакты отсутствуют - отменяем сортировку
                const sortedArr = [...contacts.sort(sortContacts)]
                
                return sortedArr
            })
        }
    }, [filterMode, setContacts, sortContacts])


    function changeFilterHandler(event: React.ChangeEvent<HTMLSelectElement>) {
        const newMode = event.target.value as filterMode

        setFilterMode(newMode)
    }

    return (
        <>
            <Navbar/>
            <div className="main-content-wrapper">
                <div className="new-contact-btn-wrapper">
                    <button 
                        className='new-contact-btn'
                        onClick={() => setIsModalOpen(true)}>
                        Новый контакт
                    </button>
                </div>
                <div className="contacts-wrapper">
                    <div className='contacts-filter-wrapper'>
                        <select 
                            className='contacts-filter'
                            onChange={changeFilterHandler}
                            defaultValue={filterMode}>
                            <option value="new">Новые</option>
                            <option value="old">Старые</option>
                            <option value="alphabet">По алфавиту</option>
                        </select>
                    </div>
                    {isRequestProcessing ? <LoadIcon/> : null}
                    {!isRequestProcessing && !contacts ? <p className="no-contact-plag">Контактов пока нету</p> : null}
                    <ul className='contacts-list'>
                        {contacts}
                    </ul>
                </div>
                    {isModalOpen ? <ModalMenu setIsModalOpen={setIsModalOpen}/> : null}
            </div>
        </>
    )
}