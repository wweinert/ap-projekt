import { Platform } from "react-native";

// const HOST = Platform.OS === "web" ? "localhost" : "192.168.10.91"; // 91.99.224.106 PC
const HOST = Platform.OS === "web" ? "91.99.224.106" : "192.168.10.91"; // 91.99.224.106 PC | 
// const HOST = "192.168.10.91"; // 91.99.224.106 PC | 

export const API_BASE_URL = `http://${HOST}:3011`;
