import { API_BASE_URL } from "../config/api";

export type Supplier = {
    _id: string;
    title: string;
    contactMail: string;
    phone?: string;
    note?: string;
    createdAt: string;
    isActive?: boolean;
};

export async function fetchSuppliers(): Promise<Supplier[]> {
    const res = await fetch(`${API_BASE_URL}/api/suppliers`);
    if (!res.ok) throw new Error(`Failed to fetch suppliers: ${res.status}`);
    return res.json();
}
