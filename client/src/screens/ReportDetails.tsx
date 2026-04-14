import {
    Button,
    Text,
    TextInput,
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Pressable,
    Alert,
    Platform,
    ScrollView,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
import { Image } from "expo-image";

// DON'T DELETE. CAMPATIBLE JUST WITH MOBILE DEVICES
// import ImageViewing from "react-native-image-viewing";

import { Report, deleteReport, fetchReportsById, getGeneratedPDF, updateReport } from "../api/reports";
import { fetchSuppliers, Supplier } from "../api/suppliers";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";

export function ReportDetails({ route }: any) {
    const navigation = useNavigation<any>();
    const { reportId, supplierId } = route.params;
    const { user } = useAuth();

    // main states
    const [mode, setMode] = useState<"view" | "edit" | "pdf">("view");
    const isEditMode = mode === "edit";

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // fetch states
    const [report, setReport] = useState<Report | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<"OK" | "DEFECT">();
    const [viewerState, setViewerState] = useState(false);
    const [selectedImgIdx, setSelectedImgIdx] = useState(0);

    // update states
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
            setError(err.message ?? "Failed to load supplier");
        } finally {
            setLoading(false);
        }
    }
    const viewerImages = (report?.images ?? []).map((item) => ({
        uri: `${API_BASE_URL}${item}`,
    }));

    function openViewer(idx: number) {
        setViewerState(true);
        setSelectedImgIdx(idx);
    }

    // update functionality
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

    async function canelUpdating() {
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

    async function deleteReportHandle(reportId: string) {
        try {
            setError(null);
            if (Platform.OS === "web") {
                await deleteReport(reportId);
                navigation.navigate("ReportsScreen");
            } else {
                Alert.alert("Bericht löschen", "Möchten Sie diesen Bericht wirklish löschen?", [
                    {
                        text: "Ablehnen",
                        onPress: () => console.log("Cancel Pressed"),
                        style: "cancel",
                    },
                    {
                        text: "Löschen",
                        onPress: async () => {
                            await deleteReport(reportId);
                            navigation.navigate("ReportsScreen");
                        },
                    },
                ]);
            }
        } catch (err: any) {
            setError(err.message ?? "Löschen fehlgeschlagen");
        }
    }

    useEffect(() => {
        load();
        loadSuppliers();
    }, []);

    return (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
            {loading ? <Text>Loading...</Text> : null}
            {error ? <Text style={{ color: "red" }}>{error}</Text> : null}

            <View style={{ borderWidth: 1, borderColor: "#ccc", minHeight: 42, padding: 8 }}>
                <Text>Erstellt am: {report?.createdAt}</Text>
                <Text>Erstellt von: {report?.createdByName + " " + report?.createdByEmail}</Text>
                <Text>{report?.updatedByEmail && "Aktualisiert von: " + report.updatedByEmail}</Text>
                <Text>Status: {report?.status}</Text>
            </View>

            {!loading ? (
                <>
                    {/* <Text style={{ fontWeight: "600" }}>Titel</Text> */}
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Name des Lieferanten"
                        style={{ borderWidth: 1, padding: 8, borderRadius: 4, borderColor: !isEditMode ? "#ccc" : "black" }}
                        editable={isEditMode}
                    />

                    {/* <Text style={{ fontWeight: "600" }}>Beschreibung</Text> */}
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Beschreibung"
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

                    {report?.images && report.images.length > 0 ? (
                        <>
                            <FlatList
                                data={report.images}
                                horizontal
                                contentContainerStyle={{ gap: 12 }}
                                keyExtractor={(item) => item}
                                renderItem={({ item, index }) => {
                                    const uri = `${API_BASE_URL}${item}`;

                                    return (
                                        <TouchableOpacity onPress={() => openViewer(index)}>
                                            <Image
                                                source={{ uri }}
                                                style={{ width: 140, height: 140, borderColor: "#ccc" }}
                                                contentFit="cover"
                                            />
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                            {/* <ImageViewing
                                images={viewerImages}
                                imageIndex={selectedImgIdx}
                                visible={viewerState}
                                onRequestClose={() => setViewerState(false)}
                            /> */}
                        </>
                    ) : (
                        <Text>Keine Bilder vorhanden</Text>
                    )}

                    {isEditMode && (
                        <>
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        { width: "48%" },
                                        status === "OK" ? { backgroundColor: "grey" } : { backgroundColor: "#ccc" },
                                    ]}
                                    onPress={() => setStatus("OK")}
                                    disabled={!isEditMode}
                                >
                                    <Text style={styles.buttonText}>OK</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        { width: "48%" },
                                        status !== "OK" ? { backgroundColor: "grey" } : { backgroundColor: "#ccc" },
                                    ]}
                                    onPress={() => setStatus("DEFECT")}
                                    disabled={!isEditMode}
                                >
                                    <Text style={styles.buttonText}>DEFECT</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {mode === "view" ? (
                        <View style={{ gap: 8 }}>
                            {user?.role === "admin" ? <Button title="Bearbeiten" onPress={() => setMode("edit")} /> : null}
                            <Button title="PDF erstellen" onPress={() => setMode("pdf")} />
                        </View>
                    ) : null}

                    {mode === "edit" ? (
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <TouchableOpacity
                                onPress={updateReportHandle}
                                disabled={saving}
                                style={[styles.button, { width: "48%", backgroundColor: "green" }]}
                            >
                                <Text style={styles.buttonText}>{saving ? "Speichern..." : "Aktualisieren"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={canelUpdating}
                                disabled={saving}
                                style={[styles.button, { width: "48%", backgroundColor: "red" }]}
                            >
                                <Text style={styles.buttonText}>Abbrechen</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    {mode === "pdf" ? (
                        <View style={{ gap: 8 }}>
                            <Button title="PDF jetzt erstellen" onPress={generatePDF} />
                            <Button title="Zurück" onPress={() => setMode("view")} />
                        </View>
                    ) : null}

                    {user?.role === "admin" && mode === "edit" ? (
                        <TouchableOpacity onPress={() => deleteReportHandle(reportId)} style={[styles.button, { backgroundColor: "red" }]}>
                            <Text style={styles.buttonText}>Löschen</Text>
                        </TouchableOpacity>
                    ) : null}
                </>
            ) : null}

            {isEditMode && (
                <>
                    <Text>Lieferant: {selectedSupplier ? selectedSupplier.title : "None"}</Text>

                    <Text style={{ fontWeight: "600" }}>Hinweis zum Update</Text>
                    <TextInput
                        value={updateNotes}
                        onChangeText={setUpdateNotes}
                        placeholder="Grund für Update"
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

                    <View style={{ maxHeight: 220, borderWidth: 1 }}>
                        {suppliers.map((item) => {
                            const selected = selectedSupplier?._id === item._id;
                            const isSelectable = item.isActive === true;

                            return (
                                <Pressable
                                    key={item._id}
                                    onPress={() => {
                                        if (isSelectable) setSelectedSupplier(item);
                                    }}
                                    disabled={!isSelectable}
                                    style={[
                                        {
                                            padding: 10,
                                            borderBottomWidth: 1,
                                            backgroundColor: selected ? "#eaeaea" : "transparent",
                                            opacity: isSelectable ? 1 : 0.5,
                                        },
                                        !isSelectable && { backgroundColor: "#f1f1f1" },
                                    ]}
                                >
                                    <Text>{item.title}</Text>
                                    {!isSelectable ? <Text>Inaktiv</Text> : null}
                                </Pressable>
                            );
                        })}
                    </View>
                </>
            )}
        </ScrollView>
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
