import express from 'express'
import bcrypt from 'bcrypt'
import config from 'config'
import  jwt  from 'jsonwebtoken'
import { body, matchedData, validationResult } from 'express-validator'
import { ValidationError, Result } from 'express-validator'
import { User } from '../models/User.model.js'
import { Candidate, IUser } from '../interfaces/User.interface.js'

interface IAuthInfo {
    email: string
    password: string
}

const authRoute: express.Router = express.Router()

authRoute.post('/register', [
    body('email').trim().isLength({min: 1}).withMessage('Не введена почта').isEmail().withMessage('Почта введена в некорректном формате'),
    body('password').trim().isLength({min: 1}).withMessage('Не введён пароль').isLength({min: 6}).withMessage('Введён слишком короткий пароль. Минимум символов: 6')
], 
    async (req: express.Request, res: express.Response) => {
        try {
            const errors: Result<ValidationError> = validationResult(req)

            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Некорректные данные', warnings: errors.mapped()})
            }

            const {email, password} = matchedData(req) as IAuthInfo

            if (await User.findOne({email})) {
                return res.status(400).json({message: "Такая почта уже зарегистрирована"})
            }

            const hashedPassword: string = await bcrypt.hash(password, 12)

            const user: IUser = new User({email, password: hashedPassword})
            
            await user.save()

            res.status(201).json({message: "Пользователь создан"})

        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).json({message: error.message})
            }   
        }
    }
)

authRoute.post('/login', [
    body('email').trim().isLength({min: 1}).withMessage('Не введена почта').isEmail().withMessage('Почта введена в некорректном формате'),
    body('password').trim().isLength({min: 1}).withMessage('Не введён пароль').isLength({min: 6}).withMessage('Введён слишком короткий пароль. Минимум символов: 6')
],  
    async (req: express.Request, res: express.Response) => {
        try {
            const errors: Result<ValidationError> = validationResult(req)

            if (!errors.isEmpty()) {
                const warnings = getWarningsMessage(errors.mapped())

                return res.status(400).json({message: 'Некорректные данные', warnings})
            }
            const {email, password} = matchedData(req) as IAuthInfo

            const user: Candidate = await User.findOne({email})

            if (!user) {
                return res.status(400).json({message: "Такая почта не зарегестрирована"})
            }

            const hashedPassword: string = user.password

            const isPasswordCorrect: boolean = await bcrypt.compare(password, hashedPassword)

            if (!isPasswordCorrect) {
                return res.status(400).json({message: "Неверный пароль"})
            }
            /*
                accessToken для предосталвения полномочий: по нему будет определяется, есть ли у пользователя доступ к данным с сервера
                refreshToken для обновления accessToken: действуя полгода, он позволит пользователю не входить в систему каждый раз при устаревании accessToken
            */
            const accessToken: string = jwt.sign(
                {id: user.id}, 
                config.get('SECRET_ACCESS_JWT_KEY'), 
                {expiresIn: '1h'}
            )
            const refreshToken: string = jwt.sign(
                {
                    id: user.id,
                    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30 * 6)
                }, 
                config.get('SECRET_REFRESH_JWT_KEY'),
            )

            res.status(200).json({
                tokens: {
                    accessToken, 
                    refreshToken
                }, 
                message: "Выполняется вход"
            })

        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).json({message: error.message})
            }
        }
    }
)
function getWarningsMessage(warnings: Record<string, ValidationError>): string[] {
    const messages: string[] = []

    for (let warning in warnings) {
        messages.push(warnings[warning].msg)
    }
    return messages
}


export {authRoute}