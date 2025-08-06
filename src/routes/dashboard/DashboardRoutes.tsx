import { Route, Routes } from "react-router-dom"
import { PATH } from "../../hooks/Path"
import { Home } from "../../pages"
import DashboardLayout from "../../provider/DashboardLayout"

const DashboardRoutes = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path={PATH.main} element={<Home />} />
      </Routes>
    </DashboardLayout>
  )
}

export default DashboardRoutes