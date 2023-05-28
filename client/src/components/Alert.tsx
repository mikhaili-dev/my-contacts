import {useState, useEffect, useContext, useRef, useCallback} from 'react'
import { notificationContext } from '../contexts/notification.context'
import '../styles/alert.css'

interface AlertProps{
    message: string
    color: string
    dataKey: string
}
interface ITimeouts {
    hideId: ReturnType<typeof setTimeout> | null
    removeId: ReturnType<typeof setTimeout> | null
}

/*
    Разные доп. классы соответствуют разным состояниям элемента:
        '' - доп. класс по умолчанию. Установлен в самом начале, когда алерт есть, но находится за пределами экрана
        active - элемент плавно появляется и находится на экране
        active hide - элемент на экране, но начинает исчезать
 */
type additinalClasses = '' | 'active' | 'hide' | 'active hide'

export function Alert({message, color, dataKey}: AlertProps) {
    const [additionalClasses, setAdditionalClasses] = useState<additinalClasses>('')
    const {alerts, setAlerts} = useContext(notificationContext)
    const timeToHide = 4000                                     //Время (в м.с), через которое начнёт исчезать алерт
    const timeToRemove = 6000                                   //Время, через которое он будет удалён (расчитыватся как timeToHide + время анимации .hide в Alert.css)
    /*
        Храним тут timerIds, чтобы была возможность их отменить из любой функции
        Отменяется при наведении и заново активируется при уходе курсора с алерта    
    */
    const [timeouts, setTimeouts] = useState<ITimeouts>({
        hideId: null,
        removeId: null
    })
    let isItInitial = useRef<boolean>(true)

    const startTimeouts = useCallback(function(): void {
        hideAlert()                                                     //Запуск таймера, по истечению которого алерт начнёт пропадать с экрана
        removeAlert()                                                   //Запуск таймера, по истечению которого алерт будет удалён

        function removeAlert(): void {
            if (!alerts) return
            
            let currentAlert: JSX.Element | null = null
            
            // Находим в нужный элемент в React.FC
            
            alerts.forEach(alert => {
                if (dataKey === alert.key) {
                    currentAlert = alert
                }
            })
            if (!currentAlert) return
            
            const removeTimeout = setTimeout(() => {
                setAlerts(alerts => {
                    if (!alerts) return null
    
                    let indexOfAlertToDelete: number | null = null
    
                    alerts.forEach((alert, index) => {
                        if (currentAlert === alert) indexOfAlertToDelete = index
                    })
                    const updAlerts = [...alerts]
    
                    if (!indexOfAlertToDelete && indexOfAlertToDelete !== 0) return alerts
    
                    updAlerts.splice(indexOfAlertToDelete, 1)
    
                    return [...updAlerts]
                })
            }, timeToRemove)
    
            setTimeouts(prevTimeouts => {
                return {
                    hideId: prevTimeouts.hideId,
                    removeId: removeTimeout
                }
            })
        }
    }, [alerts, setAlerts, dataKey])

    useEffect(() => {
        if (isItInitial.current) {
            isItInitial.current = false                                 //Чтобы не было назначено лишних интервалов при загрузке
            
            startAnimation()

            startTimeouts()
        }
    }, [startTimeouts])
    function startAnimation() {
        setTimeout(() => setAdditionalClasses('active'), 200)
    }
    function removeTimeouts(): void {
        /*
            Обновляем класс на случай, если перед наведение успел сработать hideAlert, 
            который устаовил класс hide, из-за чего появился эффект исчезновения
        */

        setAdditionalClasses('active')

        //Если какие-то таймеры успели начаться - отменяем их

        if (timeouts.hideId) clearTimeout(timeouts.hideId)
        if (timeouts.removeId) clearTimeout(timeouts.removeId)

        setTimeouts({hideId: null, removeId: null})
    }
    function hideAlert() {
        const hideTimeout = setTimeout(() => {
            setAdditionalClasses('active hide')
        }, timeToHide)

        setTimeouts(prevTimeouts => {
            return {
                hideId: hideTimeout,
                removeId: prevTimeouts.removeId
            }
        })
    }
    return (
        <div 
            className={'alert ' + additionalClasses}
            style={{backgroundColor: color}} 
            data-key={dataKey}
            onMouseOver={removeTimeouts} 
            onMouseOut={startTimeouts}>
            {message}
        </div>
    )
}