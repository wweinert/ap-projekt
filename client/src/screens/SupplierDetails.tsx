import { Button, Text, TextInput, View, StyleSheet, TouchableOpacity, Platform, Alert } from "react-native";
import { File, Paths } from "expo-file-system";
import { useEffect, useState } from "react";
import * as Sharing from "expo-sharing";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

import { Supplier, fetchSupplierById, getGeneratedPDF, updateSupplier } from "../api/suppliers";
import { useAuth } from "../context/AuthContext";

export function SupplierDetails({ route }: any) {
    const { supplierId } = route.params;
    const { user } = useAuth();

    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [title, setTitle] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");
    const [isActive, setIsActive] = useState<boolean>(false);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // PDF generating options
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);

    const [generating, setGenerating] = useState(false);

    // modes: view, edit, pdf
    const [mode, setMode] = useState<"view" | "edit" | "pdf">("view");
    const isEditMode = mode === "edit";

    async function load() {
        try {
            setError(null);
            setLoading(true);

            const data = await fetchSupplierById(supplierId);
            applySupplierData(data);
        } catch (err: any) {
            setError(err.message ?? "Failed to load supplier");
        } finally {
            setLoading(false);
        }
    }

    function applySupplierData(data: Supplier) {
        setSupplier(data);
        setTitle(data.title || "");
        setContactEmail(data.contactEmail || "");
        setNotes(data.notes || "");
        setIsActive(data.isActive || false);
        setPhone(data.phone || "");
    }
    async function updateSupplierHandle() {
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

            setMode("view");
            await load();
        } catch (err: any) {
            setError(err.message ?? "Aktualisierung des Lieferanten fehlgeschlagen");
        } finally {
            setSaving(false);
        }
    }
    async function canelUpdating() {
        try {
            const data = await fetchSupplierById(supplierId);
            applySupplierData(data);
        } catch (err: any) {
            setError(err.message ?? "Aktualisierung des Lieferanten fehlgeschlagen");
        }
    }
    function formatDate(value: Date) {
        return value.toISOString().slice(0, 10); // YYYY-MM-DD
    }

    function onChangeFrom(_event: DateTimePickerEvent, selected?: Date) {
        setShowFromPicker(false);
        if (selected) setFromDate(selected);
    }

    function onChangeTo(_event: DateTimePickerEvent, selected?: Date) {
        setShowToPicker(false);
        if (selected) setToDate(selected);
    }

    async function generatePDFHandle() {
        try {
            setError(null);
            setGenerating(true);

            const res = await getGeneratedPDF(supplierId, {
                from: formatDate(fromDate),
                to: formatDate(toDate),
            });
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
            setMode("view");
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
                        style={{ borderWidth: 1, padding: 8, borderRadius: 4, borderColor: !isEditMode ? "#ccc" : "black" }}
                        editable={isEditMode}
                    />

                    <TextInput
                        value={contactEmail}
                        onChangeText={setContactEmail}
                        placeholder="Kontakt-E-Mail"
                        autoCapitalize="none"
                        style={{ borderWidth: 1, padding: 8, borderRadius: 4, borderColor: !isEditMode ? "#ccc" : "black" }}
                        editable={isEditMode}
                    />
                    <TextInput
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Telefon"
                        keyboardType="numeric"
                        style={{ borderWidth: 1, padding: 8, borderRadius: 4, borderColor: !isEditMode ? "#ccc" : "black" }}
                        editable={isEditMode}
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
                            borderColor: !isEditMode ? "#ccc" : "black",
                        }}
                        editable={isEditMode}
                    />

                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <TouchableOpacity
                            style={[styles.button, { width: "48%" }, isActive ? { backgroundColor: "grey" } : { backgroundColor: "#ccc" }]}
                            onPress={() => setIsActive(true)}
                            disabled={!isEditMode}
                        >
                            <Text>ACTIV</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, { width: "48%" }, isActive ? { backgroundColor: "#ccc" } : { backgroundColor: "grey" }]}
                            onPress={() => setIsActive(false)}
                            disabled={!isEditMode}
                        >
                            <Text>INAKTIV</Text>
                        </TouchableOpacity>
                    </View>

                    {mode === "view" ? (
                        <View style={{ gap: 8 }}>
                            {user?.role === "admin" ? <Button title="Bearbeiten" onPress={() => setMode("edit")} /> : null}
                            <Button title="PDF erstellen" onPress={() => setMode("pdf")} />
                        </View>
                    ) : null}

                    {mode === "edit" ? (
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <TouchableOpacity
                                onPress={updateSupplierHandle}
                                disabled={saving}
                                style={[styles.button, { width: "48%", backgroundColor: "green" }]}
                            >
                                <Text style={styles.buttonText}>{saving ? "Speichern..." : "Aktualisieren"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={async () => {
                                    await canelUpdating();
                                    setMode("view");
                                }}
                                disabled={saving}
                                style={[styles.button, { width: "48%", backgroundColor: "red" }]}
                            >
                                <Text style={styles.buttonText}>Abbrechen</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    {mode === "pdf" ? (
                        <>
                            <View style={{ borderWidth: 1, gap: 12, padding: 8 }}>
                                <TouchableOpacity style={styles.button} onPress={() => setShowFromPicker(true)}>
                                    <Text style={styles.buttonText}>Von: {formatDate(fromDate)}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.button} onPress={() => setShowToPicker(true)}>
                                    <Text style={styles.buttonText}>Bis: {formatDate(toDate)}</Text>
                                </TouchableOpacity>

                                {showFromPicker ? (
                                    <DateTimePicker value={fromDate} mode="date" display="default" onChange={onChangeFrom} />
                                ) : null}

                                {showToPicker ? (
                                    <DateTimePicker value={toDate} mode="date" display="default" onChange={onChangeTo} />
                                ) : null}
                            </View>

                            <Button
                                title={generating ? "Generiere..." : "PDF generieren"}
                                onPress={generatePDFHandle}
                                disabled={generating}
                            />
                            <Button title="Zurück" onPress={() => setMode("view")} />
                        </>
                    ) : null}
                </>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderRadius: 2,
        fontSize: 14,
        backgroundColor: "#1e90ff",
    },
    buttonText: {
        textAlign: "center",
        color: "#fff",
        fontSize: 16,
        fontWeight: 500,
    },
});
