import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const logout = async (navigate) => {
        try {
            await axios.post(
                `${process.env.REACT_APP_API_ENDPOINT}/courses/logout`,
                {},
                { withCredentials: true }
            );
        } catch (error) {
            console.error("Logout request failed:", error.message);
        } finally {
            setUser(null);
            if (navigate) navigate("/");
        }
    };

    const handleLogin = (userData) => {
        setUser(userData);
    };
    useEffect(() => {
        const checkUserStatus = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_ENDPOINT}/courses/user`,
                    { withCredentials: true }
                );

                setUser({
                    id: response.data.id,
                    email: response.data.email,
                    is_admin: response.data.is_admin,
                    isSubscribed: response.data.subscription_status,
                    subscriptionType: response.data.subscription_type, // 👈 ADD THIS
                });
            } catch (error) {
                console.error("User verification failed:", error.message);
                setUser(null);
            }
        };

        checkUserStatus();
    }, []);

    useEffect(() => {
        if (!user) return;

        let timeout;

        const resetTimer = () => {
            clearTimeout(timeout);
            timeout = setTimeout(
                () => {
                    console.log("Logging out due to inactivity");
                    logout(); 
                },
                60 * 60 * 1000
            ); // 1 hour
        };

        // Track user activity
        window.addEventListener("mousemove", resetTimer);
        window.addEventListener("keydown", resetTimer);
        window.addEventListener("click", resetTimer);

        resetTimer(); // start timer

        return () => {
            clearTimeout(timeout);
            window.removeEventListener("mousemove", resetTimer);
            window.removeEventListener("keydown", resetTimer);
            window.removeEventListener("click", resetTimer);
        };
    }, [user]);

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                logout,
                handleLogin,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};
