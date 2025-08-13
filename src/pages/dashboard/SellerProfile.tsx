"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ArrowLeft, User, Phone, Mail, Camera, Edit3, Save, X, Loader2 } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { fetchSellerProfile, updateSellerProfile, uploadImage, type SellerProfile } from "../../service/use-login"

interface SellerProfileProps {
  onBack: () => void
}

const SellerProfileComponent: React.FC<SellerProfileProps> = ({ onBack }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

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
      setFormData((prev) => ({ ...prev, password: "" })) // Parolni tozalash
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-500 text-lg">Profil ma'lumotlarini yuklashda xatolik</p>
          <button
            onClick={onBack}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Ortga qaytish
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-2 sm:mr-3 touch-manipulation"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-gray-800">Shaxsiy ma'lumotlar</h1>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="p-2 rounded-full hover:bg-green-100 transition-colors touch-manipulation disabled:opacity-50"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5 text-green-600" />
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
              >
                <Edit3 className="w-5 h-5 text-blue-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 space-y-6"
        >
          {/* Profile Image */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-blue-100 to-purple-100">
                {formData.image ? (
                  <img
                    src={
                      formData.image.startsWith("http")
                        ? formData.image
                        : `http://18.159.45.32/multer/${formData.image}`
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=128&width=128&text=User"
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
                  </div>
                )}
              </div>
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 sm:space-y-6">
            {/* Name Field */}
            <div>
              <label className="flex items-center text-gray-700 font-medium mb-2 text-sm sm:text-base">
                <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500" />
                Ismi familiya
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 focus:border-blue-500 focus:outline-none transition-colors text-sm sm:text-base"
                  placeholder="Ismingizni kiriting"
                />
              ) : (
                <div className="w-full bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-gray-700 text-sm sm:text-base">
                  {profile?.name || "Ma'lumot kiritilmagan"}
                </div>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="flex items-center text-gray-700 font-medium mb-2 text-sm sm:text-base">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500" />
                Telefon raqam
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 focus:border-blue-500 focus:outline-none transition-colors text-sm sm:text-base"
                  placeholder="+998 XX XXX XX XX"
                />
              ) : (
                <div className="w-full bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-gray-700 text-sm sm:text-base">
                  {profile?.phoneNumber || "Ma'lumot kiritilmagan"}
                </div>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="flex items-center text-gray-700 font-medium mb-2 text-sm sm:text-base">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-500" />
                Elektron pochta
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 focus:border-blue-500 focus:outline-none transition-colors text-sm sm:text-base"
                  placeholder="email@example.com"
                />
              ) : (
                <div className="w-full bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-gray-700 text-sm sm:text-base">
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
                  <label className="flex items-center text-gray-700 font-medium mb-2 text-sm sm:text-base">
                    <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-500" />
                    Yangi parol (ixtiyoriy)
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 focus:border-blue-500 focus:outline-none transition-colors text-sm sm:text-base"
                    placeholder="Yangi parol kiriting"
                  />
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Parolni o'zgartirish ixtiyoriy. Bo'sh qoldiring agar o'zgartirmoqchi bo'lmasangiz.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Save Button - Mobile Only */}
          {isEditing && (
            <div className="sm:hidden">
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default SellerProfileComponent
