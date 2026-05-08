import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { SuppliersScreen } from "./src/screens/SuppliersScreen";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { SupplierDetails } from "./src/screens/SupplierDetails";
import { ReportsScreen } from "./src/screens/ReportsScreen";
import { ReportDetails } from "./src/screens/ReportDetails";
import { CreateReport } from "./src/screens/CreateReport";
import { LoginScreen } from "./src/screens/LoginScreen";

function HomeScreen() {
    const navigation = useNavigation<any>();
    const { logout, user } = useAuth();

    return (
        <View style={styles.screen}>
            <View style={styles.topSection}>
                <TouchableOpacity style={styles.infoRow} onPress={logout}>
                    <Text style={styles.rowLabel}>Ausloggen</Text>
                    <Text style={styles.rowValue}>{">"}</Text>
                </TouchableOpacity>
                <View style={styles.infoRow}>
                    <Text style={styles.rowLabel}>Angemeldet als</Text>
                    <Text style={styles.rowValue}>
                        {user?.name ?? "-"} ({user?.role ?? "-"})
                    </Text>
                </View>
            </View>

            <TouchableOpacity style={styles.plusButton} onPress={() => navigation.navigate("CreateReport")}>
                <Text style={styles.plusSymbol}>+</Text>
            </TouchableOpacity>

            <View style={styles.bottomSection}>
                <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate("SuppliersScreen")}>
                    <Text style={styles.menuText}>Lieferanten</Text>
                    <Text style={styles.menuArrow}>{">"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate("ReportsScreen")}>
                    <Text style={styles.menuText}>Berichte</Text>
                    <Text style={styles.menuArrow}>{">"}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const Stack = createNativeStackNavigator();

export function RootLayout() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ justifyContent: "center", alignItems: "center", width: "100%" }}>
                <ActivityIndicator size={"large"} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {!isAuthenticated ? (
                <Stack.Navigator>
                    <Stack.Screen name="Login" options={{ title: "Einloggen" }} component={LoginScreen} />
                </Stack.Navigator>
            ) : (
                <Stack.Navigator>
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="SuppliersScreen" options={{ title: "Lieferanten" }} component={SuppliersScreen} />
                    <Stack.Screen name="SupplierDetails" options={{ title: "Lieferantendetails" }} component={SupplierDetails} />
                    <Stack.Screen name="ReportsScreen" options={{ title: "Berichte" }} component={ReportsScreen} />
                    <Stack.Screen name="ReportDetails" options={{ title: "Berichtsdetails" }} component={ReportDetails} />
                    <Stack.Screen name="CreateReport" options={{ title: "Bericht erstellen" }} component={CreateReport} />
                </Stack.Navigator>
            )}
        </NavigationContainer>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <RootLayout></RootLayout>
        </AuthProvider>
    );
}
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#f3f4f6",
        padding: 22,
        paddingBottom: 32,
        justifyContent: "space-between",
    },
    topSection: {
        gap: 10,
    },
    infoRow: {
        minHeight: 42,
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 10,
        backgroundColor: "#ffffff",
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    rowLabel: {
        color: "#374151",
        fontSize: 14,
    },
    rowValue: {
        color: "#6b7280",
        fontSize: 13,
    },
    plusButton: {
        alignSelf: "center",
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#eef1f5",
        justifyContent: "center",
        alignItems: "center",
    },
    plusSymbol: {
        fontSize: 56,
        color: "#2563eb",
        lineHeight: 58,
        fontWeight: "300",
    },
    bottomSection: {
        gap: 10,
    },
    menuRow: {
        minHeight: 46,
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 10,
        backgroundColor: "#ffffff",
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    menuText: {
        color: "#1f2937",
        fontSize: 15,
    },
    menuArrow: {
        color: "#6b7280",
        fontSize: 18,
    },
});
