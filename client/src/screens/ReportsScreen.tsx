import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Text, View, FlatList, Pressable } from "react-native";
import { fetchReports, fetchReportsBySupplierId, Report } from "../api/reports";
import { fetchSuppliers, Supplier } from "../api/suppliers";

export function ReportsScreen() {
    const navigation = useNavigation<any>();

    const [reports, setReports] = useState<Report[]>();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);

    const mixedMenu = [{ _id: "000", title: "Alle" }, ...suppliers];
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    async function load() {
        try {
            setError(null);
            setLoading(false);
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
            setLoading(false);
            setReports(await fetchReportsBySupplierId(supplierId));
        } catch (err: any) {
            console.log(`Could not fetch supplier by id ${err.message}`);
            setError(err.message || "Failed to load reports");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        loadSuppliers();
    }, []);

    return (
        <View style={{ padding: 16, gap: 12 }}>
            {loading ? <Text>Loading...</Text> : null}
            <View style={{}}>
                <FlatList
                    data={mixedMenu}
                    horizontal
                    keyExtractor={(s) => s._id}
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={item._id === "000" ? () => load() : () => loadReportsBySupplierId(item._id)}
                            style={{ padding: 8, marginRight: 8, borderWidth: 1, borderRadius: 10 }}
                        >
                            <Text style={{ fontWeight: "600" }}>{item.title}</Text>
                        </Pressable>
                    )}
                />
            </View>

            <FlatList
                data={reports}
                keyExtractor={(r) => r._id}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => navigation.navigate("ReportDetails", { reportId: item._id })}
                        style={{ paddingVertical: 8, borderBottomWidth: 1 }}
                    >
                        <Text style={{ fontWeight: "600" }}>{item.title}</Text>
                        <Text>{item.createdAt}</Text>
                    </Pressable>
                )}
            />
        </View>
    );
}
