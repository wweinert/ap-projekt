import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { SupplierScreen } from "./src/screens/SuppliersScreen";

export default function App() {
    return (
        <View style={styles.container}>
            <SupplierScreen />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
});
