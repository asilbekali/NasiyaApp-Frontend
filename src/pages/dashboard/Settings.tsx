"use client"

import { useCookies } from "react-cookie"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

const Settings = () => {
  const [, , removeCookie] = useCookies(["token"])
  const navigate = useNavigate()

  const handleLogout = () => {
    removeCookie("token", { path: "/" })
    navigate("/")
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-50 flex justify-center items-start pt-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120 }}
      >
        <div className="p-6">
          <motion.h1
            className="text-2xl font-bold text-gray-900 mb-6"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Sozlamalar
          </motion.h1>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-xl font-semibold shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Chiqish
            </motion.button>

            {/* Qo‘shimcha animatsion tugmalar yoki sozlamalar bo‘lishi mumkin */}
            <motion.div
              className="bg-gray-100 p-4 rounded-xl shadow-inner cursor-pointer"
              whileHover={{ scale: 1.02, backgroundColor: "#E5E7EB" }}
              whileTap={{ scale: 0.98 }}
            >
              Profilni tahrirlash
            </motion.div>

            <motion.div
              className="bg-gray-100 p-4 rounded-xl shadow-inner cursor-pointer"
              whileHover={{ scale: 1.02, backgroundColor: "#E5E7EB" }}
              whileTap={{ scale: 0.98 }}
            >
              Bildirishnomalar
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Settings
