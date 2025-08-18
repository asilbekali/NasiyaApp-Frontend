"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Send } from "lucide-react"
import { fetchReports, fetchDebtorById, sendMessageToDebtor } from "../../service/use-login"
import axios from "axios"

interface Message {
  id: string
  text: string
  timestamp: string
  isSent: boolean
  date: Date
}

interface MessageSample {
  id: number
  message: string
}

const Chat = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [showSamples, setShowSamples] = useState(false)
  const [samples, setSamples] = useState<MessageSample[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch reports
  const { data: reportData } = useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
  })

  // Fetch debtor info
  const { data: debtorData } = useQuery({
    queryKey: ["debtor", id],
    queryFn: () => fetchDebtorById(Number(id)),
    enabled: !!id,
  })

  // Initialize messages from reportData
  useEffect(() => {
    const debtorMessages =
      reportData
        ?.filter((report: any) => report.debtorId === Number(id))
        .map((report: any) => {
          const date = new Date(report.createAt)
          return {
            id: report.id.toString(),
            text: report.message,
            timestamp: date.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
            isSent: report.sent,
            date,
          }
        }) || []

    // Sort by date, eski yuqorida
    debtorMessages.sort((a: Message, b: Message) => a.date.getTime() - b.date.getTime())

    setMessages(debtorMessages)
  }, [reportData, id])

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  useEffect(() => { scrollToBottom() }, [messages, showSamples])

  const debtorName = debtorData?.name || reportData?.find((r: any) => r.debtorId === Number(id))?.to?.name || "Noma'lum"
  const debtorPhone = debtorData?.debtroPhoneNumber?.[0]?.number || "+998 XX XXX XXXX"

  // Mutation for sending message
  const sendMutation = useMutation({
    mutationFn: sendMessageToDebtor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reports"] }),
  })

  const handleSendMessage = async () => {
    if (!message.trim()) return
    const now = new Date()
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      timestamp: now.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
      isSent: true,
      date: now,
    }
    setMessages(prev => [...prev, newMessage].sort((a, b) => a.date.getTime() - b.date.getTime()))
    setMessage("")
    setShowSamples(false)
    if (id) await sendMutation.mutateAsync({ debtorId: Number(id), message: newMessage.text })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage() } }

  const handleToggleSamples = async () => {
    if (!showSamples) {
      try {
        const res = await axios.get<MessageSample[]>("http://18.159.45.32/message-sample")
        setSamples(res.data.map(item => ({ id: item.id, message: item.message })))
      } catch (err) { console.error("Failed to fetch message samples:", err) }
    }
    setShowSamples(!showSamples)
  }

  const handleSelectSample = (sample: MessageSample) => { setMessage(sample.message); setShowSamples(false) }

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 flex items-center p-4 bg-white border-b border-gray-200 shadow-sm">
        <button onClick={() => navigate("/reports")} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="ml-3 flex items-center">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">{debtorName.charAt(0).toUpperCase()}</span>
          </div>
          <div className="ml-3">
            <h2 className="font-semibold text-gray-900">{debtorName}</h2>
            <p className="text-sm text-gray-500">{debtorPhone}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28 pt-[72px]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isSent ? "justify-end" : "justify-start"}`}>
            <div className={`relative max-w-xs px-4 py-2 rounded-2xl shadow-md transition-all duration-200 ${msg.isSent ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md" : "bg-white text-gray-900 rounded-bl-md border border-gray-200"}`}>
              <p className="text-sm">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.isSent ? "text-blue-100" : "text-gray-500"}`}>{msg.timestamp}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Samples */}
      {showSamples && (
        <div className="fixed bottom-20 left-4 right-4 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl p-3 z-20">
          <div className="text-xs font-medium text-gray-500 mb-2 px-1">Tez xabarlar</div>
          <div className="space-y-2">
            {samples.map((s) => (
              <button key={s.id} onClick={() => handleSelectSample(s)} className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                {s.message}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center space-x-2" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}>
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="Xabar yozing..." className="flex-1 px-4 py-2 bg-gray-100 rounded-full border-none outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
        <button className="p-2 rounded-full hover:bg-gray-100 transition" onClick={handleToggleSamples}>
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
        <button onClick={handleSendMessage} disabled={!message.trim()} className={`p-2 rounded-full transition-all ${message.trim() ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}

export default Chat
