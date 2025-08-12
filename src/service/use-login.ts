import { useMutation } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { instance } from "../hooks/instance";

const loginRequest = async (data: { login: string; password: string }) => {
    const response = await instance().post("/seller/login", data);
    // Assuming accessToken is nested under 'data' key in the response
    return response.data.data;
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

export const fetchingAllDEbtsTotal = async () => {
    const response = await instance().get("/seller/all-total-debt-price");
    return response.data.totalDebtPrice;
};

export const fetchSeller = async () => {
    const response = await instance().get("/seller/dates");
    return response.data;
};

export const payWallet = async (money: number) => {
    const response = await instance().post("/seller/payment", { money });
    return response.data;
};

// Mijozlar ro'yxatini olish
export const fetchClients = async () => {
    const response = await instance().get("/debtor");
    return response.data; // API'dan to'liq ro'yxat qaytariladi
};

// Mijoz yaratish
export const createClient = async (data: {
    name: string;
    phoneNumbers: string[];
    address?: string;
    note?: string;
    images?: string[];
}) => {
    const response = await instance().post("/debtor", data);
    return response.data;
};

// Rasm yuklash (POST)
export const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await instance().post("/multer/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    // API to'g'ridan-to'g'ri file manzilini qaytarsa, uni to'liq URL bilan qaytaramiz
    if (response.data?.url) {
        return {
            url: `http://18.159.45.32/${response.data.url}`,
            path: response.data.url, // agar keyinchalik path kerak bo'lsa
        };
    }
    return response.data;
};

// Rasmni GET qilish (yuklangan fayl manzili orqali)
export const getUploadedFile = async (filePath: string) => {
    const response = await instance().get(`/multer/${filePath}`, {
        responseType: "blob",
    });
    return response.data; // Bu blob qaytaradi
};

// Debtor ma'lumotlarini ID bo'yicha olish
export const fetchDebtorById = async (id: number) => {
    const response = await instance().get(`/debtor/${id}`);
    return response.data;
};

// Borrowed Product ma'lumotlarini ID bo'yicha olish
export const fetchBorrowedProductById = async (id: number) => {
    const response = await instance().get(`/borrowed-product/${id}`);
    return response.data;
};

// Interfaces for TypeScript
export interface CreateClientRequest {
    name: string;
    phoneNumbers: string[];
    address?: string;
    note?: string;
    images?: string[];
}

export interface CreateClientResponse {
    id: string;
    name: string;
    phoneNumbers: string[];
    address: string;
    note: string;
    images: string[];
    createdAt: string;
}

export interface UploadImageResponse {
    url: string;
    path?: string;
}

export interface Debtor {
    id: number;
    name: string;
    address: string;
    note: string;
    role: string;
    createAt: string;
    sellerId: number;
    debtor_image: Array<{
        id: number;
        image: string;
        createAt: string;
        debtorId: number;
    }>;
    debtroPhoneNumber: Array<{
        id: number;
        number: string;
        debtorId: number;
        createAt: string;
    }>;
    borrowedProduct: Array<{
        id: number;
        productName: string;
        term: string;
        totalAmount: number;
        note: string;
        debtorId: number;
        monthPayment: number;
        createAt: string;
    }>;
}

export interface BorrowedProduct {
    id: number;
    productName: string;
    term: string;
    totalAmount: number;
    note: string;
    debtorId: number;
    monthPayment: number;
    createAt: string;
    debtor: {
        id: number;
        name: string;
        address: string;
        note: string;
        role: string;
        createAt: string;
        sellerId: number;
    };
    borrowedProductImage: Array<{
        id: number;
        image: string;
        borrowedProductId: number;
        createAt: string;
    }>;
    paymentHistory: any[];
}

// Fixed import path to use correct instance location

// Create borrowed product with images
export const createBorrowedProduct = async (data: {
    productName: string;
    term: string;
    totalAmount: number;
    note?: string;
    debtorId: number;
    images: string[];
}) => {
    const response = await instance().post("/borrowed-product", data);
    return response.data;
};

// Delete borrowed product
export const deleteBorrowedProduct = async (id: number) => {
    const response = await instance().delete(`/borrowed-product/${id}`);
    return response.data;
};

// Update debtor
export const updateDebtor = async (
    id: number,
    data: {
        name: string;
        phoneNumbers: string[];
        address?: string;
        note?: string;
    }
) => {
    const response = await instance().patch(`/debtor/${id}`, data);
    return response.data;
};

// Update borrowed product
export const updateBorrowedProduct = async (
    id: number,
    data: {
        productName: string;
        term: string;
        totalAmount: number;
        note?: string;
        debtorId: number;
        images: string[];
    }
) => {
    const response = await instance().patch(`/borrowed-product/${id}`, data);
    return response.data;
};
