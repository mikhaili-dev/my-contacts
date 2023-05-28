export class InvalidRequestError extends Error {
    warnings: string[]
    
    constructor(message: string, warnings: string[]) {
        super(message)
        this.name = 'InvalidRequestError'
        this.warnings = warnings
    }
}