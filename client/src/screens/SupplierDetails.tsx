import { Button, Text, TextInput, View, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Supplier, fetchSupplierById, updateSupplier } from "../api/suppliers";
import { useEffect, useState } from "react";

export function SupplierDetails({ route }: any) {
    const navigation = useNavigation();
    const { supplierId } = route.params;

    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [title, setTitle] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");
    const [isActive, setIsActive] = useState<boolean>(false);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        try {
            setError(null);
            setLoading(true);

            const data = await fetchSupplierById(supplierId);
            setSupplier(data);
            setTitle(data.title || "");
            setContactEmail(data.contactEmail || "");
            setNotes(data.notes || "");
            setIsActive(data.isActive || false);
        } catch (err: any) {
            setError(err.message ?? "Failed to load supplier");
        } finally {
            setLoading(false);
        }
    }
    async function onSave() {
        try {
            setError(null);

            if (!title.trim()) {
                setError("Name is required");
                return;
            }

            setSaving(true);

            await updateSupplier(supplierId, {
                title,
                contactEmail,
                phone,
                notes,
                isActive,
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

    return (
        <View style={{ padding: 16, gap: 12 }}>
            {loading ? <Text>Loading...</Text> : null}
            {error ? <Text style={{ color: "red" }}>{error}</Text> : null}

            {!loading ? (
                <>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Name des Lieferanten"
                        style={{ borderWidth: 1, padding: 8, borderRadius: 4 }}
                    />

                    <TextInput
                        value={contactEmail}
                        onChangeText={setContactEmail}
                        placeholder="Kontakt-E-Mail"
                        autoCapitalize="none"
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
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Notizen"
                        multiline
                        numberOfLines={4}
                        style={{ borderWidth: 1, padding: 8, borderRadius: 4, minHeight: 90 }}
                    />

                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                isActive ? { backgroundColor: "grey" } : { backgroundColor: "#ccc" },
                            ]}
                            onPress={() => setIsActive(true)}
                        >
                            <Text>ACTIV</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                isActive ? { backgroundColor: "#ccc" } : { backgroundColor: "grey" },
                            ]}
                            onPress={() => setIsActive(false)}
                        >
                            <Text>INAKTIV</Text>
                        </TouchableOpacity>
                    </View>
                    <Button title={saving ? "Speichern..." : "Aktualisieren"} onPress={onSave} disabled={saving} />
                </>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        color: "white",
        width: "50%",
    },
});
