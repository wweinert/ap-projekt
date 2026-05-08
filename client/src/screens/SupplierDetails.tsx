import { Text, TextInput, View, StyleSheet, TouchableOpacity, Platform, Alert, ScrollView } from "react-native";
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

    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);

    const [generating, setGenerating] = useState(false);

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

    async function cancelUpdating() {
        try {
            const data = await fetchSupplierById(supplierId);
            applySupplierData(data);
        } catch (err: any) {
            setError(err.message ?? "Aktualisierung des Lieferanten fehlgeschlagen");
        }
    }

    function formatDate(value: Date) {
        return value.toISOString().slice(0, 10);
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
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" style={styles.screen}>
            {loading ? <Text style={styles.loadingText}>Loading...</Text> : null}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {!loading ? (
                <>
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder=" "
                        style={[styles.input, !isEditMode && styles.inputReadonly]}
                        editable={isEditMode}
                        placeholderTextColor="#9ca3af"
                    />

                    <Text style={styles.label}>Kontakt-E-Mail</Text>
                    <TextInput
                        value={contactEmail}
                        onChangeText={setContactEmail}
                        placeholder=" "
                        autoCapitalize="none"
                        style={[styles.input, !isEditMode && styles.inputReadonly]}
                        editable={isEditMode}
                        placeholderTextColor="#9ca3af"
                    />

                    <Text style={styles.label}>Telefon</Text>
                    <TextInput
                        value={phone}
                        onChangeText={setPhone}
                        placeholder=" "
                        keyboardType="numeric"
                        style={[styles.input, !isEditMode && styles.inputReadonly]}
                        editable={isEditMode}
                        placeholderTextColor="#9ca3af"
                    />

                    <Text style={styles.label}>Notizen</Text>
                    <TextInput
                        value={notes}
                        onChangeText={setNotes}
                        placeholder=" "
                        multiline
                        numberOfLines={4}
                        style={[styles.input, styles.textarea, !isEditMode && styles.inputReadonly]}
                        editable={isEditMode}
                        placeholderTextColor="#9ca3af"
                        textAlignVertical="top"
                    />

                    <View style={styles.statusRow}>
                        <TouchableOpacity
                            style={[styles.statusButton, isActive && styles.statusButtonActive]}
                            onPress={() => setIsActive(true)}
                            disabled={!isEditMode}
                        >
                            <Text style={[styles.statusButtonText, isActive && styles.statusButtonTextActive]}>AKTIV</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.statusButton, !isActive && styles.statusButtonActive]}
                            onPress={() => setIsActive(false)}
                            disabled={!isEditMode}
                        >
                            <Text style={[styles.statusButtonText, !isActive && styles.statusButtonTextActive]}>INAKTIV</Text>
                        </TouchableOpacity>
                    </View>

                    {mode === "view" ? (
                        <View style={styles.actionStack}>
                            {user?.role === "admin" ? (
                                <TouchableOpacity style={styles.primaryButton} onPress={() => setMode("edit")}>
                                    <Text style={styles.primaryButtonText}>Bearbeiten</Text>
                                </TouchableOpacity>
                            ) : null}
                            <TouchableOpacity style={styles.secondaryButton} onPress={() => setMode("pdf")}>
                                <Text style={styles.secondaryButtonText}>PDF erstellen</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    {mode === "edit" ? (
                        <View style={styles.twoColActions}>
                            <TouchableOpacity onPress={updateSupplierHandle} disabled={saving} style={styles.primaryHalfButton}>
                                <Text style={styles.primaryButtonText}>{saving ? "Speichern..." : "Aktualisieren"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={async () => {
                                    await cancelUpdating();
                                    setMode("view");
                                }}
                                disabled={saving}
                                style={styles.dangerHalfButton}
                            >
                                <Text style={styles.dangerButtonText}>Abbrechen</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    {mode === "pdf" ? (
                        <>
                            <View style={styles.pdfBox}>
                                <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowFromPicker(true)}>
                                    <Text style={styles.secondaryButtonText}>Von: {formatDate(fromDate)}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowToPicker(true)}>
                                    <Text style={styles.secondaryButtonText}>Bis: {formatDate(toDate)}</Text>
                                </TouchableOpacity>

                                {showFromPicker ? <DateTimePicker value={fromDate} mode="date" display="default" onChange={onChangeFrom} /> : null}
                                {showToPicker ? <DateTimePicker value={toDate} mode="date" display="default" onChange={onChangeTo} /> : null}
                            </View>

                            <TouchableOpacity style={styles.primaryButton} onPress={generatePDFHandle} disabled={generating}>
                                <Text style={styles.primaryButtonText}>{generating ? "Generiere..." : "PDF generieren"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.secondaryButton} onPress={() => setMode("view")}>
                                <Text style={styles.secondaryButtonText}>Zurück</Text>
                            </TouchableOpacity>
                        </>
                    ) : null}

                    <Text style={styles.hintText}>ID: {supplier?._id ?? "-"}</Text>
                </>
            ) : null}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#f3f4f6",
    },
    content: {
        padding: 16,
        gap: 10,
        paddingBottom: 32,
    },
    loadingText: {
        color: "#6b7280",
        fontSize: 13,
    },
    errorText: {
        color: "#dc2626",
        fontSize: 13,
    },
    label: {
        color: "#4b5563",
        fontSize: 15,
        fontWeight: "600",
        marginTop: 4,
    },
    input: {
        minHeight: 46,
        borderWidth: 1,
        borderColor: "#cfd4dc",
        borderRadius: 8,
        backgroundColor: "#ffffff",
        paddingHorizontal: 12,
        color: "#111827",
        fontSize: 15,
    },
    inputReadonly: {
        backgroundColor: "#f8fafc",
        color: "#4b5563",
    },
    textarea: {
        minHeight: 90,
        paddingTop: 10,
        paddingBottom: 10,
    },
    statusRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },
    statusButton: {
        flex: 1,
        minHeight: 44,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#cfd4dc",
        backgroundColor: "#eef1f5",
        justifyContent: "center",
        alignItems: "center",
    },
    statusButtonActive: {
        borderColor: "#1d72f3",
        backgroundColor: "#eff6ff",
    },
    statusButtonText: {
        color: "#6b7280",
        fontSize: 14,
        fontWeight: "600",
    },
    statusButtonTextActive: {
        color: "#1d72f3",
    },
    actionStack: {
        gap: 8,
        marginTop: 6,
    },
    primaryButton: {
        minHeight: 46,
        borderRadius: 8,
        backgroundColor: "#1d72f3",
        justifyContent: "center",
        alignItems: "center",
    },
    primaryButtonText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "600",
    },
    secondaryButton: {
        minHeight: 46,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#cfd4dc",
        backgroundColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
    },
    secondaryButtonText: {
        color: "#374151",
        fontSize: 15,
        fontWeight: "600",
    },
    twoColActions: {
        flexDirection: "row",
        gap: 10,
        justifyContent: "space-between",
    },
    primaryHalfButton: {
        flex: 1,
        minHeight: 44,
        borderRadius: 8,
        backgroundColor: "#1d72f3",
        justifyContent: "center",
        alignItems: "center",
    },
    dangerHalfButton: {
        flex: 1,
        minHeight: 44,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ef4444",
        backgroundColor: "#fee2e2",
        justifyContent: "center",
        alignItems: "center",
    },
    dangerButtonText: {
        color: "#b91c1c",
        fontSize: 15,
        fontWeight: "600",
    },
    pdfBox: {
        borderWidth: 1,
        borderColor: "#cfd4dc",
        borderRadius: 8,
        backgroundColor: "#ffffff",
        padding: 10,
        gap: 10,
    },
    hintText: {
        color: "#9ca3af",
        fontSize: 12,
        marginTop: 4,
    },
});
