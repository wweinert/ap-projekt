import { Button, Text, TextInput, View, StyleSheet, TouchableOpacity, Platform, Alert } from "react-native";
import { File, Paths } from "expo-file-system";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import * as Sharing from "expo-sharing";

import { Supplier, fetchSupplierById, getGeneratedPDF, updateSupplier } from "../api/suppliers";
import { useAuth } from "../context/AuthContext";

export function SupplierDetails({ route }: any) {
    const navigation = useNavigation();
    const { supplierId } = route.params;
    const { user } = useAuth();

    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [title, setTitle] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");
    const [isActive, setIsActive] = useState<boolean>(false);

    const [edit, setEdit] = useState(false);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // PDF generating options

    const [pdfOptions, setPdfOptions] = useState(false);
    const [from, setFrom] = useState<string>("");
    const [to, setTo] = useState<string>("");
    const [generating, setGenerating] = useState(false);

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
            setPhone(data.phone || "");
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

    async function openPDFInNativeViewer(uri: string) {
        try {
            if (Platform.OS === "android") {
                const contentUri = await FileSystem.getContentUriAsync(uri);
                await Linking.openURL(contentUri);
                return;
            }
            await Linking.openURL(uri);
        } catch (err: any) {}
    }

    async function generatePDFHandle() {
        try {
            setError(null);
            setGenerating(true);

            const res = await getGeneratedPDF(supplierId, { from, to });
            const fileName = `supplier_${supplierId}.pdf`;
            const localFile = new File(Paths.cache, fileName);

            const bytes = await res.arrayBuffer();
            localFile.write(new Uint8Array(bytes));

            if (Platform.OS !== "web" && (await Sharing.isAvailableAsync())) {
                await Sharing.shareAsync(localFile.uri);
            } else {
                Alert.alert("PDF gespeichert", localFile.uri);
            }
        } catch (err: any) {
            setError(err.message ?? "Failed to generate PDF");
        } finally {
            setGenerating(false);
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
                        style={{ borderWidth: 1, padding: 8, borderRadius: 4, borderColor: !edit ? "#ccc" : "black" }}
                        editable={edit}
                    />

                    <TextInput
                        value={contactEmail}
                        onChangeText={setContactEmail}
                        placeholder="Kontakt-E-Mail"
                        autoCapitalize="none"
                        style={{ borderWidth: 1, padding: 8, borderRadius: 4, borderColor: !edit ? "#ccc" : "black" }}
                        editable={edit}
                    />
                    <TextInput
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Telefon"
                        keyboardType="numeric"
                        style={{ borderWidth: 1, padding: 8, borderRadius: 4, borderColor: !edit ? "#ccc" : "black" }}
                        editable={edit}
                    />
                    <TextInput
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Notizen"
                        multiline
                        numberOfLines={4}
                        style={{
                            borderWidth: 1,
                            padding: 8,
                            borderRadius: 4,
                            minHeight: 90,
                            borderColor: !edit ? "#ccc" : "black",
                        }}
                        editable={edit}
                    />

                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <TouchableOpacity
                            style={[styles.button, isActive ? { backgroundColor: "grey" } : { backgroundColor: "#ccc" }]}
                            onPress={() => setIsActive(true)}
                            disabled={!edit}
                        >
                            <Text>ACTIV</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, isActive ? { backgroundColor: "#ccc" } : { backgroundColor: "grey" }]}
                            onPress={() => setIsActive(false)}
                            disabled={!edit}
                        >
                            <Text>INAKTIV</Text>
                        </TouchableOpacity>
                    </View>
                    {user?.role === "admin" && !edit && <Button title={"Bearbeiten"} onPress={() => setEdit(true)} />}
                    {user?.role === "admin" && edit && (
                        <Button title={saving ? "Speichern..." : "Aktualisieren"} onPress={onSave} disabled={saving} />
                    )}

                    {!pdfOptions ? (
                        <Button title="PDF erstellen" onPress={() => setPdfOptions(true)} />
                    ) : (
                        <>
                            <View style={{ borderWidth: 1, gap: 12, padding: 8, flexDirection: "row" }}>
                                <TextInput
                                    value={from}
                                    onChangeText={setFrom}
                                    placeholder="Von (YYYY-MM-DD)"
                                    style={{ borderWidth: 1, padding: 8, borderRadius: 4, width: "48%" }}
                                />
                                <TextInput
                                    value={to}
                                    onChangeText={setTo}
                                    placeholder="Bis (YYYY-MM-DD)"
                                    style={{ borderWidth: 1, padding: 8, borderRadius: 4, width: "48%" }}
                                />
                            </View>
                            <Button title={generating ? "Generiere..." : "PDF generieren"} onPress={generatePDFHandle} />
                        </>
                    )}
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
