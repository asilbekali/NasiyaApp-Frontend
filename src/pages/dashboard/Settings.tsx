"use client"

import { useCookies } from "react-cookie"
import { useNavigate } from "react-router-dom"

const Settings = () => {
  const [, , removeCookie] = useCookies(["token"])
  const navigate = useNavigate()

  const handleLogout = () => {
    removeCookie("token", { path: "/" })
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-md mx-auto bg-white min-h-screen">
        <div className="p-4">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">Sozlamalar</h1>

          <div className="space-y-4">
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Chiqish
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
