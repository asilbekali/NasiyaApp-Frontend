"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { User, Phone, Mail, Camera, Edit3, Save, X, Loader2, LogOut } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { fetchSellerProfile, updateSellerProfile, uploadImage, type SellerProfile } from "../service/use-login"
import { useNavigate } from "react-router-dom"
import { useCookies } from "react-cookie"

const SellerProfileModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [cookies, setCookie, removeCookie] = useCookies(["token"])

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    password: "",
    image: "",
  })

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery<SellerProfile>({
    queryKey: ["sellerProfile"],
    queryFn: fetchSellerProfile,
    enabled: isOpen, // Faqat modal ochiq bo'lganda ma'lumot yuklash
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phoneNumber: profile.phoneNumber || "",
        email: profile.email || "",
        password: "",
        image: profile.image || "",
      })
    }
  }, [profile])

  const updateMutation = useMutation({
    mutationFn: updateSellerProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellerProfile"] })
      queryClient.invalidateQueries({ queryKey: ["seller"] })
      setIsEditing(false)
      setFormData((prev) => ({ ...prev, password: "" }))
    },
    onError: (error: any) => {
      console.error("Profile update failed:", error)
      alert("Profil yangilanishida xatolik: " + (error.response?.data?.message || error.message))
    },
  })

  const uploadMutation = useMutation({
    mutationFn: uploadImage,
    onSuccess: (data) => {
      const imagePath = data.path || data.filename || data.url
      setFormData((prev) => ({ ...prev, image: imagePath }))
      setUploadingImage(false)
    },
    onError: (error) => {
      console.error("Image upload failed:", error)
      setUploadingImage(false)
      alert("Rasm yuklashda xatolik yuz berdi")
    },
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadingImage(true)
      uploadMutation.mutate(file)
    }
  }

  const handleSave = () => {
    if (!formData.name.trim() || !formData.phoneNumber.trim() || !formData.email.trim()) {
      alert("Barcha majburiy maydonlarni to'ldiring")
      return
    }

    const updateData: any = {
      name: formData.name.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      email: formData.email.trim(),
    }

    if (formData.password.trim()) {
      updateData.password = formData.password.trim()
    }

    if (formData.image) {
      updateData.image = formData.image
    }

    updateMutation.mutate(updateData)
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phoneNumber: profile.phoneNumber || "",
        email: profile.email || "",
        password: "",
        image: profile.image || "",
      })
    }
    setIsEditing(false)
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsEditing(false)
    if (profile) {
      setFormData({
        name: profile.name || "",
        phoneNumber: profile.phoneNumber || "",
        email: profile.email || "",
        password: "",
        image: profile.image || "",
      })
    }
  }

  const getSellerImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null

    if (imagePath.startsWith("http")) {
      return imagePath
    }

    return `http://13.233.230.148/multer/${imagePath}`
  }

  const handleLogout = () => {
    removeCookie("token", { path: "/" })
    queryClient.clear()
    navigate("/login")
    setIsOpen(false)
    setShowLogoutConfirm(false)
  }

  useEffect(() => {
    const handleOpenProfile = () => setIsOpen(true)
    window.addEventListener("openSellerProfile", handleOpenProfile)

    return () => {
      window.removeEventListener("openSellerProfile", handleOpenProfile)
    }
  }, [])

  const TriggerButton = () => (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-50"
    >
      <User className="w-6 h-6" />
    </button>
  )

  return (
    <>
      <TriggerButton />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end justify-center z-[100] p-0"
            onClick={handleClose}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-100 z-10">
                <div className="flex items-center justify-between p-4">
                  <h1 className="text-lg font-bold text-gray-800">Shaxsiy ma'lumotlar</h1>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button onClick={handleCancel} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                          <X className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={updateMutation.isPending}
                          className="p-2 rounded-full hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                          {updateMutation.isPending ? (
                            <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                          ) : (
                            <Save className="w-5 h-5 text-green-600" />
                          )}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Edit3 className="w-5 h-5 text-blue-600" />
                        </button>
                        <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                          <X className="w-5 h-5 text-gray-600" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 pb-8">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="text-red-500 text-4xl mb-4">⚠️</div>
                    <p className="text-red-500">Profil ma'lumotlarini yuklashda xatolik</p>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    {/* Profile Image */}
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-blue-100 to-purple-100">
                          {formData.image ? (
                            <img
                              src={getSellerImageUrl(formData.image) || "/placeholder.svg?height=96&width=96&text=User"}
                              alt="Profile"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg?height=96&width=96&text=User"
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        {isEditing && (
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingImage}
                            className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                          >
                            {uploadingImage ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Camera className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                      {/* Name Field */}
                      <div>
                        <label className="flex items-center text-gray-700 font-medium mb-2 text-sm">
                          <User className="w-4 h-4 mr-2 text-blue-500" />
                          Ismi familiya
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:outline-none transition-colors text-sm"
                            placeholder="Ismingizni kiriting"
                          />
                        ) : (
                          <div className="w-full bg-gray-50 rounded-xl p-3 text-gray-700 text-sm">
                            {profile?.name || "Ma'lumot kiritilmagan"}
                          </div>
                        )}
                      </div>

                      {/* Phone Field */}
                      <div>
                        <label className="flex items-center text-gray-700 font-medium mb-2 text-sm">
                          <Phone className="w-4 h-4 mr-2 text-green-500" />
                          Telefon raqam
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:outline-none transition-colors text-sm"
                            placeholder="+998 XX XXX XX XX"
                          />
                        ) : (
                          <div className="w-full bg-gray-50 rounded-xl p-3 text-gray-700 text-sm">
                            {profile?.phoneNumber || "Ma'lumot kiritilmagan"}
                          </div>
                        )}
                      </div>

                      {/* Email Field */}
                      <div>
                        <label className="flex items-center text-gray-700 font-medium mb-2 text-sm">
                          <Mail className="w-4 h-4 mr-2 text-purple-500" />
                          Elektron pochta
                        </label>
                        {isEditing ? (
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:outline-none transition-colors text-sm"
                            placeholder="email@example.com"
                          />
                        ) : (
                          <div className="w-full bg-gray-50 rounded-xl p-3 text-gray-700 text-sm">
                            {profile?.email || "Ma'lumot kiritilmagan"}
                          </div>
                        )}
                      </div>

                      {/* Password Field - Only show when editing */}
                      <AnimatePresence>
                        {isEditing && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <label className="flex items-center text-gray-700 font-medium mb-2 text-sm">
                              <Edit3 className="w-4 h-4 mr-2 text-orange-500" />
                              Yangi parol (ixtiyoriy)
                            </label>
                            <input
                              type="password"
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:outline-none transition-colors text-sm"
                              placeholder="Yangi parol kiriting"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Parolni o'zgartirish ixtiyoriy. Bo'sh qoldiring agar o'zgartirmoqchi bo'lmasangiz.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Save Button */}
                    {isEditing && (
                      <button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {updateMutation.isPending ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saqlanmoqda...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            Saqlash
                          </>
                        )}
                      </button>
                    )}

                    {/* Logout Button */}
                    <button
                      onClick={() => setShowLogoutConfirm(true)}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 mt-4"
                    >
                      <LogOut className="w-5 h-5" />
                      Chiqish
                    </button>

                    {/* Logout Confirmation Modal */}
                    <AnimatePresence>
                      {showLogoutConfirm && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4"
                          onClick={() => setShowLogoutConfirm(false)}
                        >
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="text-center">
                              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LogOut className="w-8 h-8 text-red-600" />
                              </div>
                              <h3 className="text-lg font-bold text-gray-800 mb-2">Hisobdan chiqish</h3>
                              <p className="text-gray-600 mb-6">Haqiqatan ham hisobdan chiqmoqchimisiz?</p>

                              <div className="flex gap-3">
                                <button
                                  onClick={() => setShowLogoutConfirm(false)}
                                  className="flex-1 py-3 px-4 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  Bekor qilish
                                </button>
                                <button
                                  onClick={handleLogout}
                                  className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                                >
                                  Chiqish
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default SellerProfileModal
