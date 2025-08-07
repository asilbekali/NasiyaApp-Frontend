import { useNavigate } from "react-router-dom"
import { PATH } from "../../hooks/Path"
import { useEffect } from "react"

const Home = () => {
  const navigate = useNavigate()
  useEffect(() => {
    navigate(PATH.login)
  }, [])
  return ""
}

export default Home