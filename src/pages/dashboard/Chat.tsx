"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Send, Smile } from "lucide-react"
import { fetchReports, fetchDebtorById, type ReportData, type Debtor } from "../../service/use-login"

interface Message {
  id: string
  text: string
  timestamp: string
  isSent: boolean
}

const Chat = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [message, setMessage] = useState("")
  const [isInputFocused, setIsInputFocused] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: reportData } = useQuery<ReportData[]>({
    queryKey: ["reports"],
    queryFn: fetchReports,
  })

  const { data: debtorData } = useQuery<Debtor>({
    queryKey: ["debtor", id],
    queryFn: () => fetchDebtorById(Number(id)),
    enabled: !!id,
  })

  const debtorMessages =
    reportData
      ?.filter((report) => report.debtorId === Number(id))
      .map((report) => ({
        id: report.id.toString(),
        text: report.message,
        timestamp: new Date(report.createAt).toLocaleString("uz-UZ", {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
        isSent: report.sent,
      })) || []

  const [messages, setMessages] = useState<Message[]>(debtorMessages)

  useEffect(() => {
    setMessages(debtorMessages)
  }, [reportData, id])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    document.body.setAttribute("data-chat-input-focused", isInputFocused.toString())
    return () => {
      document.body.removeAttribute("data-chat-input-focused")
    }
  }, [isInputFocused])

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message,
        timestamp: new Date().toLocaleTimeString("uz-UZ", {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
        isSent: true,
      }
      setMessages([...messages, newMessage])
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const debtorName = debtorData?.name || reportData?.find((r) => r.debtorId === Number(id))?.to.name || "Noma'lum"
  const debtorPhone = debtorData?.debtroPhoneNumber?.[0]?.number || "+998 XX XXX XXXX"

  return (
    <div className="flex flex-col h-[100dvh] bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>

          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">{debtorName.charAt(0).toUpperCase()}</span>
          </div>

          <div>
            <h2 className="font-medium text-gray-900">{debtorName}</h2>
            <p className="text-sm text-gray-500">{debtorPhone}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isSent ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                msg.isSent ? "bg-blue-500 text-white rounded-br-md" : "bg-gray-200 text-gray-900 rounded-bl-md"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.isSent ? "text-blue-100" : "text-gray-500"}`}>{msg.timestamp}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
      >
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Smile size={20} className="text-gray-500" />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder="Xabar yozing..."
              className="w-full px-4 py-2 bg-gray-100 rounded-full border-none outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className={`p-2 rounded-full transition-all ${
              message.trim()
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Chat
