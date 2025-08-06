import { Route, Routes } from "react-router-dom"
import { PATH } from "../../hooks/Path"
import { Login, LoginHome } from "../../pages"
import { Suspense } from "react"
import PageLoading from "../../components/PageLoading"

const AuthRoute = () => {
  return (
    <Routes>
        <Route path={PATH.main} element={<LoginHome/>}/>
        <Route path={PATH.login} element={<Suspense fallback={<PageLoading/>}><Login/></Suspense>}/>
    </Routes>
  )
}

export default AuthRoute