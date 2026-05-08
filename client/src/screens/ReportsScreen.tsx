import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Text, View, FlatList, Pressable, StyleSheet } from "react-native";
import { fetchReports, fetchReportsBySupplierId, Report } from "../api/reports";
import { fetchSuppliers, Supplier } from "../api/suppliers";

export function ReportsScreen() {
    const navigation = useNavigation<any>();

    const [reports, setReports] = useState<Report[]>();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);

    const mixedMenu = [{ _id: "000", title: "Alle" }, ...suppliers];
    const [activeSupplierId, setActiveSupplierId] = useState("000");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    async function load() {
        try {
            setError(null);
            setLoading(true);
            setActiveSupplierId("000");
            setReports(await fetchReports());
        } catch (err: any) {
            console.log(`Could not fetch supplier by id ${err.message}`);
            setError(err.message || "Failed to load reports");
        } finally {
            setLoading(false);
        }
    }

    async function loadSuppliers() {
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

    async function loadReportsBySupplierId(supplierId: string) {
        try {
            setError(null);
            setLoading(true);
            setActiveSupplierId(supplierId);
            setReports(await fetchReportsBySupplierId(supplierId));
        } catch (err: any) {
            console.log(`Could not fetch supplier by id ${err.message}`);
            setError(err.message || "Failed to load reports");
        } finally {
            setLoading(false);
        }
    }

    function formatDate(dateString: string) {
        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return new Intl.DateTimeFormat("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    }

    useFocusEffect(
        useCallback(() => {
            load();
            loadSuppliers();
        }, []),
    );

    return (
        <View style={styles.screen}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {loading ? <Text style={styles.loadingText}>Loading...</Text> : null}

            <View style={styles.filtersWrap}>
                <FlatList
                    data={mixedMenu}
                    horizontal
                    keyExtractor={(s) => s._id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersContent}
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={item._id === "000" ? () => load() : () => loadReportsBySupplierId(item._id)}
                            style={[styles.filterChip, activeSupplierId === item._id && styles.filterChipActive]}
                        >
                            <Text style={[styles.filterChipText, activeSupplierId === item._id && styles.filterChipTextActive]}>
                                {item.title}
                            </Text>
                        </Pressable>
                    )}
                />
            </View>

            <FlatList
                data={reports}
                keyExtractor={(r) => r._id}
                contentContainerStyle={styles.reportList}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => navigation.navigate("ReportDetails", { reportId: item._id, supplierId: item.supplierId })}
                        style={styles.reportItem}
                    >
                        <View style={styles.reportMainRow}>
                            <View style={styles.reportIconWrap}>
                                <Text style={styles.reportIcon}>[]</Text>
                            </View>
                            <View style={styles.reportTextWrap}>
                                <Text style={styles.reportTitle}>{item.title}</Text>
                                <Text style={styles.reportDate}>{formatDate(item.createdAt)}</Text>
                            </View>
                            <Text style={styles.reportArrow}>{">"}</Text>
                        </View>
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
    errorText: {
        color: "#dc2626",
        fontSize: 13,
    },
    loadingText: {
        color: "#6b7280",
        fontSize: 13,
    },
    filtersWrap: {
        minHeight: 46,
    },
    filtersContent: {
        gap: 8,
        paddingRight: 4,
    },
    filterChip: {
        minHeight: 38,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#cfd4dc",
        backgroundColor: "#ffffff",
        justifyContent: "center",
    },
    filterChipActive: {
        borderColor: "#1d72f3",
        backgroundColor: "#eff6ff",
    },
    filterChipText: {
        color: "#4b5563",
        fontSize: 14,
        fontWeight: "600",
    },
    filterChipTextActive: {
        color: "#1d72f3",
    },
    reportList: {
        gap: 10,
        paddingBottom: 16,
    },
    reportItem: {
        borderWidth: 1,
        borderColor: "#cfd4dc",
        borderRadius: 8,
        backgroundColor: "#ffffff",
        paddingHorizontal: 10,
        paddingVertical: 12,
    },
    reportMainRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    reportIconWrap: {
        width: 26,
        alignItems: "center",
    },
    reportIcon: {
        color: "#6b7280",
        fontSize: 14,
        fontWeight: "600",
    },
    reportTextWrap: {
        flex: 1,
        gap: 2,
        paddingHorizontal: 6,
    },
    reportTitle: {
        color: "#1f2937",
        fontSize: 15,
        fontWeight: "600",
    },
    reportDate: {
        color: "#6b7280",
        fontSize: 13,
    },
    reportArrow: {
        color: "#6b7280",
        fontSize: 18,
    },
});
