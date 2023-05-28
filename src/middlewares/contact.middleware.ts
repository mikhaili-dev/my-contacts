import { Response, NextFunction } from "express";
import { InvalidRequestError } from "../errors/InvalidRequestError";
import { IRequest } from "../interfaces/Request.interface";

interface Field {
    web: string
    link: string
}

export function contactMiddleware(req: IRequest, res: Response, next: NextFunction) {
    try {
        /*
            Для успешного запроса на сохранение или изменение контакта, 
            присланный контакт должен иметь:
                1. Имя
                2. По крайней мере одно сочетание web/link
            Иначе, запрос является неверным и будет закончен с ошибкой 
        */
        const fields: [] = req.body.fields
        const warnings: string[] = []

        if (!req.body.name) warnings.push('Не введено имя')

        const filledFields = fields.map((field: Field) => {
            if (!field.web || !field.link) return

            return {web: field.web, link: field.link}
        })

        if (isArrayEmpty(filledFields)) warnings.push('Не введено ни одного сочетания <сеть/ссылка>')

        if (!isArrayEmpty(warnings)) return res.status(400).json({warnings, message: 'Некорректные данные'})

        req.body.fields = filledFields

        next()
    } catch (error) {
        if (error instanceof InvalidRequestError) {
            res.status(400).json({message: error.message})
        }
    }
}
function isArrayEmpty(arr: Array<any>): boolean {
    for (let e of arr) {
        return false
    }
    return true
}