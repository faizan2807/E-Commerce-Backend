export interface IOrder{
    _id:string
    userId:string;
    productId:string;
    paymentMethod: string;
    status:string;
    price:number;
    shipping:string
}