import express from 'express'

export interface IRequest extends express.Request {
    userId?: string
    tokens?: {
        accessToken: string
        refreshToken: string
    }
}