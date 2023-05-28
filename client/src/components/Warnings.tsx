import { getRandomKey } from "../usefulFuncs"

interface WarningsProps {
    warnings: string[]
}

export function Warnings({warnings}: WarningsProps) {
    return (
        <div className="warnings-container">
            <p>Ошибки при вводе:</p>
            <ul>{warnings.map(warning => <li key={getRandomKey()}>{warning}</li>)}</ul>
        </div>
    )
}