import { Schema, model, Types } from 'mongoose'
import { IContact } from '../interfaces/Contact.interface'

const schema: Schema = new Schema({
    name: {type: String, required: true},
    fields: [{web: String, link: String}],
    owner: {type: Types.ObjectId, ref: "User", required: true},
    date: {type: Date, required: true}
})

const Contact = model<IContact>('Contact', schema)

export {Contact}