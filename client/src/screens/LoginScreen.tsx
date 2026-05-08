import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export function LoginScreen() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        try {
            setError("");
            setLoading(true);

            await login(email, password);

            setEmail("");
            setPassword("");
        } catch (err: any) {
            setError(err.message ?? "Login fehlgeschlagen");
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.screen}>
            <View style={styles.form}>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <Text style={styles.label}>E-Mail</Text>
                <View style={styles.inputWrap}>
                    <Text style={styles.inputIcon}>✉</Text>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        style={styles.input}
                        placeholder=" "
                        placeholderTextColor="#9ca3af"
                    />
                </View>

                <Text style={styles.label}>Passwort</Text>
                <View style={styles.inputWrap}>
                    <Text style={styles.inputIcon}>⌂</Text>
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        style={styles.input}
                        placeholder=" "
                        placeholderTextColor="#9ca3af"
                    />
                </View>

                <Pressable style={[styles.loginButton, loading && styles.loginButtonDisabled]} onPress={handleLogin} disabled={loading}>
                    {loading ? <ActivityIndicator size="small" color="#ffffff" /> : <Text style={styles.loginButtonText}>Einloggen</Text>}
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#f3f4f6",
        padding: 16,
        justifyContent: "flex-start",
    },
    form: {
        width: "100%",
        gap: 10,
    },
    errorText: {
        color: "#dc2626",
        marginBottom: 2,
        fontSize: 13,
    },
    label: {
        color: "#4b5563",
        fontSize: 15,
        fontWeight: "600",
        marginTop: 4,
    },
    inputWrap: {
        minHeight: 46,
        borderWidth: 1,
        borderColor: "#cfd4dc",
        borderRadius: 8,
        backgroundColor: "#ffffff",
        paddingHorizontal: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    inputIcon: {
        color: "#6b7280",
        fontSize: 14,
        width: 16,
        textAlign: "center",
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: "#111827",
        paddingVertical: 8,
    },
    loginButton: {
        marginTop: 10,
        minHeight: 46,
        borderRadius: 8,
        backgroundColor: "#1d72f3",
        alignItems: "center",
        justifyContent: "center",
    },
    loginButtonDisabled: {
        opacity: 0.8,
    },
    loginButtonText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "600",
    },
});
