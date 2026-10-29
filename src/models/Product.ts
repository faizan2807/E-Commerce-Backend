import { Schema, model } from "mongoose";
import { IProducts } from "../interfaces/IProduct";


const ProductSchema = new Schema<IProducts>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        category: {
            type: String,
            required: true,
            trim: true,
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
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["Available", "Unavailable", "Out Of Stock"],
            required: true,
        },
        sellerId: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);
export default model<IProducts>("Products", ProductSchema)