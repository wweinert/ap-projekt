import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/api";

export type Supplier = {
    _id: string;
    title: string;
    contactEmail: string;
    phone?: string;
    notes?: string;
    createdAt: string;
    isActive?: boolean;
};

export async function fetchSuppliers(): Promise<Supplier[]> {
    const res = await fetch(`${API_BASE_URL}/api/suppliers`, { headers: await getAuthHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch suppliers: ${res.status}`);
    return res.json();
}

export async function fetchSupplierById(id: string): Promise<Supplier> {
    const res = await fetch(`${API_BASE_URL}/api/suppliers/${id}`, { headers: await getAuthHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch supplier by id: ${res.status}`);
    return res.json();
}
export async function setActivityById(id: string, state: boolean): Promise<Supplier> {
    const res = await fetch(`${API_BASE_URL}/api/suppliers/${id}/activity`, {
        method: "PATCH",
        headers: await getJsonAuthHeaders(),
        body: JSON.stringify({ isActive: state }),
    });
    if (!res.ok) throw new Error(`Failed to change activity of supplier: ${res.status}`);
    return res.json();
}

export async function getGeneratedPDF(id: string, input: { from: any; to: any }): Promise<Response> {
    const query = `from=${encodeURIComponent(input.from)}&to=${encodeURIComponent(input.to)}`;
    const res = await fetch(`${API_BASE_URL}/api/suppliers/${id}/pdf?${query}`, { headers: await getAuthHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch supplier PDF: ${res.status}`);
    return res;
}

export async function updateSupplier(
    id: string,
    input: { title?: string; contactEmail?: string; phone?: string; notes?: string; isActive: boolean },
): Promise<Supplier> {
    const res = await fetch(`${API_BASE_URL}/api/suppliers/${id}`, {
        method: "PATCH",
        headers: await getJsonAuthHeaders(),
        body: JSON.stringify(input),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error ?? `Failed to update supplier: ${res.status}`);
    return data;
}

export async function createSupplier(input: { title: string; contactEmail: string; phone?: string; notes?: string }): Promise<Supplier> {
    const res = await fetch(`${API_BASE_URL}/api/suppliers`, {
        method: "POST",
        headers: await getJsonAuthHeaders(),
        body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`Failed to create a supplier: ${res.status}`);
    return res.json();
}

async function getAuthHeaders() {
    const token = await AsyncStorage.getItem("authToken");

    return {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}
async function getJsonAuthHeaders() {
    return {
        "Content-Type": "application/json",
        ...(await getAuthHeaders()),
    };
}
