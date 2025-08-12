"use client"

import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Trash2, X, Plus, Phone, MapPin, FileText, Calendar, CreditCard, Eye } from "lucide-react"
import { fetchDebtorById, type Debtor } from "../../service/use-login"
import { instance } from "../../hooks/instance"
import { useState } from "react"

export default function DebtorAbout() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Debtor ma'lumotini olish
  const {
    data: debtor,
    isLoading,
    isError,
  } = useQuery<Debtor>({
    queryKey: ["debtor", id],
    queryFn: () => fetchDebtorById(Number(id)),
    enabled: !!id,
  })




  // Debtorni o'chirish mutatsiyasi
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("ID topilmadi")
      const api = instance()
      return await api.delete(`/debtor/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debtor"] })
      navigate(-1)
    },
  })


  const handleDelete = () => {
    deleteMutation.mutate()
    setIsModalOpen(false)
  }

  const totalDebt = debtor?.borrowedProduct.reduce((sum, p) => sum + (p.totalAmount || 0), 0) || 0




  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (isError || !debtor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <p className="text-gray-600 text-lg">Mijoz topilmadi</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-24">
      {/* Mobile-optimized header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-3 sm:p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </button>
          <h1 className="font-bold text-base sm:text-lg text-gray-800 truncate max-w-[150px] sm:max-w-48">
            {debtor.name}
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2 rounded-full hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors touch-manipulation"
            title="O'chirish"
          >
            <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* Mobile-optimized content container */}
      <div className="p-3 sm:p-4 space-y-4 sm:space-y-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg sm:text-2xl font-bold">
              {debtor.name.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">{debtor.name}</h2>
              <p className="text-gray-500 text-sm sm:text-base">Mijoz</p>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center text-gray-600 text-sm sm:text-base">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-blue-500 flex-shrink-0" />
              <span className="truncate">
                {debtor.debtroPhoneNumber.map((ph) => ph.number).join(", ") || "Telefon kiritilmagan"}
              </span>
            </div>
            <div className="flex items-center text-gray-600 text-sm sm:text-base">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-green-500 flex-shrink-0" />
              <span className="truncate">{debtor.address || "Manzil kiritilmagan"}</span>
            </div>
            <div className="flex items-start text-gray-600 text-sm sm:text-base">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 mt-0.5 text-orange-500 flex-shrink-0" />
              <span className="break-words">{debtor.note || "Izoh yo'q"}</span>
            </div>
          </div>

          {debtor.debtor_image.length > 0 && (
            <div className="mt-4 sm:mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                Rasmlar ({debtor.debtor_image.length})
              </h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {debtor.debtor_image.map((img) => (
                  <motion.div
                    key={img.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative aspect-square rounded-lg sm:rounded-xl overflow-hidden shadow-md cursor-pointer touch-manipulation"
                    onClick={() => setSelectedImage(img.image)}
                  >
                    <img
                      src={img.image || "/placeholder.svg"}
                      alt={`Debtor image ${img.id}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                      <Eye className="w-4 h-4 sm:w-6 sm:h-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-blue-100 text-xs sm:text-sm font-medium">Umumiy nasiya</p>
              <p className="text-xl sm:text-3xl font-bold mt-1 truncate">{totalDebt.toLocaleString("uz-UZ")} so'm</p>
            </div>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 ml-3">
              <CreditCard className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6"
        >
          <h2 className="font-bold text-base sm:text-lg text-gray-800 mb-3 sm:mb-4 flex items-center">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500" />
            Faol nasiyalar ({debtor.borrowedProduct.length})
          </h2>

          <div className="space-y-2 sm:space-y-3">
            {debtor.borrowedProduct.length > 0 ? (
              debtor.borrowedProduct.map((loan, index) => {
                const termDate = new Date(loan.term)
                const createDate = new Date(loan.createAt)
                const isOverdue = termDate < new Date()

                return (
                  <motion.div
                    key={loan.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-gradient-to-r ${isOverdue ? "from-red-50 to-red-100 border-red-200" : "from-green-50 to-blue-50 border-blue-200"
                      } border rounded-lg sm:rounded-xl p-3 sm:p-4 cursor-pointer hover:shadow-md transition-all duration-200 touch-manipulation`}
                    onClick={() => navigate(`/borrowed-product/${loan.id}`)}
                  >
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-500">
                          {createDate.toLocaleDateString("uz-UZ")} •{" "}
                          {createDate.toLocaleTimeString("uz-UZ", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="font-semibold text-gray-800 mt-1 text-sm sm:text-base truncate">
                          {loan.productName || "Mahsulot"}
                        </p>
                      </div>
                      <div className="text-right ml-2">
                        <p className={`text-base sm:text-lg font-bold ${isOverdue ? "text-red-600" : "text-blue-600"}`}>
                          {loan.totalAmount.toLocaleString("uz-UZ")} so'm
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${isOverdue ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                          }`}
                      >
                        {isOverdue ? "Muddati o'tgan" : "Faol"}
                      </span>
                      <div className="text-right">
                        <p className="text-gray-600">Keyingi to'lov</p>
                        <p className="font-semibold">{termDate.toLocaleDateString("uz-UZ")}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            ) : (
              <div className="text-center py-6 sm:py-8">
                <div className="text-gray-400 text-3xl sm:text-4xl mb-2">📋</div>
                <p className="text-gray-500 text-sm sm:text-base">Faol nasiya yo'q</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        onClick={() => navigate(`/borrowed-product/create?debtorId=${debtor.id}`)}
        className="fixed mb-[8px] bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-full shadow-xl flex items-center gap-2 hover:shadow-2xl hover:scale-105 transition-all duration-5 touch-manipulation text-sm sm:text-base"
      >
        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="font-semibold ">Nasiya yaratish</span>
      </motion.button>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage || "/placeholder.svg"}
                alt="Full size"
                className="w-full h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {isModalOpen && (
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
              className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Mijozni o'chirish</h2>
                <p className="text-gray-600">Bu mijoz va unga tegishli barcha ma'lumotlarni o'chirishni xohlaysizmi?</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
                >
                  {deleteMutation.isPending ? "O'chirilmoqda..." : "O'chirish"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
