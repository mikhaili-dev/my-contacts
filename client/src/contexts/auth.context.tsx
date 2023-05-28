import { createContext } from "react";
import { IAuthContext, Token } from "../interfaces/auth.interface";

const authContext = createContext<IAuthContext>({
    accessToken: null,
    refreshToken: null,
    login: (accessToken: Token, refreshToken: Token) => {},
    logout: () => {},
})
export {authContext}