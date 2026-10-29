import { Document, Schema } from "mongoose";

export interface IAddress {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: number;
}

export interface Ilogin{
    email: string;
    password: string
}

export interface IchangePassword{
    email: string,
    password: string
}

export type UserRole = "Customer" | "Admin";

export interface IUser {
    firstName: string;
    lastName: string;
    email: string;
    contact: number;
    password: string;
    role: UserRole;
    address: IAddress;
    orders: Schema.Types.ObjectId[];
    totalSpending: number;
    status: "Active" | "Inactive" | "Blocked";
    _id: string;
    refreshToken?: string;
    IchangePassword:[]
    IrefreshToken:[]
}

export interface IrefreshToken{
    token?:string;
    refreshToken?: string;
}