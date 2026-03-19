import { API_BASE_URL } from "../config/api";

export type Supplier = {
    _id: string;
    title: string;
    contactMail: string;
    phone?: string;
    notes?: string;
    createdAt: string;
    isActive?: boolean;
};

export async function fetchSuppliers(): Promise<Supplier[]> {
    const res = await fetch(`${API_BASE_URL}/api/suppliers`);
    if (!res.ok) throw new Error(`Failed to fetch suppliers: ${res.status}`);
    return res.json();
}

export async function fetchSupplierById(id: string): Promise<Supplier> {
    const res = await fetch(`${API_BASE_URL}/api/suppliers/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch supplier by id: ${res.status}`);
    return res.json();
}

export async function updateSupplier(
    id: string,
    input: { title?: string; contactMail?: string; phone?: string; notes?: string; isActive: boolean },
): Promise<Supplier> {
    const res = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    if (!res.ok) throw new Error(`Failed to update supplier: ${res.status}`);
    return res.json();
}

export async function createSupplier(input: {
    title: string;
    contactMail: string;
    phone?: string;
    notes?: string;
}): Promise<Supplier> {
    const res = await fetch(`${API_BASE_URL}/api/suppliers`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`Failed to create a supplier: ${res.status}`);
    return res.json();
}
