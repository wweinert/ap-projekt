import { Button, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Report, fetchReportsById } from "../api/reports";
import { useEffect, useState } from "react";

export function ReportDetails({ route }: any) {
    const navigation = useNavigation();
    const { reportId } = route.params;

    const [report, setReport] = useState<Report | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        try {
            setError(null);
            setLoading(true);

            const data = await fetchReportsById(reportId);
            setReport(data);
            setTitle(data.title || "");
            setDescription(data.description || "");
        } catch (err: any) {
            setError(err.message ?? "Failed to load supplier");
        } finally {
            setLoading(false);
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

                    <Text style={{ fontWeight: "600" }}>Beschreibung</Text>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Beschreibung"
                        multiline
                        numberOfLines={4}
                        style={{ borderWidth: 1, padding: 8, borderRadius: 4, minHeight: 90 }}
                    />
                </>
            ) : null}
        </View>
    );
}
