import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";

import React, { useEffect, useState } from "react";

export default function Index() {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const fetchToken = async () => {
            const storedToken = await AsyncStorage.getItem("token");
            setToken(storedToken);
        };
        fetchToken();
    }, []);

    return token === '' || token === null
        ? <Redirect href="/login/presentation/Login" />
        : <Redirect href="/home/presentation/HomeScreen" />;
}