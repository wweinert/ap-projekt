import { useCallback, useEffect, useState } from "react";
import { fetchSuppliers, Supplier, createSupplier } from "../api/suppliers";
import { View, Text, FlatList, Pressable, TextInput, Button } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";

export function SuppliersScreen() {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);

    const [title, setTitle] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        try {
            setError(null);
            setLoading(true);
            setSuppliers(await fetchSuppliers());
        } catch (err: any) {
            console.error("Failed to load suppliers:", err.message);
            setError(err.message || "Failed to load suppliers");
        } finally {
            setLoading(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            load();
        }, []),
    );

    async function onCreate() {
        try {
            setError(null);
            if (!title.trim()) {
                setError("Title is required");
                return;
            }
            setSaving(true);

            await createSupplier({ title, contactEmail, phone, notes });
            setTitle("");
            setContactEmail("");
            setPhone("");
            setNotes("");
            await load();
        } catch (err: any) {
            setError(err.message || "Failed to create supplier");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <View style={{ padding: 16 }}>
                <Text>Loading suppliers...</Text>
            </View>
        );
    }

    return (
        <View style={{ padding: 16, gap: 12 }}>
            {user?.role === "admin" ? (
                <View style={{ paddingVertical: 8, gap: 8 }}>
                    <Text style={{ fontWeight: "600" }}>Lieferant erstellen</Text>
                    <TextInput
                        placeholder="Name"
                        value={title}
                        onChangeText={setTitle}
                        style={{ borderWidth: 1, padding: 8, borderRadius: 4 }}
                    />
                    <TextInput
                        placeholder="Kontakt-E-Mail"
                        value={contactEmail}
                        onChangeText={setContactEmail}
                        style={{ borderWidth: 1, padding: 8, borderRadius: 4 }}
                    />
                    <TextInput
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Telefon"
                        keyboardType="numeric"
                        style={{ borderWidth: 1, padding: 8, borderRadius: 4 }}
                    />
                    <TextInput
                        placeholder="Notizen"
                        value={notes}
                        onChangeText={setNotes}
                        style={{ borderWidth: 1, padding: 8, borderRadius: 4 }}
                        multiline
                        numberOfLines={3}
                    />
                    <Button title={saving ? "Speichern..." : "Lieferant hinzufügen"} onPress={onCreate} disabled={saving} />
                </View>
            ) : null}
            <Text style={{ fontWeight: "600" }}>Lieferanten</Text>

            <FlatList
                data={suppliers}
                keyExtractor={(s) => s._id}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => navigation.navigate("SupplierDetails", { supplierId: item._id })}
                        style={[{ padding: 8, borderBottomWidth: 1 }, !item.isActive && { backgroundColor: "#ccc" }]}
                        disabled={!item.isActive && user?.role === "employee"}
                    >
                        <Text style={{ fontWeight: "600" }}>{item.title}</Text>
                        {item.contactEmail ? <Text>{item.contactEmail}</Text> : null}
                        {item.notes ? <Text>{item.notes}</Text> : null}
                    </Pressable>
                )}
            />
        </View>
    );
}
