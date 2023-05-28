import {useContext, useRef, useState} from "react"
import { useHttp } from "../hooks/http.hook"
import { authContext } from "../contexts/auth.context"
import { Token } from "../interfaces/auth.interface"
import { InvalidRequestError } from "../errors/InvalidRequestError"
import { ServerError } from "../errors/ServerError"
import { Warnings } from "../components/Warnings"
import { LoadIcon } from "../components/LoadIcon"
import { notificationContext } from "../contexts/notification.context"
import '../styles/pages/auth-page.css'
import '../styles/pages/authNNotfound-pages.css'

type Email = string | undefined
type Password = string | undefined

interface ISuccessLoginResponse {
    message: string
    tokens: {
        accessToken: string
        refreshToken: string
    }
}
type LoginResponse = ISuccessLoginResponse | InvalidRequestError | ServerError | Error

export function AuthPage() {
    const emailRef = useRef<HTMLInputElement>(null)
    const passwordRef = useRef<HTMLInputElement>(null)
    const {request} = useHttp()
    const {handleNewAlert, formWarnings, removeWarnings, pushWarning} = useContext(notificationContext)
    const auth = useContext(authContext)
    const [isRequestProcessing, setIsRequestProcessing] = useState<boolean>(false)

    async function registerHandler(event: React.MouseEvent): Promise<undefined> {
        event.preventDefault()

        removeWarnings()        //Если с предыдущей попытки войти/зарегистрироваться были ошибки, их необходимо убрать, чтобы можно было обрабоать новый запрос

        const email: Email = emailRef.current!.value.trim()
        const password: Password = passwordRef.current!.value.trim()

        if (isThereInputWarnings(email, password)) {
            showWarnings(email, password)
            return
        }
        try {
            setIsRequestProcessing(true)

            await request({url: 'api/auth/register', method: 'POST', body: {email, password}})

            handleNewAlert('Пользователь создан', 'SUCCESS')

            loginHandler(null)                                                          //Если регистрация успешна, автоматически входим под этим аккаунтом
        } catch (error) {
            errorHandler(error)
        }
    }
    async function loginHandler(event: React.MouseEvent | null): Promise<void | undefined> {
        if (event) event.preventDefault()                                               //event = null при запуске функции в registerHandler

        removeWarnings()

        const email: Email = emailRef.current!.value
        const password: Password = passwordRef.current!.value

        if (isThereInputWarnings(email, password)) {
            showWarnings(email, password)
            return
        }
        try {
            setIsRequestProcessing(true)

            const data = await request({url: 'api/auth/login', method: 'POST', body: {email, password}}) as LoginResponse

            if (data instanceof Error) throw data

            const accessToken: Token = data.tokens.accessToken
            const refreshToken: Token = data.tokens.refreshToken

            /* 
                accessToken для авторизации - работает 1 час
                refreshToken для обновления accessToken - работает полгода
            */
                
            auth.login(accessToken, refreshToken)

            handleNewAlert('Вход успешен', 'SUCCESS')

            setIsRequestProcessing(false)

        } catch (error) {
            errorHandler(error)
        }
    }
    function errorHandler(error: unknown): void {
        if (error instanceof InvalidRequestError) {
            /* 
                Если форма была заполнена неверно, то:
                    1. Если с сервера пришёл массив warnings - значит, его элементы (сообщения об ошибках) нужно отобразить в окошке с ошибками.
                    2. Иначе, показать справа сверху, в чём причина ошибки
            */
            error.warnings ? pushWarning(error.warnings) : handleNewAlert(error.message, 'ERROR')

        } else if (error instanceof ServerError) {
            handleNewAlert('Не удалось загрузить данные. Ошибка сервера. Попробуйте позже', 'ERROR')
        } else {
            
            //Стандартный ответ, если непонятно, в чём причина ошибки

            handleNewAlert('Что-то пошло не так. Попробуйте снова', 'ERROR')
        }
        setIsRequestProcessing(false)
    }
    function isThereInputWarnings(email: Email, password: Password): boolean {
        let isItWarning: boolean = false

        if (!email) {
            isItWarning = true
        } else {
            const emailRegExp = /^[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}$/i
            
            if (!emailRegExp.test(email)) isItWarning = true
        }
        if (!password) {
            isItWarning = true
        } else {
            if (password.length < 6) isItWarning = true
        }
        return isItWarning 
    }
    function showWarnings(email: Email, password: Password): void {
        if (!email) {
            pushWarning('Не введена почта')
        } else {
            const emailRegExp = /^[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}$/i
            
            if (!emailRegExp.test(email)) pushWarning('Почта введена в некорректном формате')
        }
        if (!password) {
            pushWarning('Не введён пароль')
        } else {
            if (password.length < 6) pushWarning('Введён слишком короткий пароль. Минимум символов: 6')
        }
    }
    
    return (
        <div className="auth-wrapper">
            <div className="auth-content-wrapper">
                <h1>myContacts</h1>
                <h2>Авторизация</h2>
                <div>
                    <svg className="logo" xmlnsXlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" width="300px" height="300px" viewBox="0 0 300 300" version="1.1">
                        <defs>
                            <path d="M0 150C0 67.1573 67.1573 0 150 0C232.843 0 300 67.1573 300 150C300 232.843 232.843 300 150 300C67.1573 300 0 232.843 0 150Z" id="path_1"/>
                            <clipPath id="oval_1">
                                <use xlinkHref="#path_1"/>
                            </clipPath>
                        </defs>
                        <g id="oval-2-+-oval-3-mask">
                            <path d="M0 150C0 67.1573 67.1573 0 150 0C232.843 0 300 67.1573 300 150C300 232.843 232.843 300 150 300C67.1573 300 0 232.843 0 150Z" id="oval-1" fillRule="evenodd" stroke="none"/>
                            <g clipPath="url(#oval_1)">
                                <path d="M102 114C102 87.4903 123.49 66 150 66C176.51 66 198 87.4903 198 114C198 140.51 176.51 162 150 162C123.49 162 102 140.51 102 114Z" id="oval-2" fillRule="evenodd" stroke="none"/>
                                <path d="M54 276C54 222.981 96.9807 180 150 180C203.019 180 246 222.981 246 276C246 329.019 203.019 372 150 372C96.9807 372 54 329.019 54 276Z" id="oval-3" fillRule="evenodd" stroke="none"/>
                            </g>
                        </g>
                    </svg>
                    <div className="form-wrapper">
                        {isRequestProcessing ? <LoadIcon/> : null}
                        <form>
                            <div>
                                <label htmlFor="email">Почта</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    placeholder="Введите почту"
                                    ref={emailRef}
                                    required
                                    spellCheck="false"
                                />
                            </div>
                            <div>
                                <label htmlFor="password">Пароль</label>
                                <input 
                                    type="password" 
                                    id="password" 
                                    placeholder="Введите пароль"
                                    ref={passwordRef}
                                    required
                                    minLength={6}
                                />
                            </div>
                            {formWarnings ? <Warnings warnings={formWarnings}/> : null}
                            <div className="auth-btn-container">
                                <button
                                    className="login-btn"
                                    onClick={loginHandler}
                                    disabled={isRequestProcessing}
                                    >Вход
                                </button>
                                <button
                                    className="register-btn"
                                    onClick={registerHandler}
                                    disabled={isRequestProcessing}
                                    >Регистрация
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}