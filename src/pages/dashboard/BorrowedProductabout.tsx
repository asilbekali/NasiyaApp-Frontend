"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  FileText,
  User,
  Eye,
  X,
  Package,
  Edit3,
  Save,
  Phone,
  MoreVertical,
  Check,
  DollarSign,
  Clock,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import dayjs from "dayjs"
import {
  fetchBorrowedProductById,
  deleteBorrowedProduct,
  updateBorrowedProduct,
  updateDebtor,
  type BorrowedProduct,
} from "../../service/use-login"

const BorrowedProductAbout: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingDebtor, setIsEditingDebtor] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [showOneMonthPayment, setShowOneMonthPayment] = useState(false)
  const [showCustomPayment, setShowCustomPayment] = useState(false)
  const [showTermSelection, setShowTermSelection] = useState(false)
  const [customAmount, setCustomAmount] = useState("")
  const [selectedTerms, setSelectedTerms] = useState<number[]>([])
  const [showPaymentOptions, setShowPaymentOptions] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const [editForm, setEditForm] = useState({
    productName: "",
    term: "",
    totalAmount: "",
    note: "",
  })

  const [debtorEditForm, setDebtorEditForm] = useState({
    name: "",
    phoneNumbers: [""],
    address: "",
    note: "",
  })

  const { data, isLoading, error } = useQuery<BorrowedProduct>({
    queryKey: ["borrowedProduct", id],
    queryFn: () => fetchBorrowedProductById(Number(id)),
    enabled: !!id,
  })

  useEffect(() => {
    if (data) {
      setEditForm({
        productName: data.productName || "",
        term: data.term ? dayjs(data.term).format("YYYY-MM-DD") : "",
        totalAmount: data.totalAmount?.toString() || "",
        note: data.note || "",
      })

      const phoneNumbers = data.debtor?.debtroPhoneNumber?.map((p: any) => (typeof p === "string" ? p : p.number)) || [
        "",
      ]
      setDebtorEditForm({
        name: data.debtor?.name || "",
        phoneNumbers: phoneNumbers.length > 0 ? phoneNumbers : [""],
        address: data.debtor?.address || "",
        note: data.debtor?.note || "",
      })
    }
  }, [data])

  const deleteMutation = useMutation({
    mutationFn: () => deleteBorrowedProduct(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debtor"] })
      navigate(-1)
    },
    onError: (error) => {
      console.error("O'chirishda xatolik:", error)
    },
  })

  const updateProductMutation = useMutation({
    mutationFn: (updateData: {
      productName: string
      term: string
      totalAmount: number
      note: string
      debtorId: number
      images: string[]
    }) => updateBorrowedProduct(Number(id), updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrowedProduct", id] })
      setIsEditing(false)
    },
    onError: (error) => {
      console.error("Yangilashda xatolik:", error)
    },
  })

  const updateDebtorMutation = useMutation({
    mutationFn: (updateData: {
      name: string
      phoneNumbers: string[]
      address: string
      note: string
    }) => updateDebtor(data?.debtor.id || 0, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrowedProduct", id] })
      queryClient.invalidateQueries({ queryKey: ["debtor"] })
      setIsEditingDebtor(false)
    },
    onError: (error) => {
      console.error("Mijozni yangilashda xatolik:", error)
    },
  })

  const paymentMutation = useMutation({
    mutationFn: (paymentData: { amount: number; months?: number[] }) => {
      // Mock payment API call
      return new Promise((resolve) => setTimeout(resolve, 1500))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrowedProduct", id] })
      // Close all payment modals
      setShowOneMonthPayment(false)
      setShowCustomPayment(false)
      setShowTermSelection(false)
      setShowPaymentOptions(false)
      setShowSuccessModal(true)
    },
  })

  const handleProductSave = () => {
    if (!data) return

    updateProductMutation.mutate({
      productName: editForm.productName,
      term: editForm.term,
      totalAmount: Number(editForm.totalAmount),
      note: editForm.note,
      debtorId: data.debtorId,
      images: data.borrowedProductImage?.map((img: any) => img.image) || [],
    })
  }

  const handleDebtorSave = () => {
    if (!data) return

    updateDebtorMutation.mutate({
      name: debtorEditForm.name,
      phoneNumbers: debtorEditForm.phoneNumbers.filter((phone) => phone.trim() !== ""),
      address: debtorEditForm.address,
      note: debtorEditForm.note,
    })
  }

  const handleDelete = () => {
    deleteMutation.mutate()
    setShowDeleteConfirm(false)
  }

  const handleOneMonthPayment = () => {
    paymentMutation.mutate({ amount: data?.monthPayment || 0 })
  }

  const handleCustomPayment = () => {
    if (customAmount && Number(customAmount) > 0) {
      paymentMutation.mutate({ amount: Number(customAmount) })
    }
  }

  const handleTermPayment = () => {
    if (selectedTerms.length > 0) {
      const totalAmount = selectedTerms.length * (data?.monthPayment || 0)
      paymentMutation.mutate({ amount: totalAmount, months: selectedTerms })
    }
  }

  const toggleTermSelection = (monthIndex: number) => {
    setSelectedTerms((prev) =>
      prev.includes(monthIndex) ? prev.filter((i) => i !== monthIndex) : [...prev, monthIndex],
    )
  }

  const addPhoneNumber = () => {
    setDebtorEditForm((prev) => ({
      ...prev,
      phoneNumbers: [...prev.phoneNumbers, ""],
    }))
  }

  const removePhoneNumber = (index: number) => {
    setDebtorEditForm((prev) => ({
      ...prev,
      phoneNumbers: prev.phoneNumbers.filter((_, i) => i !== index),
    }))
  }

  const updatePhoneNumber = (index: number, value: string) => {
    setDebtorEditForm((prev) => ({
      ...prev,
      phoneNumbers: prev.phoneNumbers.map((phone, i) => (i === index ? value : phone)),
    }))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <p className="text-red-500 text-lg">Xatolik yuz berdi</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="text-gray-400 text-6xl mb-4">📋</div>
        <p className="text-gray-500 text-lg">Ma'lumot topilmadi</p>
      </div>
    )
  }

  const isOverdue = dayjs(data.term).isBefore(dayjs())

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="flex items-center justify-between p-3 sm:p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </button>
          <h1 className="font-bold text-base sm:text-lg text-gray-800 truncate max-w-[200px] sm:max-w-xs">
            {data.productName}
          </h1>
          <div className="relative">
            <button
              onClick={() => setShowPaymentOptions(!showPaymentOptions)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
            >
              <MoreVertical className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            </button>

            {/* Payment Menu Dropdown */}
            <AnimatePresence>
              {showPaymentOptions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                >
                  <button
                    onClick={() => {
                      setShowOneMonthPayment(true)
                      setShowPaymentOptions(false)
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 touch-manipulation"
                  >
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">1 oy uchun so'ndirish</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowCustomPayment(true)
                      setShowPaymentOptions(false)
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 touch-manipulation"
                  >
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">Har qanday miqdorda so'ndirish</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowTermSelection(true)
                      setShowPaymentOptions(false)
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 touch-manipulation"
                  >
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">To'lov muddatini tanlash</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-4 py-4 space-y-4 sm:space-y-6 pb-20">
        {/* Product Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <Package className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-2xl font-bold truncate">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.productName}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, productName: e.target.value }))}
                        className="bg-white/20 border border-white/30 rounded-lg px-2 sm:px-3 py-1 text-white placeholder-white/70 w-full text-sm sm:text-lg"
                      />
                    ) : (
                      data.productName
                    )}
                  </h1>
                  <p className="text-blue-100 text-xs sm:text-sm">Nasiya mahsuloti</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                {isOverdue && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                    Muddati o'tgan
                  </span>
                )}
                <button
                  onClick={() => {
                    if (isEditing) {
                      handleProductSave()
                    } else {
                      setIsEditing(true)
                    }
                  }}
                  className="flex items-center gap-1 sm:gap-2 bg-white/20 hover:bg-white/30 px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm touch-manipulation"
                >
                  {isEditing ? <Save className="w-3 h-3 sm:w-4 sm:h-4" /> : <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />}
                  {isEditing ? "Saqlash" : "Tahrirlash"}
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Financial Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl border border-green-200">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-green-600 font-medium">Umumiy summa</p>
                    <p className="text-lg sm:text-2xl font-bold text-green-700 truncate">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.totalAmount}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, totalAmount: e.target.value }))}
                          className="bg-white border border-green-300 rounded px-2 py-1 text-green-700 w-full text-sm sm:text-lg"
                        />
                      ) : (
                        `${data.totalAmount.toLocaleString()} so'm`
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl border border-blue-200">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-blue-600 font-medium">Tugash sanasi</p>
                    <p className="text-lg sm:text-2xl font-bold text-blue-700">
                      {isEditing ? (
                        <input
                          type="date"
                          value={dayjs(editForm.term).format("YYYY-MM-DD")}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, term: e.target.value }))}
                          className="bg-white border border-blue-300 rounded px-2 py-1 text-blue-700 w-full text-sm sm:text-base"
                        />
                      ) : (
                        dayjs(data.term).format("DD.MM.YYYY")
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Izoh</h3>
              </div>
              {isEditing ? (
                <textarea
                  value={editForm.note}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, note: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Izoh yozing..."
                />
              ) : (
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{data.note || "Izoh yo'q"}</p>
              )}
            </div>

            {/* Images */}
            {data.borrowedProductImage && data.borrowedProductImage.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  Mahsulot rasmlari ({data.borrowedProductImage.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                  {data.borrowedProductImage.map((img: any, index: number) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative group cursor-pointer touch-manipulation"
                      onClick={() => setSelectedImage(`http://18.159.45.32/multer/${img.image}`)}
                    >
                      <img
                        src={`http://18.159.45.32/multer/${img.image}`}
                        alt={`Mahsulot ${index + 1}`}
                        className="w-full h-24 sm:h-32 object-cover rounded-lg border-2 border-gray-200 group-hover:border-blue-400 transition-colors"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          e.currentTarget.src = "https://via.placeholder.com/200x200?text=Image"
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                        <Eye className="w-4 h-4 sm:w-6 sm:h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Customer Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Mijoz ma'lumotlari</h2>
                  <p className="text-green-100">
                    {isEditingDebtor ? (
                      <input
                        type="text"
                        value={debtorEditForm.name}
                        onChange={(e) => setDebtorEditForm((prev) => ({ ...prev, name: e.target.value }))}
                        className="bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-white placeholder-white/70"
                      />
                    ) : (
                      data.debtor.name
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (isEditingDebtor) {
                    handleDebtorSave()
                  } else {
                    setIsEditingDebtor(true)
                  }
                }}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                {isEditingDebtor ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                {isEditingDebtor ? "Saqlash" : "Tahrirlash"}
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Phone Numbers */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Telefon raqamlari</h3>
                {isEditingDebtor && (
                  <button
                    onClick={addPhoneNumber}
                    className="ml-auto text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    + Qo'shish
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {isEditingDebtor ? (
                  debtorEditForm.phoneNumbers.map((phone, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => updatePhoneNumber(index, e.target.value)}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                        placeholder="+998 XX XXX XX XX"
                      />
                      {debtorEditForm.phoneNumbers.length > 1 && (
                        <button
                          onClick={() => removePhoneNumber(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="space-y-2">
                    {data?.debtor?.debtroPhoneNumber && data.debtor.debtroPhoneNumber.length > 0 ? (
                      data.debtor.debtroPhoneNumber.map((phoneData: any, index: any) => {
                        const phoneNumber = typeof phoneData === "string" ? phoneData : phoneData.number
                        return (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700 font-medium">{phoneNumber}</span>
                          </div>
                        )
                      })
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-500">Telefon raqam mavjud emas</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Manzil</h3>
              {isEditingDebtor ? (
                <input
                  type="text"
                  value={debtorEditForm.address}
                  onChange={(e) => setDebtorEditForm((prev) => ({ ...prev, address: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Manzilni kiriting..."
                />
              ) : (
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {data.debtor.address || "Manzil ko'rsatilmagan"}
                </p>
              )}
            </div>

            {/* Customer Note */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Mijoz haqida izoh</h3>
              {isEditingDebtor ? (
                <textarea
                  value={debtorEditForm.note}
                  onChange={(e) => setDebtorEditForm((prev) => ({ ...prev, note: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Mijoz haqida izoh yozing..."
                />
              ) : (
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{data.debtor.note || "Izoh yo'q"}</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage || "https://via.placeholder.com/400x400?text=Image"}
                alt="Katta rasm"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modals */}
      {/* One Month Payment Modal */}
      <AnimatePresence>
        {showOneMonthPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4"
            onClick={() => setShowOneMonthPayment(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-semibold">1 oy uchun so'ndirish</h3>
                <button
                  onClick={() => setShowOneMonthPayment(false)}
                  className="p-2 hover:bg-gray-100 rounded-full touch-manipulation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
                  {data?.monthPayment?.toLocaleString()} so'm
                </div>
                <div className="text-sm text-blue-500">Nasiya oyligini so'ndirish</div>
              </div>

              <button
                onClick={handleOneMonthPayment}
                disabled={paymentMutation.isPending}
                className="w-full bg-blue-500 text-white py-4 rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 touch-manipulation text-base sm:text-lg"
              >
                {paymentMutation.isPending ? "To'lov amalga oshirilmoqda..." : "To'lov uchun so'ndirish"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Payment Modal */}
      <AnimatePresence>
        {showCustomPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4"
            onClick={() => setShowCustomPayment(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-4 sm:p-6 space-y-4 sm:space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-semibold">Har qanday miqdorda so'ndirish</h3>
                <button
                  onClick={() => setShowCustomPayment(false)}
                  className="p-2 hover:bg-gray-100 rounded-full touch-manipulation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Miqdor kiriting *</label>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="0"
                    className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-blue-500 focus:outline-none transition-colors text-lg"
                    autoFocus
                  />
                  {customAmount && Number(customAmount) > 0 && (
                    <p className="text-sm text-gray-500 mt-1">{Number(customAmount).toLocaleString()} so'm</p>
                  )}
                </div>

                <button
                  onClick={handleCustomPayment}
                  disabled={!customAmount || Number(customAmount) <= 0 || paymentMutation.isPending}
                  className="w-full bg-blue-500 text-white py-4 rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-base sm:text-lg"
                >
                  {paymentMutation.isPending ? "To'lov amalga oshirilmoqda..." : "So'ndirish"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Term Selection Modal */}
      <AnimatePresence>
        {showTermSelection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4"
            onClick={() => setShowTermSelection(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-semibold">To'lov muddatini tanlang</h3>
                <button
                  onClick={() => setShowTermSelection(false)}
                  className="p-2 hover:bg-gray-100 rounded-full touch-manipulation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                So'ndirish:{" "}
                <span className="font-semibold text-blue-600">
                  {selectedTerms.length * (data?.monthPayment || 0)} so'm
                </span>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {Array.from({ length: 12 }, (_, i) => {
                  const monthDate = dayjs().add(i + 1, "month")
                  const isSelected = selectedTerms.includes(i)

                  return (
                    <div
                      key={i}
                      onClick={() => toggleTermSelection(i)}
                      className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all touch-manipulation ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"
                            }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div>
                          <div className="font-medium text-sm sm:text-base">{i + 1}-oy</div>
                          <div className="text-xs sm:text-sm text-gray-500">{monthDate.format("DD.MM.YYYY")}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm sm:text-base">
                          {(data?.monthPayment || 0).toLocaleString()} so'm
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <button
                onClick={handleTermPayment}
                disabled={selectedTerms.length === 0 || paymentMutation.isPending}
                className="w-full bg-blue-500 text-white py-4 rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-base sm:text-lg"
              >
                {paymentMutation.isPending ? "To'lov amalga oshirilmoqda..." : "So'ndirish"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm p-6 sm:p-8 text-center relative overflow-hidden"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
              >
                <Check className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Ajoyib!</h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">Muvaffaqiyatli so'ndirildi</p>

                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-blue-500 text-white py-3 sm:py-4 rounded-xl font-semibold hover:bg-blue-600 transition-colors touch-manipulation text-base sm:text-lg"
                >
                  Ortga
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BorrowedProductAbout
