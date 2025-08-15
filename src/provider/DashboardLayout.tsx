"use client"

import type React from "react"
import { useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import BottomNavigation from "../components/BottomNavigation"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation()
  const isInChat = location.pathname.startsWith("/chat/") || location.pathname.startsWith("/debtorchat/")
  const [isInputFocused, setIsInputFocused] = useState(false)

  useEffect(() => {
    const checkInputFocus = () => {
      const focusState = document.body.getAttribute("data-chat-input-focused") === "true"
      setIsInputFocused(focusState)
    }

    // Check immediately and set up observer
    checkInputFocus()

    const observer = new MutationObserver(checkInputFocus)
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-chat-input-focused"],
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 overflow-hidden">{children}</main>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isInChat || isInputFocused
            ? "transform translate-y-full opacity-0 pointer-events-none invisible"
            : "transform translate-y-0 opacity-100 pointer-events-auto visible"
        }`}
      >
        <BottomNavigation />
      </div>
    </div>
  )
}

export default DashboardLayout
