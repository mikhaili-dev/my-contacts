import { BrowserRouter } from 'react-router-dom'
import { authContext } from './contexts/auth.context'
import { useAuth } from './hooks/auth.hook'
import { useRoutes } from './hooks/routes.hook'
import { useContacts } from './hooks/contacts.hook'
import { useNotification } from './hooks/notification.hook'
import { contactContext } from './contexts/contact.context'
import { notificationContext } from './contexts/notification.context'
import './styles/app.css'

export function App() {
  const authHook = useAuth()
  const contactHook = useContacts()
  const notificationHook = useNotification()

  const isAuth = !!authHook.accessToken

  //В зависимости от того, есть ли у пользователя токен, он либо сможет видеть MainPage, либо AuthPage
  
  const routes = useRoutes(isAuth)

  return ( 
    <authContext.Provider value={authHook}>
      <contactContext.Provider value={contactHook}>
        <notificationContext.Provider value={notificationHook}>
          <BrowserRouter>
            <div className='alerts-wrapper'>{notificationHook.alerts}</div>
            {routes}
          </BrowserRouter>
        </notificationContext.Provider>
      </contactContext.Provider>
    </authContext.Provider>
  )
}
