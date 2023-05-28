import mongoose, { Types } from "mongoose"

export interface IContact extends mongoose.Document {
    name: string
    fields: [
        {
            web: string
            link: string
        }
    ]
    owner: Types.ObjectId
    date: Date
}