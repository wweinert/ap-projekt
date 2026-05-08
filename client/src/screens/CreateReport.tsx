import React, { useCallback, useState } from "react";
import { View, Text, TextInput, Pressable, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

import { fetchSuppliers, Supplier } from "../api/suppliers";
import { createReport } from "../api/reports";
import { Image } from "expo-image";

export function CreateReport() {
    const navigation = useNavigation<any>();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<"OK" | "DEFECT">("OK");
    const [images, setImages] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function loadSuppliers() {
        try {
            setError(null);

            const data = await fetchSuppliers();
            setSuppliers(data);

            setSelectedSupplier((current) => {
                if (!current) {
                    return null;
                }

                const freshSelectedSupplier = data.find((supplier) => supplier._id === current._id);

                return freshSelectedSupplier?.isActive === true ? freshSelectedSupplier : null;
            });
        } catch (err: any) {
            setError(err.message ?? "Lieferanten konnten nicht geladen werden");
        }
    }

    async function pickFromLibrary() {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Alert.alert("Berechtigung erforderlich", "Bitte den Zugriff auf die Galerie erlauben.");
            return;
        }

        if (images.length >= 5) {
            Alert.alert("Limit erreicht", "Maximal 5 Bilder pro Bericht");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets?.[0].uri) {
            setImages((current) => [...current, result.assets[0].uri]);
        }
    }

    function removeImage(uri: string) {
        setImages((current) => current.filter((imageUri) => imageUri !== uri));
    }

    async function takePhoto() {
        const permission = await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
            Alert.alert("Berechtigung erforderlich", "Bitte den Zugriff auf die Kamera erlauben.");
            return;
        }

        if (images.length >= 5) {
            Alert.alert("Limit erreicht", "Maximal 5 Bilder pro Bericht");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets?.[0].uri) {
            setImages((current) => [...current, result.assets[0].uri]);
        }
    }

    function chooseMediaOption() {
        Alert.alert("Medien auswaehlen", "Ein neues Foto aufnehmen oder aus der Galerie waehlen?", [
            {
                text: "Aufnehmen",
                onPress: () => takePhoto(),
            },
            { text: "Galerie", onPress: () => pickFromLibrary() },
        ]);
    }

    async function onCreate() {
        try {
            setError(null);

            if (!selectedSupplier) {
                setError("Bitte einen Lieferanten auswaehlen");
                return;
            }

            if (!title.trim()) {
                setError("Titel ist erforderlich");
                return;
            }

            setLoading(true);

            await createReport({
                title: title.trim(),
                description: description.trim(),
                supplierId: selectedSupplier._id,
                status,
                images,
            });

            setTitle("");
            setDescription("");
            setSelectedSupplier(null);
            setStatus("OK");
            setImages([]);

            if (Platform.OS === "web") navigation.navigate("ReportsScreen");

            Alert.alert("Erfolg", "Der Pruefbericht wurde erstellt.", [
                { text: "OK", onPress: () => navigation.navigate("ReportsScreen") },
            ]);
        } catch (err: any) {
            setError(err.message ?? "Bericht konnte nicht erstellt werden");
        } finally {
            setLoading(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            loadSuppliers();
        }, []),
    );

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Text style={styles.label}>Titel</Text>
            <TextInput value={title} onChangeText={setTitle} placeholder=" " style={styles.input} placeholderTextColor="#9ca3af" />

            <Text style={styles.label}>Beschreibung</Text>
            <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder=" "
                style={[styles.input, styles.textarea]}
                placeholderTextColor="#9ca3af"
                multiline
                textAlignVertical="top"
            />

            <View style={styles.statusRow}>
                <TouchableOpacity
                    style={[styles.statusButton, status === "OK" && styles.statusButtonActive]}
                    onPress={() => setStatus("OK")}
                >
                    <Text style={[styles.statusButtonText, status === "OK" && styles.statusButtonTextActive]}>OK</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.statusButton, status === "DEFECT" && styles.statusButtonActive]}
                    onPress={() => setStatus("DEFECT")}
                >
                    <Text style={[styles.statusButtonText, status === "DEFECT" && styles.statusButtonTextActive]}>DEFEKT</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.label}>Media</Text>
            <Pressable style={styles.rowButton} onPress={Platform.OS === "web" ? pickFromLibrary : chooseMediaOption}>
                <Text style={styles.rowButtonText}>{Platform.OS === "web" ? "Bild aus Galerie waehlen" : "Medien hinzufuegen"}</Text>
                <Text style={styles.rowButtonIcon}>+</Text>
            </Pressable>

            {images.length > 0 ? (
                <ScrollView horizontal contentContainerStyle={styles.imagesRow} showsHorizontalScrollIndicator={false}>
                    {images.map((item) => (
                        <View key={item} style={styles.imageItem}>
                            <Image source={item} style={styles.imagePreview} contentFit="cover" />
                            <Pressable style={styles.removeImageButton} onPress={() => removeImage(item)}>
                                <Text style={styles.removeImageButtonText}>Entfernen</Text>
                            </Pressable>
                        </View>
                    ))}
                </ScrollView>
            ) : (
                <Text style={styles.hintText}>Keine Bilder ausgewaehlt</Text>
            )}

            <Text style={styles.label}>Lieferanten</Text>
            <Pressable style={styles.rowButton} onPress={loadSuppliers}>
                <Text style={styles.rowButtonText}>{selectedSupplier ? selectedSupplier.title : "Lieferanten neu laden / waehlen"}</Text>
                <Text style={styles.rowButtonIcon}>v</Text>
            </Pressable>

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
                        </Pressable>
                    );
                })}
            </View>

            <TouchableOpacity style={[styles.saveButton, loading && styles.saveButtonDisabled]} onPress={onCreate} disabled={loading}>
                <Text style={styles.saveButtonText}>{loading ? "Speichern..." : "Speichern"}</Text>
            </TouchableOpacity>
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
    textarea: {
        minHeight: 88,
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
    rowButton: {
        minHeight: 46,
        borderWidth: 1,
        borderColor: "#cfd4dc",
        borderRadius: 8,
        backgroundColor: "#ffffff",
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    rowButtonText: {
        color: "#374151",
        fontSize: 14,
    },
    rowButtonIcon: {
        color: "#1d72f3",
        fontSize: 18,
    },
    imagesRow: {
        gap: 10,
        paddingTop: 2,
        paddingBottom: 2,
    },
    imageItem: {
        width: 110,
        gap: 6,
    },
    imagePreview: {
        width: 110,
        height: 110,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#d1d5db",
    },
    removeImageButton: {
        minHeight: 30,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#d1d5db",
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
    },
    removeImageButtonText: {
        color: "#4b5563",
        fontSize: 12,
    },
    hintText: {
        color: "#6b7280",
        fontSize: 13,
    },
    supplierList: {
        maxHeight: 200,
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
    saveButton: {
        marginTop: 8,
        minHeight: 46,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#1d72f3",
        backgroundColor: "#eff6ff",
        justifyContent: "center",
        alignItems: "center",
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: "#1d72f3",
        fontSize: 15,
        fontWeight: "600",
    },
});
