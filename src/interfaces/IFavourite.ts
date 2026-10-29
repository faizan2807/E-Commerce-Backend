export interface IFavourite {
    userId: string;
    productId: string;
    title: string;
    description?: string;
    price: number;
    category?: string;
    image?: string[];
    rating?: {
        rate?: number;
        count?: number;
    };
    brand?: string;
}
