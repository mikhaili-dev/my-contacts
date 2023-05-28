export type httpMethod = 'GET' | 'POST' | 'DELETE'

export interface IHttpRequest {
    url: string
    method: httpMethod
    body?: any
    headers?: {
        ["Content-Type"]?: string
        ["Authorization"]?: string
        refreshToken?: string
    }
}
export interface IServerResponseBody {
    message: string
    [key: string]: any
}

export interface IHttpInterface {
    request: ({body, method, url, headers = {}}: IHttpRequest) => Promise<IServerResponseBody>
}