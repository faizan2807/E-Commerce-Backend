export interface Icart {
    userId: string;
    productId: string;
    title: string;
    description: string;
    price: number;
    quantity?: number;
    category: string;
    image?: string[];
    rating?: {
        rate?: number;
        count?: number;
    };
    brand: string;
}