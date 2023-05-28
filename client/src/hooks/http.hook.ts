import { useCallback } from "react"
import { AuthError } from "../errors/AuthError"
import { InvalidRequestError } from "../errors/InvalidRequestError"
import { ServerError } from "../errors/ServerError"
import { IHttpInterface, IHttpRequest, IServerResponseBody } from "../interfaces/http.interface"

export function useHttp(): IHttpInterface {
    const request = useCallback(async function ({body, method, url, headers = {}}: IHttpRequest): Promise<IServerResponseBody> {

        try {
            if (body) {
                body = JSON.stringify(body)
                headers["Content-Type"] = "application/json"
            }
            const response = await fetch(url, {
                body,
                headers,
                method
            })
            const resBody = await response.json() as IServerResponseBody
            
            if (!response.ok) {
                switch (response.status) {
                    case 400:
                        throw new InvalidRequestError(resBody.message, resBody.warnings)
                    case 401:
                        throw new AuthError(resBody.message)
                    case 500:
                        throw new ServerError(resBody.message)
                    default:
                        throw new Error(resBody.message)
                }
                
            }

            return resBody
        } catch (error) {            
            throw error
        }
    }, [])
    return {request}
}