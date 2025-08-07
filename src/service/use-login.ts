import { useMutation } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { instance } from "../hooks/instance";

const loginRequest = async (data: { login: string; password: string }) => {
    const response = await instance().post("/seller/login", data);
    return response.data;
};

export const useLogin = () => {
    const [, setCookie] = useCookies(["token"]);
    return useMutation({
        mutationFn: loginRequest,
        onSuccess: (data) => {
            setCookie("token", data.accessToken);
            window.location.href = "/home"; // Simple redirect for demonstration
        },
        onError: (error: any) => {
            console.error("Login failed:", error);
            alert(
                "Login failed: " +
                    (error.response?.data?.message || error.message)
            );
        },
    });
};

// New query for fetching seller data by ID
export const fetchSellerData = async (sellerId: number) => {
    const response = await instance().get(`/seller/${sellerId}`);
    console.log(response);
    
    return response.data;
};

// New query for fetching monthly total
export const fetchMonthTotal = async () => {
    const response = await instance().get("/seller/month-total");
    return response.data;
};

// New query for fetching late customers
export const fetchlateDebtors = async () => {
    const response = await instance().get("/seller/late-customers");
    // Return the full data object as per the interface expectation in Home.tsx
    return response.data;
};

export const fetchAllCustomers = async () => {
    const response = await instance().get("/debtor");
    // Assuming response.data is an array of debtors, return its length
    return response.data.length;
};
