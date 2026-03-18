import { useEffect, useState } from "react";
import { fetchSuppliers, Supplier, createSupplier } from "../api/suppliers";
import { View, Text, FlatList, Pressable, TextInput, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";

export function SuppliersScreen() {
    const navigation = useNavigation<any>();

    const [suppliers, setSuppliers] = useState<Supplier[]>([]);

    const [title, setTitle] = useState("");
    const [contactMail, setContactMail] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        try {
            setError(null);
            setLoading(true);
            setSuppliers(await fetchSuppliers());
        } catch (err: any) {
            console.error("Failed to load suppliers:", err);
            setError(err.message || "Failed to load suppliers");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function onCreate() {
        try {
            setError(null);
            if (!title.trim()) {
                setError("Title is required");
                return;
            }
            await createSupplier({ title, contactMail, phone, notes });
            setTitle("");
            setContactMail("");
            setPhone("");
            setNotes("");
            await load();
        } catch (err: any) {
            setError(err.message || "Failed to create supplier");
        }
    }

    if (loading) {
        return (
            <View>
                <Text>Nicht geladen</Text>
            </View>
        );
    }

    return (
        <View style={{ padding: 16, gap: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: "bold" }}>Lieferanten</Text>

            <View style={{ paddingVertical: 8, gap: 8 }}>
                <Text style={{ fontWeight: "600" }}>Lieferant erstellen</Text>
                <TextInput
                    placeholder="Name"
                    value={title}
                    onChangeText={setTitle}
                    style={{ borderWidth: 1, padding: 8, borderRadius: 4 }}
                />
                <TextInput
                    placeholder="Contact Mail"
                    value={contactMail}
                    onChangeText={setContactMail}
                    style={{ borderWidth: 1, padding: 8, borderRadius: 4 }}
                />
                <TextInput
                    placeholder="Notes"
                    value={notes}
                    onChangeText={setNotes}
                    style={{ borderWidth: 1, padding: 8, borderRadius: 4 }}
                    multiline
                    numberOfLines={3}
                />
                <Button title="Create" onPress={onCreate} />
            </View>

            <FlatList
                data={suppliers}
                keyExtractor={(s) => s._id}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => navigation.navigate("SupplierDetails", { supplierId: item._id })}
                        style={{ paddingVertical: 8, borderBottomWidth: 1 }}
                    >
                        <Text style={{ fontWeight: "600" }}>{item.title}</Text>
                        {item.contactMail ? <Text>{item.contactMail}</Text> : null}
                        {item.notes ? <Text>{item.notes}</Text> : null}
                    </Pressable>
                )}
            />
        </View>
    );
}
