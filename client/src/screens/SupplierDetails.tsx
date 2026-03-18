import { Button, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Supplier, fetchSupplierById, updateSupplier } from "../api/suppliers";
import { useEffect, useState } from "react";

export function SupplierDetails({ route }: any) {
    const navigation = useNavigation();
    const { supplierId } = route.params;

    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [name, setName] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [notes, setNotes] = useState("");

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        try {
            setError(null);
            setLoading(true);

            const data = await fetchSupplierById(supplierId);
            setSupplier(data);
            setName(data.title || "");
            setContactEmail(data.contactMail || "");
            setNotes(data.notes || "");
        } catch (err: any) {
            setError(err.message ?? "Failed to load supplier");
        } finally {
            setLoading(false);
        }
    }
    async function onSave() {
        try {
            setError(null);

            if (!name.trim()) {
                setError("Name is required");
                return;
            }

            setSaving(true);

            await updateSupplier(supplierId, {
                name,
                contactEmail,
                notes,
            });

            navigation.goBack();
        } catch (err: any) {
            setError(err.message ?? "Failed to update supplier");
        } finally {
            setSaving(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    if (loading) {
        return (
            <View>
                <Text>Nicht geladen</Text>
            </View>
        );
    }

    return (
        <View style={{ padding: 16, gap: 12 }}>
            <Button title="Back" onPress={() => navigation.goBack()} />
            <Text style={{ fontSize: 22, fontWeight: "bold" }}>Supplier Detail</Text>

            {loading ? <Text>Loading...</Text> : null}
            {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
            {!loading ? (
                <>
                    <Text style={{ fontWeight: "600" }}>Name</Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Supplier name"
                        style={{ borderWidth: 1, padding: 8, borderRadius: 4 }}
                    />

                    <Text style={{ fontWeight: "600" }}>Contact Email</Text>
                    <TextInput
                        value={contactEmail}
                        onChangeText={setContactEmail}
                        placeholder="Contact email"
                        autoCapitalize="none"
                        style={{ borderWidth: 1, padding: 8, borderRadius: 4 }}
                    />

                    <Text style={{ fontWeight: "600" }}>Notes</Text>
                    <TextInput
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Notes"
                        multiline
                        numberOfLines={4}
                        style={{ borderWidth: 1, padding: 8, borderRadius: 4, minHeight: 90 }}
                    />

                    <Button title={saving ? "Saving..." : "Save Supplier"} onPress={onSave} disabled={saving} />
                </>
            ) : null}
        </View>
    );
}

// const [error, setError] = useState(false);
// const [loading, setLoading] = useState(true);

// function load() {
//     try {
//         setError(false);
//         setLoading(false);
//     } catch (err: any) {
//         setError(err.message);
//         console.log(`Could not fetch supplier by id ${err.message}`);
//     } finally {
//         setError(false);
//     }
// }

// useEffect(() => {
//     load();
// }, []);

// if (loading) {
//     return (
//         <View>
//             <Text>Nicht geladen</Text>
//         </View>
//     );
// }

// return (
//     <>
//         <View>
//             {error ? <Text>{error}</Text> : null}
//             <Text>{}</Text>
//         </View>
//     </>
// );
