import { BASE_API_URL } from "./api";

export interface Supplier {
    _id: string;
    title: string;
    contactMail: string;
    phone?: string;
    createdAt: string;
    isActive?: boolean;
}

export async function fetchSuppliers() {
    try {
        const res = await fetch(`${BASE_API_URL}/api/suppliers`);
        if (!res) throw new Error("Could not fetch suppliers");
        const data = await res.json();
        return data;
    } catch (err: any) {
        console.log(`Could not fetch suppliers ${err.message}`);
    }
}
