import mongoose, {Types} from "mongoose";

export interface IUser extends mongoose.Document {
    email: string
    password: string
    contacts?: Array<Types.ObjectId>
}
export type Candidate = IUser | null | undefined