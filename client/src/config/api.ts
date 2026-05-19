import { Platform } from "react-native";

// DEV
// const HOST = Platform.OS === "web" ? "localhost" : "192.168.10.91"; //  PC : android || ios | WORK
const HOST = Platform.OS === "web" ? "localhost" : "192.168.178.44";  //  PC : android || ios | HOME

// const HOST = "91.99.224.106" // itnt server
// const HOST2 = "" // pi server

const PORT = "3011";

export const API_BASE_URL = `http://${HOST}:${PORT}`;
