import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button } from "react-native";
import { SupplierScreen } from "./src/screens/SuppliersScreen";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

function HomeScreen() {
    const navigation = useNavigation();
    return (
        <View style={{ padding: 16, gap: 12 }}>
            <Button title={"Lieferanten"} onPress={() => navigation.navigate("Suppliers")} />
            <Button title={"Berichte"} onPress={() => navigation.navigate("Supplier")} />
            <Button title={"Bericht erfassen"} onPress={() => navigation.navigate("Supplier")} />
            <Button title={"Ausloggen"} onPress={() => navigation.navigate("Supplier")} />
        </View>
    );
}

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Suppliers" component={SupplierScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
