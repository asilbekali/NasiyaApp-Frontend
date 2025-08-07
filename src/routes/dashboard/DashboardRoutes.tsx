import { Route, Routes } from "react-router-dom"
import type { DashboardRouteType } from "../../types/DashboardRouteType"
import { DashboardRouteList } from "../../hooks/Path"
import { Menu } from "../../modules"

const DashboardRoute = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pb-20"> {/* Add padding bottom for fixed navigation */}
        <Routes>
          {DashboardRouteList.map((item: DashboardRouteType) =>
            <Route key={item.id} path={item.path} element={item.element} />
          )}
        </Routes>
      </div>
      <Menu />
    </div>
  )
}

export default DashboardRoute
