export interface IProducts {
    _id?: string;
    title: string;
    description: string;
    price: number;
    category: string;
    image?: string[];
    rating?: {
        rate?: number;
        count?: number;
    };
    brand: string;
    status: "Available" | "Unavailable" | "Out Of Stock";
    sellerId: string;
}