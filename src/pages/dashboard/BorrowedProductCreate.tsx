"use client";

import type React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Package,
    Calendar,
    DollarSign,
    FileText,
    Plus,
    Loader2,
    Upload,
    X,
    ImageIcon,
} from "lucide-react";
import { createBorrowedProduct, uploadImage } from "../../service/use-login";

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

    const [images, setImages] = useState<string[]>([]);
    const [uploadingImages, setUploadingImages] = useState<File[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const uploadMutation = useMutation({
        mutationFn: uploadImage,
        onSuccess: (data) => {
            const imageUrl = `http://18.159.45.32/multer/${data.path}`;
            setImages((prev) => [...prev, imageUrl]);
        },
        onError: (error) => {
            console.error("Rasm yuklashda xatolik:", error);
        },
    });

    const createMutation = useMutation({
        mutationFn: async () => {
            return await createBorrowedProduct({
                productName: form.productName,
                term: new Date(form.term).toISOString(),
                totalAmount: Number(form.totalAmount), // API’da number jo‘natiladi
                note: form.note,
                debtorId,
                images,
            });
        },
        onSuccess: () => {
            navigate(`/debtor/${debtorId}`);
        },
        onError: (error) => {
            console.log(error);

            console.error("Nasiya yaratishda xatolik:", error);
        },
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        files.forEach((file) => {
            setUploadingImages((prev) => [...prev, file]);
            uploadMutation.mutate(file);
        });
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!form.productName.trim()) {
            newErrors.productName = "Mahsulot nomi kiritilishi shart";
        }

        if (!form.term) {
            newErrors.term = "Muddat tanlanishi shart";
        }

        if (!form.totalAmount || Number(form.totalAmount) <= 0) {
            newErrors.totalAmount = "To'g'ri summa kiritilishi shart";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            createMutation.mutate();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="flex items-center p-3 sm:p-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-2 sm:mr-3 touch-manipulation"
                    >
                        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                    </button>
                    <div className="flex items-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-base sm:text-lg font-bold text-gray-800">
                                Yangi Nasiya
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500">
                                Nasiya ma'lumotlarini kiriting
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-3 sm:p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 space-y-4 sm:space-y-6"
                >
                    {/* Product Name */}
                    <div>
                        <label className="flex items-center text-gray-700 font-medium mb-2 text-sm sm:text-base">
                            <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500" />
                            Mahsulot nomi
                        </label>
                        <input
                            type="text"
                            name="productName"
                            value={form.productName}
                            placeholder="Masalan: iPhone 15, Televizor"
                            className={`w-full border-2 ${errors.productName ? "border-red-300" : "border-gray-200"
                                } rounded-lg sm:rounded-xl p-3 sm:p-4 focus:border-blue-500 focus:outline-none transition-colors text-sm sm:text-base`}
                            onChange={handleChange}
                        />
                        {errors.productName && (
                            <p className="text-red-500 text-xs sm:text-sm mt-1">
                                {errors.productName}
                            </p>
                        )}
                    </div>

                    {/* Term Date */}
                    <div>
                        <label className="flex items-center text-gray-700 font-medium mb-2 text-sm sm:text-base">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500" />
                            To'lov muddati
                        </label>
                        <input
                            type="date"
                            name="term"
                            value={form.term}
                            min={new Date().toISOString().split("T")[0]}
                            className={`w-full border-2 ${errors.term ? "border-red-300" : "border-gray-200"
                                } rounded-lg sm:rounded-xl p-3 sm:p-4 focus:border-blue-500 focus:outline-none transition-colors text-sm sm:text-base`}
                            onChange={handleChange}
                        />
                        {errors.term && (
                            <p className="text-red-500 text-xs sm:text-sm mt-1">
                                {errors.term}
                            </p>
                        )}
                    </div>

                    {/* Total Amount */}
                    <div>
                        <label className="flex items-center text-gray-700 font-medium mb-2 text-sm sm:text-base">
                            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-500" />
                            Umumiy summa (so'm)
                        </label>
                        <input
                            type="number"
                            name="totalAmount"
                            value={form.totalAmount}
                            placeholder="1000000"
                            className={`w-full border-2 ${errors.totalAmount ? "border-red-300" : "border-gray-200"
                                } rounded-lg sm:rounded-xl p-3 sm:p-4 focus:border-blue-500 focus:outline-none transition-colors text-sm sm:text-base`}
                            onChange={handleChange}
                        />
                        {errors.totalAmount && (
                            <p className="text-red-500 text-xs sm:text-sm mt-1">
                                {errors.totalAmount}
                            </p>
                        )}
                        {form.totalAmount && Number(form.totalAmount) > 0 && (
                            <p className="text-gray-500 text-xs sm:text-sm mt-1">
                                {Number(form.totalAmount).toLocaleString("uz-UZ")} so'm
                            </p>
                        )}
                    </div>

                    {/* Images */}
                    <div>
                        <label className="flex items-center text-gray-700 font-medium mb-2 text-sm sm:text-base">
                            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-pink-500" />
                            Mahsulot rasmlari
                        </label>

                        <div className="border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center hover:border-blue-400 transition-colors touch-manipulation">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="image-upload"
                            />
                            <label htmlFor="image-upload" className="cursor-pointer">
                                <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-600 text-sm sm:text-base">
                                    Rasmlarni yuklash uchun bosing
                                </p>
                                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                                    PNG, JPG, JPEG formatida
                                </p>
                            </label>
                        </div>

                        {/* Image Preview */}
                        {images.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 mt-3 sm:mt-4">
                                {images.map((image, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="relative aspect-square rounded-lg sm:rounded-xl overflow-hidden shadow-md"
                                    >
                                        <img
                                            src={image || "/placeholder.svg"}
                                            alt={`Mahsulot rasmi ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors touch-manipulation"
                                        >
                                            <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {uploadMutation.isPending && (
                            <div className="flex items-center justify-center mt-3 sm:mt-4 text-blue-600">
                                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" />
                                <span className="text-sm sm:text-base">
                                    Rasm yuklanmoqda...
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Note */}
                    <div>
                        <label className="flex items-center text-gray-700 font-medium mb-2 text-sm sm:text-base">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-500" />
                            Izoh (ixtiyoriy)
                        </label>
                        <textarea
                            name="note"
                            value={form.note}
                            placeholder="Qo'shimcha ma'lumotlar..."
                            rows={3}
                            className="w-full border-2 border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 focus:border-blue-500 focus:outline-none transition-colors resize-none text-sm sm:text-base"
                            onChange={handleChange}
                        />
                    </div>

                    {/* Submit */}
                    <AnimatePresence>
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSubmit}
                            disabled={createMutation.isPending}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation"
                        >
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                    Yaratilmoqda...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                                    Nasiya yaratish
                                </>
                            )}
                        </motion.button>
                    </AnimatePresence>

                    {createMutation.isError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                            <p className="text-red-600 text-center text-sm sm:text-base">
                                Nasiya yaratishda xatolik yuz berdi. Qaytadan urinib ko'ring.
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
