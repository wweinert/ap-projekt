import { useCallback, useState } from "react";
import { fetchSuppliers, Supplier, createSupplier } from "../api/suppliers";
import { View, Text, FlatList, Pressable, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";

export function SuppliersScreen() {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);

    const [title, setTitle] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        try {
            setError(null);
            setLoading(true);
            setSuppliers(await fetchSuppliers());
        } catch (err: any) {
            console.error("Failed to load suppliers:", err.message);
            setError(err.message || "Failed to load suppliers");
        } finally {
            setLoading(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            load();
        }, []),
    );

    async function onCreate() {
        try {
            setError(null);
            if (!title.trim()) {
                setError("Title is required");
                return;
            }
            setSaving(true);

            await createSupplier({ title, contactEmail, phone, notes });
            setTitle("");
            setContactEmail("");
            setPhone("");
            setNotes("");
            await load();
        } catch (err: any) {
            setError(err.message || "Failed to create supplier");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <View style={styles.screen}>
                <Text style={styles.loadingText}>Loading suppliers...</Text>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {user?.role === "admin" ? (
                <View style={styles.formBlock}>
                    <Text style={styles.sectionTitle}>Lieferant erstellen</Text>
                    <TextInput
                        placeholder="Name"
                        value={title}
                        onChangeText={setTitle}
                        style={styles.input}
                        placeholderTextColor="#9ca3af"
                    />
                    <TextInput
                        placeholder="Kontakt-E-Mail"
                        value={contactEmail}
                        onChangeText={setContactEmail}
                        style={styles.input}
                        placeholderTextColor="#9ca3af"
                    />
                    <TextInput
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Telefon"
                        keyboardType="numeric"
                        style={styles.input}
                        placeholderTextColor="#9ca3af"
                    />
                    <TextInput
                        placeholder="Notizen"
                        value={notes}
                        onChangeText={setNotes}
                        style={[styles.input, styles.textarea]}
                        multiline
                        numberOfLines={3}
                        placeholderTextColor="#9ca3af"
                        textAlignVertical="top"
                    />
                    <TouchableOpacity
                        style={[styles.primaryButton, saving && styles.primaryButtonDisabled]}
                        onPress={onCreate}
                        disabled={saving}
                    >
                        <Text style={styles.primaryButtonText}>{saving ? "Speichern..." : "Lieferant hinzufügen"}</Text>
                    </TouchableOpacity>
                </View>
            ) : null}

            <Text style={styles.sectionTitle}>Lieferanten</Text>

            <FlatList
                data={suppliers}
                keyExtractor={(s) => s._id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => navigation.navigate("SupplierDetails", { supplierId: item._id })}
                        style={[styles.listItem, !item.isActive && styles.listItemInactive]}
                        disabled={!item.isActive && user?.role === "employee"}
                    >
                        <View style={styles.listRowTop}>
                            <Text style={styles.listTitle}>{item.title}</Text>
                            <Text style={styles.listArrow}>{">"}</Text>
                        </View>
                        {item.contactEmail ? <Text style={styles.listSubText}>{item.contactEmail}</Text> : null}
                        {item.notes ? <Text style={styles.listSubText}>{item.notes}</Text> : null}
                    </Pressable>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#f3f4f6",
        padding: 16,
        gap: 10,
    },
    loadingText: {
        color: "#6b7280",
        fontSize: 13,
    },
    errorText: {
        color: "#dc2626",
        fontSize: 13,
    },
    formBlock: {
        gap: 8,
    },
    sectionTitle: {
        color: "#4b5563",
        fontSize: 15,
        fontWeight: "600",
        marginTop: 2,
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
    primaryButton: {
        minHeight: 46,
        borderRadius: 8,
        backgroundColor: "#1d72f3",
        justifyContent: "center",
        alignItems: "center",
    },
    primaryButtonDisabled: {
        opacity: 0.75,
    },
    primaryButtonText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "600",
    },
    listContent: {
        gap: 10,
        paddingBottom: 16,
    },
    listItem: {
        borderWidth: 1,
        borderColor: "#cfd4dc",
        borderRadius: 8,
        backgroundColor: "#ffffff",
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 3,
    },
    listItemInactive: {
        backgroundColor: "#f8fafc",
        opacity: 0.6,
    },
    listRowTop: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    listTitle: {
        color: "#1f2937",
        fontSize: 15,
        fontWeight: "600",
    },
    listArrow: {
        color: "#6b7280",
        fontSize: 18,
    },
    listSubText: {
        color: "#6b7280",
        fontSize: 13,
    },
});
