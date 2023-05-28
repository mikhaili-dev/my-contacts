import { useCallback, useState } from "react"
import { INotificationHook, alertType, alerts, formWarnings } from "../interfaces/notification.interface"
import { Alert } from "../components/Alert"
import { getRandomKey } from "../usefulFuncs"

export function useNotification(): INotificationHook {
    const [formWarnings, setFormWarnings] = useState<formWarnings>(null)

    const removeWarnings = (): void => setFormWarnings(null)

    /*
            pushWarning в виде параметра ожидает как одну ошибку, так и их массив.
        Обычно ошибки добавляются по очереди (например, в AuthPage, в функции showWarnings)
            Но иногда они добавляются сразу массивом - в случае с объектом warnings, 
        присутвующем в ответе сервера при неверном заполнении форм 
        (как форм при создании/изменении контакта, так и при логине/регистрации)
    */
   
    function pushWarning(newWarn: string | string[]) {
        setFormWarnings(prevWarnings => {
            if (prevWarnings) {
                if (typeof newWarn === 'string') {
                    return [...prevWarnings, newWarn]
                } else {
                    return [...prevWarnings, ...newWarn]
                }
            }
            if (typeof newWarn === 'string') {
                return [newWarn]
            } else {
                return [...newWarn]
            }
        })
    }
    const [alerts, setAlerts] = useState<alerts>(null)
    /*
        При показе уведомления справа сверху исползуется handleNewAlert.
        Второй параметр ожидает тип сообщения, 
        исходя из которого будет определён цвет фона сообщения
    */
    const handleNewAlert = useCallback((message: string, type: alertType): void => {
        const color: string | null = type === 'ERROR' ? '#ffaba5' : type === 'WARNING' ? '#fffaa3' : type === 'SUCCESS' ? '#8bd18b' : 'INFO' ? '#b7b7b7' : null

        if (!color) return

        const key = getRandomKey()

        const newAlert: JSX.Element = <Alert message={message} color={color} key={key} dataKey={key}/>

        setAlerts(prevAlerts => {
            if (!prevAlerts) return [newAlert]

            return [newAlert, ...prevAlerts]
        })
    }, [])
    return {
        formWarnings, pushWarning, removeWarnings,
        alerts, handleNewAlert, setAlerts
    }
}