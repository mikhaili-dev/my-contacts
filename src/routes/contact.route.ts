import express from "express"
import { body, Result, validationResult } from 'express-validator'
import { AuthError } from "../errors/AuthError"
import { InvalidRequestError } from "../errors/InvalidRequestError"
import { IContact } from "../interfaces/Contact.interface"
import { IRequest } from "../interfaces/Request.interface"
import { Candidate } from "../interfaces/User.interface"
import { authMiddleware } from "../middlewares/auth.middleware"
import { Contact } from "../models/Contact.model"
import { User } from "../models/User.model"
import { contactMiddleware } from "../middlewares/contact.middleware"

interface IContactData {
    name: string
    fields: Array<{
        web: string
        link: string
    }>
}
interface IExistingContactData extends IContactData {
    key: string
}
const contactRoute: express.Router = express.Router()

contactRoute.post('/save', 
    [
        authMiddleware,
        contactMiddleware,
    ],
    async (req: IRequest, res: express.Response) => {
        try {
            const body: IContactData = req.body

            const user: Candidate = await User.findById(req.userId)

            if (!user) throw new AuthError('Войдите в систему')

            const contact: IContact = new Contact({
                name: body.name, 
                fields: body.fields,
                owner: req.userId,
                date: new Date()
            })

            await contact.save()

            await user.updateOne({$push: {contacts: contact.id}})

            res.status(201).json({message: 'Контакт добавлен', contact, tokens: req.tokens})
        } catch (e) {
            if (e instanceof AuthError) {
                res.status(401).json({message: e.message})
            } else {
                if (e instanceof Error) {
                    res.status(500).json({message: e.message})
                }
            }
        }
    }
)
contactRoute.post('/change',
    [
        authMiddleware,
        contactMiddleware,
        body('key').trim().notEmpty()
    ],
    async (req: IRequest, res: express.Response) => {
        try {
            const errors: Result = validationResult(req)

            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Контакт не найден'})
            }
            const user: Candidate = await User.findById(req.userId)
            
            if (!user) throw new AuthError('Войдите в систему')
            
            const body: IExistingContactData = req.body

            const contact = await Contact.findOne({_id: body.key, owner: req.userId}) 

            if (!contact) throw new InvalidRequestError('Такого контакта не существует')

            await contact.updateOne({$set: { name: body.name, fields: body.fields}})

            const updContact = await Contact.findById(body.key)                     //Если не искать повторно, не будут учтены изменения

            res.status(200).json({message: 'Контакт обновлён', contact: updContact, tokens: req.tokens})

        } catch (e) {
            if (e instanceof AuthError) {
                res.status(401).json({message: e.message})

            } else if (e instanceof InvalidRequestError) {
                res.status(400).json({message: e.message})
            } else {
                if (e instanceof Error) {
                    res.status(500).json({message: e.message})
                }
            }
        }
    }
)

contactRoute.get('/get', 
    [
        authMiddleware,
    ],
    async (req: IRequest, res: express.Response) => {
        try {
            const user: Candidate = await User.findById(req.userId)

            if (!user) throw new AuthError('Войдите в систему')

            const contacts = await Contact.find({owner: req.userId})

            res.status(200).json({message: 'Контакты отправлены', contacts, tokens: req.tokens})
        } catch (error) {
            if (error instanceof AuthError) {
                res.status(401).json({message: error.message})
            } else {
                if (error instanceof Error) {
                    res.status(500).json({message: error.message})
                }
            }
        }
    }
)
contactRoute.delete('/delete',
    [
        authMiddleware,
    ],
    async (req: IRequest, res: express.Response) => {
        try {
            const user: Candidate = await User.findById(req.userId)

            if (!user) throw new AuthError('Войдите в систему')

            const body: IExistingContactData = req.body

            const contactToDelete = await Contact.findOneAndDelete({_id: body.key, owner: req.userId})

            if (!contactToDelete) throw new InvalidRequestError('Такого контакта не существует')

            res.status(200).json({message: 'Контакт удалён', tokens: req.tokens})
        } catch (e) {
            if (e instanceof AuthError) {
                res.status(401).json({message: e.message})
            } else if (e instanceof InvalidRequestError) {
                res.status(400).json({message: e.message})
            } else {
                if (e instanceof Error) {
                    res.status(500).json({message: e.message})
                }
            }
        }
    }
)

export {contactRoute}