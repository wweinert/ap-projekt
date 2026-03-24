import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/api";
import { Supplier } from "./suppliers";

export type Report = {
    _id: string;
    title: string;
    description?: string;
    supplierId: string | Supplier;
    createdByUserId?: string;
    createdByName?: string;
    createdByEmail: string;
    updatedByEmail?: string;
    updateNotes?: string;
    status: "OK" | "DEFECT";
    createdAt: string;
    images?: string[];
};

export async function fetchReports(): Promise<Report[]> {
    const res = await fetch(`${API_BASE_URL}/api/reports`, { headers: await getAuthHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch reports: ${res.status}`);
    return res.json();
}

export async function fetchReportsBySupplierId(id: string): Promise<Report[]> {
    const res = await fetch(`${API_BASE_URL}/api/reports/supplier/${id}`, { headers: await getAuthHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch reports by supplier id: ${res.status}`);
    return res.json();
}

export async function fetchReportsById(id: string): Promise<Report> {
    const res = await fetch(`${API_BASE_URL}/api/reports/${id}`, { headers: await getAuthHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch reports by id: ${res.status}`);
    return res.json();
}

export async function getGeneratedPDF(id: string): Promise<Report> {
    const res = await fetch(`${API_BASE_URL}/api/reports/${id}/pdf`, { headers: await getAuthHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch report's PDF: ${res.status}`);
    return res.json();
}

export async function updateReport(
    id: string,
    input: {
        title?: string;
        updateNotes: string;
        description?: string;
        supplierId?: string;
        updatedByEmail?: string;
        status?: "OK" | "DEFECT";
    },
): Promise<Report> {
    const res = await fetch(`${API_BASE_URL}/api/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) throw new Error(data?.message ?? data?.error ?? `Failed to update report: ${res.status}`);

    return data;
}

export async function createReport(input: {
    title: string;
    description?: string;
    supplierId: string;
    status: "OK" | "DEFECT";
    images?: string[];
}): Promise<Report> {
    const formData = new FormData();

    formData.append("title", input.title);
    formData.append("description", input.description ?? "");
    formData.append("supplierId", input.supplierId);
    formData.append("status", input.status);

    input.images?.forEach((uri, index: any) => {
        formData.append("images", {
            uri,
            name: getImageName(uri, index),
            type: getImageMimeType(uri),
        } as any);
    });

    const res = await fetch(`${API_BASE_URL}/api/reports`, {
        method: "POST",
        headers: await getAuthHeaders(),
        body: formData,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) throw new Error(data?.message ?? data?.error ?? `Failed to create report: ${res.status}`);

    return data;
}

async function getAuthHeaders() {
    const token = await AsyncStorage.getItem("authToken");

    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function getAuthToken() {
    return AsyncStorage.getItem("authToken");
}

function getImageName(uri: string, index: string) {
    const cleanUri = uri.split("?")[0];
    const extension = cleanUri.includes(".") ? cleanUri.substring(cleanUri.lastIndexOf(".;")) : ".jpg";

    return `report_image_${index}${extension}`;
}

function getImageMimeType(uri: string) {
    const lowerUri = uri.toLocaleLowerCase();

    if (lowerUri.endsWith(".png")) return "image/png";
    if (lowerUri.endsWith(".webp")) return "image/webp";

    return "image/jpeg";
}
