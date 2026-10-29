import { Schema, model, Document } from "mongoose";
import { IUser, IrefreshToken } from "../interfaces/IUser";


const UserSchema = new Schema<IUser & { token?: string }>(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            // unique: true,
            lowercase: true,
            trim: true,
        },
        contact: {
            type: Number,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["Customer", "Admin"],
            default: "Customer",
        },
        address: {
            street: {
                type: String,
                default: "",
            },
            city: {
                type: String,
                default: "",
            },
            state: {
                type: String,
                default: "",
            },
            country: {
                type: String,
                default: "",
            },
            zipCode: {
                type: Number,
                default: "",
            },
        },
        orders: [
            {
                type: Schema.Types.ObjectId,
                ref: "Order",
            },
        ],
        totalSpending: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ["Active", "Inactive", "Blocked"],
            default: "Active",
        },
        refreshToken: {
            type: String,
            default: null,
        },
        token: {
            type: String,
            default: null,
        }
    },

    {
        timestamps: true,
    }
);


export default model<IUser>("User", UserSchema);