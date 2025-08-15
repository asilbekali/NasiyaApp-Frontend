"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchReports, type ReportData } from "../service/use-login"
import { useNavigate } from "react-router-dom"
import { MessageCircle, User } from "lucide-react"

const DebtorList = () => {
  const navigate = useNavigate()

  const { data: reportData, isLoading } = useQuery<ReportData[]>({
    queryKey: ["reports"],
    queryFn: fetchReports,
  })

  // Group messages by debtor
  const debtorGroups = reportData?.reduce(
    (acc, report) => {
      const key = report.debtorId
      if (!acc[key]) {
        acc[key] = {
          debtorId: report.debtorId,
          debtorName: report.to.name,
          messages: [],
          lastMessage: report,
        }
      }
      acc[key].messages.push(report)
      // Keep the latest message
      if (new Date(report.createAt) > new Date(acc[key].lastMessage.createAt)) {
        acc[key].lastMessage = report
      }
      return acc
    },
    {} as Record<number, { debtorId: number; debtorName: string; messages: ReportData[]; lastMessage: ReportData }>,
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Yuklanmoqda...</div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Qarzdorlar</h2>
      </div>

      <div className="divide-y divide-gray-200">
        {debtorGroups &&
          Object.values(debtorGroups).map((debtor) => (
            <div
              key={debtor.debtorId}
              onClick={() => navigate(`/chat/${debtor.debtorId}`)}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">{debtor.debtorName.charAt(0).toUpperCase()}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{debtor.debtorName}</h3>
                    <span className="text-xs text-gray-500">
                      {new Date(debtor.lastMessage.createAt).toLocaleDateString("uz-UZ")}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 mt-1">
                    <MessageCircle size={14} className="text-gray-400" />
                    <p className="text-sm text-gray-600 truncate">{debtor.lastMessage.message}</p>
                  </div>

                  <div className="flex items-center space-x-1 mt-1">
                    <User size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-500">
                      ID: {debtor.debtorId} • {debtor.messages.length} xabar
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {(!debtorGroups || Object.keys(debtorGroups).length === 0) && (
        <div className="p-8 text-center text-gray-500">
          <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Hozircha xabarlar yo'q</p>
        </div>
      )}
    </div>
  )
}

export default DebtorList
