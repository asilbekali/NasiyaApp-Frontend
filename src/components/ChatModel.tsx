"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Modal, Input, Button, Typography, Space } from "antd"
import { ArrowLeftOutlined, SendOutlined } from "@ant-design/icons"
import type { ReportData } from "../service/use-login"

const { Text } = Typography

interface ChatModalProps {
  debtor: ReportData
  onClose: () => void
}

export const ChatModal: React.FC<ChatModalProps> = ({ debtor, onClose }) => {
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const messages = [
    {
      id: 1,
      text: "Assalomu alaykum! Eslatma: Ol sentyabr kuni 800,000 so'm miqdoridagi oylik O'z vaqtida to'lov qilishni unutmang. Rahmat!",
      timestamp: "11 sentyabr • 11:11",
      sent: true,
      delivered: true,
    },
    {
      id: 2,
      text: "Assalomu alaykum! Eslatma: Ol sentyabr kuni 800,000 so'm miqdoridagi oylik O'z vaqtida to'lov qilishni unutmang. Rahmat!",
      timestamp: "11 sentyabr • 11:11",
      sent: true,
      delivered: true,
    },
    {
      id: 3,
      text: "Assalomu alaykum! Eslatma: Ol sentyabr kuni 800,000 so'm miqdoridagi oylik O'z vaqtida to'lov qilishni unutmang. Rahmat!",
      timestamp: "Bugun • 17:35",
      sent: true,
      delivered: true,
    },
    {
      id: 4,
      text: "Assalomu alaykum! Dishod aka qachon pul berasiz? Hozir pullarim qolmadiku!",
      timestamp: "Bugun • 17:35",
      sent: true,
      delivered: false,
    },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [])

  const handleSendMessage = () => {
    if (!message.trim()) return

    // Here you would send the message to your API
    console.log("[v0] Sending message:", message)
    setMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Modal
      open={true}
      onCancel={onClose}
      footer={null}
      closable={false}
      width="100%"
      style={{
        top: 0,
        padding: 0,
        maxWidth: "100vw",
        height: "100vh",
      }}
      bodyStyle={{
        padding: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
      className="chat-modal"
    >
      {/* Header */}
      <div className="flex items-center bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={onClose}
          className="mr-3 p-0 border-none shadow-none"
        />
        <Text strong className="text-lg text-gray-900">
          {debtor.to.name}
        </Text>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4">
        <Space direction="vertical" size="middle" className="w-full">
          {messages.map((msg) => (
            <div key={msg.id} className="flex justify-end">
              <div className="bg-blue-500 text-white rounded-lg px-4 py-3 max-w-xs shadow-sm">
                <Text className="text-white text-sm leading-relaxed">{msg.text}</Text>
                <div className="flex items-center justify-between mt-2">
                  <Text className="text-white text-xs opacity-75">{msg.timestamp}</Text>
                  {msg.delivered && (
                    <div className="flex items-center space-x-1">
                      <Text className="text-white text-xs opacity-75">Yetkazildi</Text>
                      <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </Space>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Xabar yuboring..."
            className="flex-1 rounded-full border-gray-300"
            size="large"
          />
          <Button
            type="primary"
            shape="circle"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            size="large"
            className="bg-blue-500 border-blue-500 hover:bg-blue-600"
          />
        </div>
      </div>
    </Modal>
  )
}
