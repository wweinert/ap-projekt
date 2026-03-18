import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList, Pressable } from "react-native";
import { fetchSuppliers, Supplier } from "../api/suppliers";
import { createReport } from "../api/reports";
import { useNavigation } from "@react-navigation/core";

export function CreateReport() {
    const navigation = useNavigation<any>();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

    const [createdByEmail, setCreatedByEmail] = useState("test@example.com");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<"OK" | "DEFECT">("OK");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function loadSuppliers() {
        try {
            setError(null);
            setSuppliers(await fetchSuppliers());
        } catch (err: any) {
            setError(err.message ?? "Failed to load suppliers");
        }
    }

    async function onCreate() {
        try {
            setError(null);

            if (!selectedSupplier) {
                setError("Please select a supplier");
                return;
            }

            if (!title.trim()) {
                setError("Title is required");
                return;
            }
            if (!createdByEmail.trim()) {
                setError("Email is required");
                return;
            }
            setLoading(true);

            await createReport({
                createdByEmail,
                title,
                description,
                supplierId: selectedSupplier._id,
                status,
            });

            setTitle("");
            setDescription("");
            setStatus("OK");

            navigation.navigate("Berichte");
        } catch (err: any) {
            setError(err.message ?? "Failed to create report");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadSuppliers();
    }, []);

    return (
        <View style={{ padding: 16, gap: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: "bold" }}>Create Report</Text>
            {error && <Text style={{ color: "red" }}>{error}</Text>}

            <Text style={{ fontSize: 16, fontWeight: "bold" }}>Your Mail</Text>
            <TextInput
                value={createdByEmail}
                onChangeText={setCreatedByEmail}
                placeholder="Enter your email"
                autoCapitalize="none"
                style={{ borderWidth: 1, padding: 8 }}
            />

            <Text style={{ fontWeight: "600" }}>Title</Text>
            <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Delivery 25.02"
                autoCapitalize="none"
                style={{ borderWidth: 1, padding: 8 }}
            />

            <Text style={{ fontWeight: "600" }}>Description</Text>
            <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Optional"
                style={{ borderWidth: 1, padding: 8, minHeight: 80 }}
                multiline
            />

            <Text style={{ fontWeight: "600" }}>Status</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
                <Button title="OK" onPress={() => setStatus("OK")} />
                <Button title="DEFECT" onPress={() => setStatus("DEFECT")} />
            </View>
            <Text>Selected: {status}</Text>

            <Text style={{ fontWeight: "600" }}>Select supplier</Text>
            <Button title="Reload suppliers" onPress={loadSuppliers} />

            <FlatList
                data={suppliers}
                keyExtractor={(s) => s._id}
                style={{ maxHeight: 180, borderWidth: 1 }}
                renderItem={({ item }) => {
                    const selected = selectedSupplier?._id === item._id;
                    return (
                        <Pressable
                            onPress={() => setSelectedSupplier(item)}
                            style={{
                                padding: 10,
                                borderBottomWidth: 1,
                                backgroundColor: selected ? "#eaeaea" : "transparent",
                            }}
                        >
                            <Text>{item.title}</Text>
                        </Pressable>
                    );
                }}
            />

            <Text>Supplier: {selectedSupplier ? selectedSupplier.title : "None"}</Text>

            <Button title={loading ? "Creating..." : "Create Report"} onPress={onCreate} disabled={loading} />
        </View>
    );
}
