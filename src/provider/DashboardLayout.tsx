import type { ReactNode } from "react"
import { Menu } from "../modules"

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="w-full max-w-md mx-auto bg-white min-h-screen relative">{children}</div>
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <Menu />
      </div>
    </div>
  )
}

export default DashboardLayout
