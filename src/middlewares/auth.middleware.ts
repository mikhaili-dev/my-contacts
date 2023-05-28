import { IRequest } from '../interfaces/Request.interface'
import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import config from 'config'
import { AuthError } from '../errors/AuthError'

type Token = string | undefined
/*
    В этом middleware проверяется точность аутентификационных данных, а именно accessToken
*/
export function authMiddleware(req: IRequest, res: Response, next: NextFunction) {
    try {
        const accessToken: Token = req.headers.authorization?.split(' ')[1]

        if (!accessToken) throw new AuthError('Отсутствует accessToken')

        jwt.verify(accessToken, config.get('SECRET_ACCESS_JWT_KEY'), (error, decodedAccessToken) => {
            if (error) throw error

            if (!decodedAccessToken || typeof decodedAccessToken === 'string') {
                throw new AuthError('Ошибка при вычислении accessToken')
            } else
            //В этом случае расшифровываем userId и возвращаемся в contact.route

            req.userId = decodedAccessToken.id
        })

        next()
    } catch (error: unknown) {
        /*
            В этот блок попадаем, если были приблемы с accessToken: его отсутствие, оишбка при расшифровке, неверность его формата.
            Далее на те же ошибки проверяется refreshToken - если была одна из представленных ошибок, авторизация невозможна, 
            и доступ пользователя в contact.route не будет предосталвен.
            Иначе, если refreshToken впорядке, то оба, refresh- и accessToken, будут обновлены и отправлены при следующем response
        */
        if (error instanceof AuthError || error instanceof jwt.JsonWebTokenError) {
            try {
                if (!req.headers.refreshtoken) throw new AuthError(error.message + ' и отсутствует refrshToken')

                if (typeof req.headers.refreshtoken !== 'string') throw new AuthError(error.message + ' и формат refreshToken неверен')

                const refreshToken = req.headers.refreshtoken.split(' ')[1]

                if (!refreshToken) throw new AuthError('refreshToken и accessToken устарели или отсутствуют')
    
                jwt.verify(refreshToken, config.get('SECRET_REFRESH_JWT_KEY'), (jwtError, decodedRefreshToken) => {
                    if (jwtError || !decodedRefreshToken || typeof decodedRefreshToken === 'string') {
                        throw new AuthError('refreshToken и accessToken устарели или отсутствуют')
                    }
                    const userId = decodedRefreshToken.id

                    const newAccessToken: string = jwt.sign(
                        {id: userId}, 
                        config.get('SECRET_ACCESS_JWT_KEY'), 
                        {expiresIn: '1h'}
                    )
                    const newRefreshToken: string = jwt.sign(
                        {
                            id: userId,
                            exp: decodedRefreshToken.exp
                        },
                        config.get('SECRET_REFRESH_JWT_KEY')
                    )

                    req.tokens = {
                        accessToken: newAccessToken,
                        refreshToken: newRefreshToken
                    }
                    req.userId = userId
                })
                next()
            } catch (error) {
                if (error instanceof AuthError || error instanceof jwt.JsonWebTokenError) {
                    res.status(401).json({message: error.message})
                }
            }

            } else {
            res.status(500).json({message: "Ошибка сервера. Попробуйте позже"})
        }
    }
}