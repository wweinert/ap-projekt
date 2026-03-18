import { useEffect, useState } from "react";
import { fetchSuppliers, Supplier } from "../api/suppliers";
import { View, Text, FlatList, Pressable } from "react-native";

export function SupplierScreen() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [error, setError] = useState(false);

    const [loading, setLoading] = useState(true);

    async function load() {
        try {
            setError(false);
            setSuppliers(await fetchSuppliers());
        } catch (err: any) {
            console.log(`Could not fetch suppliers ${err.message}`);
        } finally {
            setError(false);
        }
    }

    function selectSupplier() {}

    useEffect(() => {
        load();
    }, []);

    return (
        <>
            <FlatList
                data={suppliers}
                keyExtractor={(s) => s._id}
                renderItem={({ item }) => (
                    <Pressable onPress={selectSupplier} style={{ padding: 4 }}>
                        <Text>{item.title}</Text>
                    </Pressable>
                )}
            />
        </>
    );
}
