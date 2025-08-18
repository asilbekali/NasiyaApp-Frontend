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

// New query for fetching monthly total - token parametrini qo'shdim
export const fetchMonthTotal = async (token?: string) => {
    const response = await instance().get("/seller/month-total");
    return response.data;
};

// New query for fetching late customers - token parametrini qo'shdim
export const fetchlateDebtors = async (token?: string) => {
    const response = await instance().get("/seller/late-customers");
    // Return the full data object as per the interface expectation in Home.tsx
    return response.data;
};

// token parametrini qo'shdim
export const fetchAllCustomers = async (token?: string) => {
    const response = await instance().get("/debtor");
    // Assuming response.data is an array of debtors, return its length
    return response.data.length;
};

// token parametrini to'g'riladim - string bo'lishi kerak
export const fetchingAllDEbtsTotal = async (token?: string) => {
    const response = await instance().get("/seller/all-total-debt-price");
    return response.data.totalDebtPrice;
};

// token parametrini qo'shdim
export const fetchSeller = async (token?: string) => {
    const response = await instance().get("/seller/dates");
    return response.data;
};

// Seller profil ma'lumotlarini olish
export const fetchSellerProfile = async () => {
    const response = await instance().get("/seller/profile");
    return response.data.seller;
};

// Seller profil ma'lumotlarini yangilash
export const updateSellerProfile = async (data: {
    name: string;
    password?: string;
    phoneNumber: string;
    email: string;
    image?: string;
}) => {
    // sellerId ni tokendan olish kerak, hozircha 1 deb qo'yamiz
    const response = await instance().patch("/seller/1", {
        ...data,
        status: true, // doim true bo'lishi kerak
    });
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

// Seller Profile Interface
export interface SellerProfile {
    id: number;
    name: string;
    phoneNumber: string;
    email: string;
    image?: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
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
    debtor: Debtor;
    borrowedProductImage: Array<{
        id: number;
        image: string;
        borrowedProductId: number;
        createAt: string;
    }>;
    paymentHistory: any[];
}

// Payment response interfaces
export interface RemainingMonthsResponse {
    borrowedProductId: number;
    debtorId: number;
    totalAmount: number;
    monthPayment: number;
    remainingMonths: number;
}

export interface PaymentResponse {
    message: string;
    remainingAmount: number;
    remainingMonths: number;
}

export interface ReportData {
    id: number;
    message: string;
    sent: boolean;
    sellerId: number;
    debtorId: number;
    createAt: string;
    to: {
        name: string;
    };
}

export interface PaymentHistoryData {
    debtorId: number;
    debtorName: string;
    paymentHistories: Array<{
        paymentId: number;
        borrowedProductId: number;
        borrowedProductName: string;
        amountPaid: number;
        paidAt: string;
    }>;
}

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

// Payment API functions

// 1 oy uchun to'lov so'ndirish
export const payOneMonth = async (data: {
    debtorId: number;
    borrowedProductId: number;
}) => {
    const response = await instance().post(
        "/payment-section/one-month-pay",
        data
    );
    return response.data;
};

// Har qanday miqdorda to'lov so'ndirish
export const payCustomAmount = async (data: {
    debtorId: number;
    borrowedProductId: number;
    amount: number;
}) => {
    const response = await instance().post(
        "/payment-section/pay-as-you-wish",
        data
    );
    return response.data;
};

// Qolgan oylar sonini olish
export const getRemainingMonths = async (data: {
    debtorId: number;
    borrowedProductId: number;
}) => {
    const response = await instance().post(
        "/payment-section/remaining-months",
        data
    );
    return response.data;
};

// Bir necha oyni birdaniga to'lash
export const payMultipleMonths = async (data: {
    debtorId: number;
    borrowedProductId: number;
    monthsToPay: number;
}) => {
    const response = await instance().post(
        "/payment-section/multi-month-pay",
        data
    );
    return response.data;
};

// Reports API function
export const fetchReports = async () => {
    const response = await instance().get("/sen-message-debtor");
    return response.data;
};

export const fetchPaymentHistory = async () => {
    const response = await instance().get("/product-history");
    return response.data;
};

// Xabar yuborish API
export const sendMessageToDebtor = async (data: {
    debtorId: number;
    message: string;
}) => {
    const response = await instance().post("/sen-message-debtor", data);
    return response.data;
};

// Delete all messages of a specific debtor
export const deleteDebtorMessages = async (debtorId: number) => {
    // 1. Barcha xabarlarni olish
    const response = await instance().get("/sen-message-debtor");
    const allMessages: { id: number; debtorId: number }[] = response.data;

    // 2. Faqat tanlangan debtorga tegishli xabarlarni filtrlaymiz
    const messagesToDelete = allMessages.filter((m) => m.debtorId === debtorId);

    // 3. Har bir xabarni o'chirish
    await Promise.all(
        messagesToDelete.map((msg) =>
            instance().delete(`/sen-message-debtor/${msg.id}`)
        )
    );

    return true;
};
