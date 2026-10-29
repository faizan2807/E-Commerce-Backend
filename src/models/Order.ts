import { model, Schema } from "mongoose"
import {IOrder} from "../interfaces/IOrder"


const OrderSchema = new Schema<IOrder> (
    {
        userId:{
            type: String,
            required: true
        },
        productId:{
            type:String,
            required:true,
            trim:true
        },
        paymentMethod:{
            type:String,
            required: true,
            trim:true,
        },
        status:{
            type: String,
            required: true
        },
        shipping:{
            type: String,
            required: true,

        },
        price:{
            type: Number,
            required: true,
        }
    },
    {timestamps:true}
)

export default model <IOrder> ("IOrder", OrderSchema);