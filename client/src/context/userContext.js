import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    const logout = (navigate) => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("loginTime");
        localStorage.removeItem("user");
        if (navigate) navigate("/");
    };

    const handleLogin = (userData, token) => {
        localStorage.setItem("token", token);
        localStorage.setItem("loginTime", Date.now().toString());
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setToken(token);
    };

    // Restore user state on app initialization
    useEffect(() => {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");
        const loginTime = localStorage.getItem("loginTime");

        if (token && savedUser && loginTime) {
            try {
                const timeElapsed = Date.now() - parseInt(loginTime, 10);
                const oneDay = 24 * 60 * 60 * 1000;

                if (timeElapsed > oneDay) {
                    // Log out if token is older than 24 hours
                    logout();
                } else {
                    // Restore the user state
                    const parsedUser = JSON.parse(savedUser);
                    setUser(parsedUser);
                    setToken(token);
                    // Refresh the login time
                    localStorage.setItem("loginTime", Date.now().toString());
                }
            } catch (error) {
                console.error("Failed to restore user state:", error.message);
                logout();
            }
        }
    }, []); // Run once when the app initializes

    useEffect(() => {
        const checkUserStatus = async () => {
            if (!token) return;

            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_ENDPOINT}/courses/user`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                setUser({
                    id: response.data.id,
                    email: response.data.email,
                    isAdmin: response.data.is_admin,
                    isSubscribed: response.data.subscription_status,
                });

                // Refresh login time
                localStorage.setItem("loginTime", Date.now().toString());
            } catch (error) {
                console.error("Failed to verify user:", error.message);
                logout();
            }
        };

        checkUserStatus();
    }, [token]);

    return (
        <UserContext.Provider
            value={{
                user,
                token,
                setUser,
                logout,
                handleLogin,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};
