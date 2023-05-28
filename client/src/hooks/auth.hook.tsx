import {useState, useEffect, useCallback} from 'react'
import { IAuthHook, Token } from '../interfaces/auth.interface'

const tokenStorage = 'tokens'

export function useAuth(): IAuthHook {
    const [accessToken, setAccessToken] = useState<Token>(null)
    const [refreshToken, setRefreshToken] = useState<Token>(null)

    // function getSuccess(): Token {
    //     const JSONTokens = localStorage.getItem(tokenStorage)

    //     if (!JSONTokens) return null

    //     const tokens = JSON.parse(JSONTokens)

    //     return tokens.successToken
    // }
    const login = useCallback((accessToken: Token, refreshToken: Token): void => {
        setAccessToken(accessToken)
        setRefreshToken(refreshToken)
        
        const JSONTokens = JSON.stringify({accessToken, refreshToken})

        localStorage.setItem(tokenStorage, JSONTokens)
    }, [])

    const logout = useCallback((): void => {
        localStorage.removeItem(tokenStorage)

        setAccessToken(null)
        setRefreshToken(null)
    }, [])

    /*
        При обновлении страницы выставляем токены, если они сохранены в localStorage, 
        чтобы у пользователя был доступ к MainPage
    */

    useEffect(() => {
        const JSONTokens = localStorage.getItem(tokenStorage)

        if (!JSONTokens) return

        const tokens = JSON.parse(JSONTokens)
        const storageAccessToken: Token = tokens.accessToken
        const storageRefreshToken: Token = tokens.refreshToken

        //Для выдачи доступа нужен только sucessToken
        
        if (storageAccessToken) {
            login(storageAccessToken, storageRefreshToken)
        }
    }, [login])

    return {accessToken, refreshToken, login, logout}
}