"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { MessageCircle, X, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
    fetchDebtorById,
    fetchPaymentHistory,
    fetchReports,
    fetchClients,
    deleteDebtorMessages,
    type Debtor,
    type PaymentHistoryData,
    type ReportData
} from "../../service/use-login"

const Reports = () => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState<"messages" | "payments">("messages")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [confirmDeleteDebtor, setConfirmDeleteDebtor] = useState<Debtor | null>(null)

    const { data: paymentHistory, isLoading: paymentsLoading, error: paymentsError } =
        useQuery<PaymentHistoryData[]>({
            queryKey: ["paymentHistory"],
            queryFn: fetchPaymentHistory,
            enabled: activeTab === "payments",
        })

    const debtorIds = paymentHistory?.map((debtor) => debtor.debtorId) || []

    const { data: debtorsData } = useQuery<Debtor[]>({
        queryKey: ["debtors", debtorIds],
        queryFn: async () => {
            if (debtorIds.length === 0) return []
            const debtorPromises = debtorIds.map((id) => fetchDebtorById(id))
            return Promise.all(debtorPromises)
        },
        enabled: activeTab === "payments" && debtorIds.length > 0,
    })

    const getDebtorPhoneNumber = (debtorId: number): string => {
        const debtor = debtorsData?.find((d) => d.id === debtorId)
        return debtor?.debtroPhoneNumber?.[0]?.number || "+998 91 123 4567"
    }

    const { data: reports, isLoading: reportsLoading, error: reportsError } =
        useQuery<ReportData[]>({
            queryKey: ["reports"],
            queryFn: fetchReports,
            enabled: activeTab === "messages",
        })

    const { data: allDebtors } = useQuery<Debtor[]>({
        queryKey: ["clients"],
        queryFn: fetchClients,
        enabled: isModalOpen,
    })

    const handleDebtorClick = (debtorId: number, debtorName: string) => {
        setIsModalOpen(false)
        navigate(`/debtorchat/${debtorId}`, { state: { debtorName } })
    }

    const deleteMutation = useMutation({
        mutationFn: deleteDebtorMessages,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reports"] })
            queryClient.invalidateQueries({ queryKey: ["clients"] })
            setConfirmDeleteDebtor(null) // Modalni yopish
        },
    })

    const handleDeleteDebtor = (debtorId: number) => {
        const debtor = debtorsData?.find(d => d.id === debtorId) || allDebtors?.find(d => d.id === debtorId)
        if (debtor) setConfirmDeleteDebtor(debtor)
    }

    const confirmDelete = () => {
        if (confirmDeleteDebtor) {
            deleteMutation.mutate(confirmDeleteDebtor.id)
        }
    }

    const isLoading = activeTab === "messages" ? reportsLoading : paymentsLoading
    const error = activeTab === "messages" ? reportsError : paymentsError

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-500">Xatolik yuz berdi</div>
            </div>
        )
    }

    const uniqueDebtors = reports
        ? Array.from(new Map(reports.map((r) => [r.debtorId, r])).values())
        : []

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white px-4 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold text-gray-900">Hisobot</h1>
                    <button
                        className="p-2"
                        onClick={() => navigate("/messageSample")}
                    >
                        <svg
                            className="w-5 h-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white px-4 py-3 border-b border-gray-200">
                <div className="flex justify-center">
                    <div className="flex bg-gray-100 rounded-lg p-1 max-w-sm w-full">
                        <button
                            onClick={() => setActiveTab("messages")}
                            className={`flex-1 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md ${activeTab === "messages"
                                ? "bg-blue-500 text-white shadow-sm"
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                                }`}
                        >
                            Xabarlar tarixi
                        </button>
                        <button
                            onClick={() => setActiveTab("payments")}
                            className={`flex-1 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md ${activeTab === "payments"
                                ? "bg-blue-500 text-white shadow-sm"
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                                }`}
                        >
                            To'lovlar tarixi
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 py-2">
                {activeTab === "messages" && uniqueDebtors.length > 0 ? (
                    uniqueDebtors.map((report) => (
                        <motion.div
                            key={report.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100 flex justify-between items-center cursor-pointer"
                        >
                            <div
                                onClick={() => handleDebtorClick(report.debtorId, report.to.name)}
                                className="flex-1"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-semibold text-gray-900">{report.to.name}</h3>
                                    <span className="text-xs text-gray-500">
                                        {new Date(report.createAt).toLocaleDateString("uz-UZ", {
                                            day: "2-digit",
                                            month: "short",
                                        })}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">{getDebtorPhoneNumber(report.debtorId)}</p>
                            </div>
                            <button
                                onClick={() => handleDeleteDebtor(report.debtorId)}
                                className="p-2 rounded-full hover:bg-red-100"
                            >
                                <Trash2 className="w-5 h-5 text-red-500" />
                            </button>
                        </motion.div>
                    ))
                ) : activeTab === "payments" && paymentHistory && paymentHistory.length > 0 ? (
                    paymentHistory.map((debtor) => (
                        <div key={debtor.debtorId} className="mb-4">
                            {debtor.paymentHistories.map((payment) => (
                                <div
                                    key={payment.paymentId}
                                    className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-semibold text-gray-900">{debtor.debtorName}</h3>
                                                <span className="text-xs text-gray-500 mr-[10px] mt-[25px]">
                                                    {new Date(payment.paidAt).toLocaleDateString("uz-UZ", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">{getDebtorPhoneNumber(debtor.debtorId)}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-semibold text-gray-900">
                                                -{payment.amountPaid.toLocaleString()}{" "}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <div className="text-gray-500">
                            {activeTab === "messages" ? "Hech qanday xabar topilmadi" : "Hech qanday to'lov tarixi topilmadi"}
                        </div>
                    </div>
                )}
            </div>

            {/* Message Icon Modal */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-[100px] right-6 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg"
            >
                <MessageCircle className="w-6 h-6" />
            </button>

            {/* Barcha Debtorlar Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="bg-white rounded-2xl shadow-lg w-full max-w-md h-[80vh] flex flex-col"
                        >
                            <div className="flex items-center justify-between p-4 border-b">
                                <h2 className="text-lg font-semibold">Barcha Debtorlar</h2>
                                <button onClick={() => setIsModalOpen(false)}>
                                    <X className="w-6 h-6 text-gray-600" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                <AnimatePresence>
                                    {allDebtors && allDebtors.length > 0 ? (
                                        allDebtors.map((debtor) => (
                                            <motion.div
                                                key={debtor.id}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleDebtorClick(debtor.id, debtor.name)}
                                                className="flex flex-col p-3 bg-gray-50 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100"
                                            >
                                                <h3 className="font-medium text-gray-900">{debtor.name}</h3>
                                                <p className="text-sm text-gray-600">{debtor.debtroPhoneNumber?.[0]?.number || "Nomer yo'q"}</p>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-500">Debtorlar topilmadi</p>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Confirm Delete Modal */}
            <AnimatePresence>
                {confirmDeleteDebtor && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="bg-white rounded-2xl shadow-lg w-11/12 max-w-sm p-6 flex flex-col items-center"
                        >
                            <h2 className="text-lg font-semibold mb-4 text-center">Haqiqatan ham barcha xabarlarni o‘chirmoqchimisiz?</h2>
                            <div className="flex gap-4">
                                <button
                                    onClick={confirmDelete}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600"
                                >
                                    O‘chirish
                                </button>
                                <button
                                    onClick={() => setConfirmDeleteDebtor(null)}
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow hover:bg-gray-300"
                                >
                                    Bekor qilish
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Reports
