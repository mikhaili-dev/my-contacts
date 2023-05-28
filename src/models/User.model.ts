import { Schema, model, Types } from 'mongoose'
import { IUser } from '../interfaces/User.interface'

const schema: Schema = new Schema({
    email: {type: String, trim: true, required: true, unique: true},
    password: {type: String, trim: true, required: true, minLength: 6},
    contacts: [{type: Types.ObjectId, ref: 'Contact'}]
})

const User = model<IUser>('User', schema)

export {User}