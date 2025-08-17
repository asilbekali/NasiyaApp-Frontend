import { Route, Routes, useLocation } from "react-router-dom"
import type { DashboardRouteType } from "../../types/DashboardRouteType"
import { DashboardRouteList } from "../../hooks/Path"
import { Menu } from "../../modules"

const DashboardRoute = () => {
  const location = useLocation()

  // Agar "chat" so‘zi bo‘lsa route ichida -> menu ko‘rinmasin
  const isInChat = location.pathname.includes("chat")

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pb-20">
        <Routes>
          {DashboardRouteList.map((item: DashboardRouteType) =>
            <Route key={item.id} path={item.path} element={item.element} />
          )}
        </Routes>
      </div>

      {!isInChat && <Menu />}
    </div>
  )
}

export default DashboardRoute
