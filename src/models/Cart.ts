import { Schema, model } from "mongoose";
import { Icart } from "../interfaces/Icart";

const CartSchema = new Schema<Icart>(
    {
        userId: {
            type: String,
            required: true,
            trim: true,
        },
        productId: {
            type: String,
            required: true,
            trim: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        quantity: {
            type: Number,
            default: 1,
            min: 1,
        },
        category: {
            type: String,
            default: "",
        },
        image: {
            type: [String],
            default: [],
        },
        rating: {
            rate: {
                type: Number,
                default: 0,
            },
            count: {
                type: Number,
                default: 0,
            },
        },
        brand: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

export default model<Icart>("Cart", CartSchema);
