import { useEffect, useState } from "react";
import { fetchSuppliers, Supplier } from "../api/suppliers";
import { View, Text } from "react-native";

export function SupplierScreen() {
    const [suppliers, setSuppliers] = useState([]);

    async function load() {
        try {
            setSuppliers(await fetchSuppliers());
        } catch (err: any) {
            console.log(`Could not fetch suppliers ${err.message}`);
        }
    }

    useEffect(() => {
        load();
    }, []);

    return (
        <>
            <View>
                <Text>{suppliers}</Text>
            </View>
        </>
    );
}
