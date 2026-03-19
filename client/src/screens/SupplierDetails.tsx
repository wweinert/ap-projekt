import { Button, Text, TextInput, View, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Supplier, fetchSupplierById, updateSupplier } from "../api/suppliers";
import { useEffect, useState } from "react";

export function SupplierDetails({ route }: any) {
    const navigation = useNavigation();
    const { supplierId } = route.params;

    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [title, setTitle] = useState("");
    const [contactMail, setContactMail] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");
    const [isActive, setIsActive] = useState(true);

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
            setContactMail(data.contactMail || "");
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

            if (!title.trim()) {
                setError("Name is required");
                return;
            }

            setSaving(true);

            await updateSupplier(supplierId, {
                title,
                contactMail,
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
                    <Text style={{ fontWeight: "600" }}>Name</Text>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Name des Lieferanten"
                        style={{ borderWidth: 1, padding: 8, borderRadius: 4 }}
                    />

                    <Text style={{ fontWeight: "600" }}>Kontakt-E-Mail</Text>
                    <TextInput
                        value={contactMail}
                        onChangeText={setContactMail}
                        placeholder="Kontakt-E-Mail"
                        autoCapitalize="none"
                        style={{ borderWidth: 1, padding: 8, borderRadius: 4 }}
                    />
                    <Text style={{ fontWeight: "600" }}>Telefon</Text>
                    <TextInput
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Telefon"
                        keyboardType="numeric"
                        style={{ borderWidth: 1, padding: 8, borderRadius: 4 }}
                    />
                    <Text style={{ fontWeight: "600" }}>Notizen</Text>
                    <TextInput
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Notizen"
                        multiline
                        numberOfLines={4}
                        style={{ borderWidth: 1, padding: 8, borderRadius: 4, minHeight: 90 }}
                    />
                    <Button title={saving ? "Speichern..." : "Aktualisieren"} onPress={onSave} disabled={saving} />

                    <Text style={{ fontWeight: "600" }}>Aktiv</Text>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                        <TouchableOpacity
                            style={[isActive ? { backgroundColor: "green" } : { backgroundColor: "grey" }]}
                            onPress={() => setIsActive(true)}
                        ></TouchableOpacity>
                        <Button title="AUS" onPress={() => setIsActive(false)} />
                    </View>
                </>
            ) : null}
        </View>
    );
}
