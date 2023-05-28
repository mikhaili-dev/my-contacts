export type Token = string | null

export interface IAuthContext {
    accessToken: Token
    refreshToken: Token
    login: (accessToken: Token, refreshToken: Token) => void
    logout: () => void
}
export interface IAuthHook {
    accessToken: Token
    refreshToken: Token
    login: (accessToken: Token, refreshToken: Token) => void
    logout: () => void
}
