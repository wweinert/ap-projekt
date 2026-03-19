import { StyleSheet, Text, View, Button } from "react-native";
import { SuppliersScreen } from "./src/screens/SuppliersScreen";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SupplierDetails } from "./src/screens/SupplierDetails";
import { ReportsScreen } from "./src/screens/ReportsScreen";
import { ReportDetails } from "./src/screens/ReportDetails";
import { CreateReport } from "./src/screens/CreateReport";

function HomeScreen() {
    const navigation = useNavigation<any>();
    return (
        <View style={{ padding: 16, gap: 12 }}>
            <Button title={"Lieferanten"} onPress={() => navigation.navigate("Lieferanten")} />
            <Button title={"Berichte"} onPress={() => navigation.navigate("Berichte")} />
            <Button title={"Bericht erstellen"} onPress={() => navigation.navigate("Bericht erstellen")} />
            <Button title={"Ausloggen"} onPress={() => console.log("loggout")} />
        </View>
    );
}

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Lieferanten" component={SuppliersScreen} />
                <Stack.Screen name="Lieferantendetails" component={SupplierDetails} />
                <Stack.Screen name="Berichte" component={ReportsScreen} />
                <Stack.Screen name="ReportDetails" component={ReportDetails} />
                <Stack.Screen name="Bericht erstellen" component={CreateReport} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
