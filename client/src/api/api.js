import axios from "axios";

const API = axios.create({
    baseURL: `${process.env.REACT_APP_API_ENDPOINT}`,
    withCredentials: true,
});

export const loginUser = (credentials) =>
    API.post("/courses/login", credentials);
export const subscribeUser = (userData) =>
    API.post("/courses/subscribe", userData);
export const createSubscription = (subscriptionData) =>
    API.post("/courses/create-subscription", subscriptionData);
export const getProgress = (token) => API.get("/courses/progress");
