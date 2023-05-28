export type alerts = JSX.Element[] | null
export type formWarnings = string[] | null

export type alertType = 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO'

type setAlertsFunc = (alerts: alerts) => alerts

export interface INotificationContext {
    alerts: alerts
    setAlerts: (alerts: alerts | setAlertsFunc) => void
    handleNewAlert: (message: string, type: alertType) => void
    formWarnings: formWarnings
    pushWarning: (warning: string | string[]) => void
    removeWarnings: () => void
}
export interface INotificationHook {
    alerts: alerts
    setAlerts: (alerts: alerts | setAlertsFunc) => void
    handleNewAlert: (message: string, type: alertType) => void
    formWarnings: formWarnings
    pushWarning: (warning: string | string[]) => void
    removeWarnings: () => void
}