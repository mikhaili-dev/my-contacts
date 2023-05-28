import { Navigate, Route, Routes } from "react-router-dom"
import { AuthPage } from "../pages/AuthPage"
import { MainPage } from "../pages/MainPage"
import { NotFoundPage } from "../pages/NotFoundPage"

export const useRoutes = (isAuth: boolean) => {
    /* 
        На сайте доступны три страницы, к двум из которых доступ определён отсуствием или присутствием accessToken.
        Если токена нету, доступна:
            1. AuthPage, находящееся на пути '/auth', куда пользователь в любом случае будет перенаправлен
        Если токен есть, доступны:
            1. MainPage, находящееся на пути '/'
            2. NotFoundPage, куда пользователь попадает при заходе на остальные пути 
        (за исключением пути '/auth', при заходе на который пользователь перенаправляется на '/')
    */

    return (
        <Routes>
            <Route 
                path="/" 
                element={isAuth ? <MainPage/> : <Navigate to='/auth'/>}
            />
            <Route
                path='/auth'
                element={isAuth ? <Navigate to='/'/> : <AuthPage/>}
            />
            <Route
                path="*"
                element={isAuth ? <NotFoundPage/> : <Navigate to='/auth'/>}
            />
        </Routes>
    )
}