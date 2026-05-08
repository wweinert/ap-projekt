import { Text, TextInput, View, StyleSheet, TouchableOpacity, FlatList, Pressable, Alert, Platform, ScrollView } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
import { Image } from "expo-image";

// DON'T DELETE. COMPATIBLE ONLY WITH MOBILE DEVICES
import ImageViewing from "react-native-image-viewing";

import { Report, deleteReport, fetchReportsById, getGeneratedPDF, updateReport } from "../api/reports";
import { fetchSuppliers, Supplier } from "../api/suppliers";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";

export function ReportDetails({ route }: any) {
    const navigation = useNavigation<any>();
    const { reportId, supplierId } = route.params;
    const { user } = useAuth();

    const [mode, setMode] = useState<"view" | "edit" | "pdf">("view");
    const isEditMode = mode === "edit";

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [report, setReport] = useState<Report | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<"OK" | "DEFECT">();
    const [viewerState, setViewerState] = useState(false);
    const [selectedImgIdx, setSelectedImgIdx] = useState(0);

    const [updateNotes, setUpdateNotes] = useState("");
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

    async function load() {
        try {
            setError(null);
            setLoading(true);

            const data = await fetchReportsById(reportId);
            setReport(data);
            setTitle(data.title || "");
            setDescription(data.description || "");
            setStatus(data.status);
            setUpdateNotes(data.updateNotes || "");
        } catch (err: any) {
            setError(err.message ?? "Bericht konnte nicht geladen werden");
        } finally {
            setLoading(false);
        }
    }

    const viewerImages = (report?.images ?? []).map((item) => ({ uri: `${API_BASE_URL}${item}` }));

    function openViewer(idx: number) {
        setViewerState(true);
        setSelectedImgIdx(idx);
    }

    async function loadSuppliers() {
        try {
            setError(null);

            const data = await fetchSuppliers();
            setSuppliers(data);

            const currentSupplierId = typeof supplierId === "string" ? supplierId : supplierId?._id;
            setSelectedSupplier(data.find((supplier) => supplier._id === currentSupplierId) ?? null);
        } catch (err: any) {
            setError(err.message ?? "Lieferanten konnten nicht geladen werden");
        }
    }

    async function updateReportHandle() {
        try {
            setError(null);

            if (!title.trim()) {
                setError("Titel ist erforderlich");
                return;
            }

            if (!updateNotes.trim()) {
                setError("Hinweis zum Update ist erforderlich");
                return;
            }

            setSaving(true);
            await updateReport(reportId, {
                title,
                updateNotes,
                description,
                supplierId: selectedSupplier?._id,
                updatedByEmail: user?.email,
                status,
            });

            setMode("view");
            await load();
        } catch (err: any) {
            setError(err.message ?? "Aktualisierung des Berichts fehlgeschlagen");
        } finally {
            setSaving(false);
        }
    }

    async function cancelUpdating() {
        try {
            setMode("view");
            const data = await fetchReportsById(reportId);
            setReport(data);
            setTitle(data.title || "");
            setDescription(data.description || "");
            setStatus(data.status);
            setUpdateNotes(data.updateNotes || "");
        } catch (err: any) {
            setError(err.message ?? "Aktualisierung des Berichts fehlgeschlagen");
        }
    }

    async function generatePDF() {
        try {
            setError(null);

            const res = await getGeneratedPDF(reportId);
            const fileName = `report_${reportId}.pdf`;
            const localFile = new File(Paths.cache, fileName);

            const bytes = await res.arrayBuffer();
            localFile.write(new Uint8Array(bytes));

            if (Platform.OS !== "web" && (await Sharing.isAvailableAsync())) {
                await Sharing.shareAsync(localFile.uri);
            } else {
                Alert.alert("PDF gespeichert", localFile.uri);
            }
        } catch (err: any) {
            setError(err.message ?? "PDF konnte nicht generiert werden");
        }
    }

    async function deleteReportHandle(id: string) {
        try {
            setError(null);
            if (Platform.OS === "web") {
                await deleteReport(id);
                navigation.navigate("ReportsScreen");
                return;
            }

            Alert.alert("Bericht loeschen", "Moechten Sie diesen Bericht wirklich loeschen?", [
                { text: "Ablehnen", style: "cancel" },
                {
                    text: "Loeschen",
                    onPress: async () => {
                        await deleteReport(id);
                        navigation.navigate("ReportsScreen");
                    },
                },
            ]);
        } catch (err: any) {
            setError(err.message ?? "Loeschen fehlgeschlagen");
        }
    }

    function formatDate(dateString?: string) {
        if (!dateString) return "-";
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return dateString;

        return new Intl.DateTimeFormat("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    }

    useEffect(() => {
        load();
        loadSuppliers();
    }, []);

    return (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" style={styles.screen}>
            {loading ? <Text style={styles.loadingText}>Loading...</Text> : null}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.metaBox}>
                <Text style={styles.metaText}>Erstellt am: {formatDate(report?.createdAt)}</Text>
                <Text style={styles.metaText}>
                    Erstellt von: {report?.createdByName ?? "-"} {report?.createdByEmail ?? ""}
                </Text>
                {report?.updatedByEmail ? <Text style={styles.metaText}>Aktualisiert von: {report.updatedByEmail}</Text> : null}
                <Text style={styles.metaText}>Status: {report?.status === "OK" ? "OK" : "DEFEKT"}</Text>
            </View>

            {!loading ? (
                <>
                    <Text style={styles.label}>Titel</Text>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder=" "
                        style={[styles.input, !isEditMode && styles.inputReadonly]}
                        editable={isEditMode}
                        placeholderTextColor="#9ca3af"
                    />

                    <Text style={styles.label}>Beschreibung</Text>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder=" "
                        multiline
                        style={[styles.input, styles.textarea, !isEditMode && styles.inputReadonly]}
                        editable={isEditMode}
                        placeholderTextColor="#9ca3af"
                        textAlignVertical="top"
                    />

                    <Text style={styles.label}>Bilder</Text>
                    {report?.images && report.images.length > 0 ? (
                        <>
                            <FlatList
                                data={report.images}
                                horizontal
                                contentContainerStyle={styles.imagesRow}
                                keyExtractor={(item) => item}
                                showsHorizontalScrollIndicator={false}
                                renderItem={({ item, index }) => {
                                    const uri = `${API_BASE_URL}${item}`;
                                    return (
                                        <TouchableOpacity onPress={() => openViewer(index)}>
                                            <Image source={{ uri }} style={styles.imagePreview} contentFit="cover" />
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                            <ImageViewing
                                images={viewerImages}
                                imageIndex={selectedImgIdx}
                                visible={viewerState}
                                onRequestClose={() => setViewerState(false)}
                            />
                        </>
                    ) : (
                        <Text style={styles.hintText}>Keine Bilder vorhanden</Text>
                    )}

                    {isEditMode ? (
                        <View style={styles.statusRow}>
                            <TouchableOpacity
                                style={[styles.statusButton, status === "OK" && styles.statusButtonActive]}
                                onPress={() => setStatus("OK")}
                                disabled={!isEditMode}
                            >
                                <Text style={[styles.statusButtonText, status === "OK" && styles.statusButtonTextActive]}>OK</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.statusButton, status === "DEFECT" && styles.statusButtonActive]}
                                onPress={() => setStatus("DEFECT")}
                                disabled={!isEditMode}
                            >
                                <Text style={[styles.statusButtonText, status === "DEFECT" && styles.statusButtonTextActive]}>DEFEKT</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

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
                        <>
                            <Text style={styles.label}>Lieferant</Text>
                            <Text style={styles.hintText}>{selectedSupplier ? selectedSupplier.title : "None"}</Text>

                            <Text style={styles.label}>Hinweis zum Update</Text>
                            <TextInput
                                value={updateNotes}
                                onChangeText={setUpdateNotes}
                                placeholder=" "
                                multiline
                                style={[styles.input, styles.textarea]}
                                editable={isEditMode}
                                placeholderTextColor="#9ca3af"
                                textAlignVertical="top"
                            />

                            <View style={styles.supplierList}>
                                {suppliers.map((item, index) => {
                                    const selected = selectedSupplier?._id === item._id;
                                    const isSelectable = item.isActive === true;
                                    const isLast = index === suppliers.length - 1;

                                    return (
                                        <Pressable
                                            key={item._id}
                                            onPress={() => {
                                                if (isSelectable) setSelectedSupplier(item);
                                            }}
                                            disabled={!isSelectable}
                                            style={[
                                                styles.supplierItem,
                                                selected && styles.supplierItemSelected,
                                                !isSelectable && styles.supplierItemDisabled,
                                                isLast && styles.supplierItemLast,
                                            ]}
                                        >
                                            <Text style={styles.supplierText}>{item.title}</Text>
                                            {!isSelectable ? <Text style={styles.supplierInactive}>Inaktiv</Text> : null}
                                        </Pressable>
                                    );
                                })}
                            </View>

                            <View style={styles.twoColActions}>
                                <TouchableOpacity onPress={updateReportHandle} disabled={saving} style={styles.primaryHalfButton}>
                                    <Text style={styles.primaryButtonText}>{saving ? "Speichern..." : "Aktualisieren"}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={cancelUpdating} disabled={saving} style={styles.dangerHalfButton}>
                                    <Text style={styles.dangerButtonText}>Abbrechen</Text>
                                </TouchableOpacity>
                            </View>

                            {user?.role === "admin" ? (
                                <TouchableOpacity onPress={() => deleteReportHandle(reportId)} style={styles.dangerButton}>
                                    <Text style={styles.dangerButtonText}>Löschen</Text>
                                </TouchableOpacity>
                            ) : null}
                        </>
                    ) : null}

                    {mode === "pdf" ? (
                        <View style={styles.actionStack}>
                            <TouchableOpacity style={styles.primaryButton} onPress={generatePDF}>
                                <Text style={styles.primaryButtonText}>PDF jetzt erstellen</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.secondaryButton} onPress={() => setMode("view")}>
                                <Text style={styles.secondaryButtonText}>Zurück</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}
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
    metaBox: {
        borderWidth: 1,
        borderColor: "#cfd4dc",
        borderRadius: 8,
        backgroundColor: "#ffffff",
        padding: 10,
        gap: 3,
    },
    metaText: {
        color: "#374151",
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
    imagesRow: {
        gap: 10,
    },
    imagePreview: {
        width: 132,
        height: 132,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#d1d5db",
        backgroundColor: "#ffffff",
    },
    hintText: {
        color: "#6b7280",
        fontSize: 13,
    },
    statusRow: {
        flexDirection: "row",
        gap: 10,
        justifyContent: "space-between",
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
    supplierList: {
        maxHeight: 220,
        borderWidth: 1,
        borderColor: "#cfd4dc",
        borderRadius: 8,
        backgroundColor: "#ffffff",
        overflow: "hidden",
    },
    supplierItem: {
        minHeight: 42,
        paddingHorizontal: 12,
        justifyContent: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#eef2f7",
    },
    supplierItemSelected: {
        backgroundColor: "#eff6ff",
    },
    supplierItemDisabled: {
        backgroundColor: "#f8fafc",
        opacity: 0.55,
    },
    supplierItemLast: {
        borderBottomWidth: 0,
    },
    supplierText: {
        color: "#1f2937",
        fontSize: 14,
    },
    supplierInactive: {
        color: "#9ca3af",
        fontSize: 12,
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
    dangerButton: {
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
});
