import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { instance } from "../../hooks/instance";

export default function BorrowedProductCreate() {
    const [searchParams] = useSearchParams();
    const debtorId = Number(searchParams.get("debtorId"));
    const navigate = useNavigate();

    const [form, setForm] = useState({
        productName: "",
        term: "",
        totalAmount: "",
        note: "",
    });

    const createMutation = useMutation({
        mutationFn: async () => {
            const api = instance();
            return await api.post("/borrowed-product", {
                ...form,
                debtorId,
                totalAmount: Number(form.totalAmount),
            });
        },
        onSuccess: () => {
            navigate(`/debtor/${debtorId}`);
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    return (
        <div className="p-4 max-w-md mx-auto">
            <h1 className="text-xl font-bold mb-4">📦 Yangi Nasiya Qo‘shish</h1>

            <input
                type="text"
                name="productName"
                placeholder="Mahsulot nomi"
                className="w-full border p-2 rounded mb-2"
                onChange={handleChange}
            />
            <input
                type="date"
                name="term"
                className="w-full border p-2 rounded mb-2"
                onChange={handleChange}
            />
            <input
                type="number"
                name="totalAmount"
                placeholder="Umumiy summa"
                className="w-full border p-2 rounded mb-2"
                onChange={handleChange}
            />
            <textarea
                name="note"
                placeholder="Izoh"
                className="w-full border p-2 rounded mb-2"
                onChange={handleChange}
            />

            <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
            >
                {createMutation.isPending ? "⏳ Yaratilmoqda..." : "✅ Yaratish"}
            </button>
        </div>
    );
}
