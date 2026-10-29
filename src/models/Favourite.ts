import { Schema, model } from "mongoose";
import { IFavourite } from "../interfaces/IFavourite";

const FavouriteSchema = new Schema<IFavourite>(
    {
        userId: {
            type: String,
            required: true,
            trim: true,
            index: true,
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
        toJSON: {
            transform: function (_doc, ret: any) {
                if (Array.isArray(ret.image)) {
                    const port = process.env.PORT || 5000;
                    ret.image = ret.image.map((img: string) => {
                        if (!img) return img;
                        if (img.startsWith("http://") || img.startsWith("https://")) {
                            return img;
                        }
                        const filename = img.split("/").pop();
                        return `http://localhost:${port}/images/${filename}`;
                    });
                }
                return ret;
            },
        },
    }
);

FavouriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default model<IFavourite>("Favourite", FavouriteSchema);
