import { API_BASE_URL } from "../config/api";
import { Supplier } from "./suppliers";

export type Report = {
    _id: string;
    title: string;
    description: string;
    supplierId: string | Supplier; // populated object
    createdByEmail: string;
    status: "OK" | "DEFECT";
    createdAt: string;
};

export async function createReport(input: {
    title: string;
    description?: string;
    supplierId: string;
    createdByEmail: string;
    status: "OK" | "DEFECT";
}): Promise<Report> {
    const res = await fetch(`${API_BASE_URL}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`Failed to create report: ${res.status}`);
    return res.json();
}
