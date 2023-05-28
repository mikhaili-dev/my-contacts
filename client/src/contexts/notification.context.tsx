import { createContext } from "react";
import { INotificationContext } from "../interfaces/notification.interface";

const notificationContext = createContext<INotificationContext>({
    alerts: null,
    setAlerts: () => {},
    handleNewAlert: () => {},
    formWarnings: null,
    pushWarning: () => {},
    removeWarnings: () => {}
})

export {notificationContext}