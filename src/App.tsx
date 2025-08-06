import {useCookies} from "react-cookie"
import { AuthRoute, DashboardRoutes } from "./routes";

const App = () => {
  const [cookies] = useCookies(['token']);
  return cookies.token ? <DashboardRoutes/> : <AuthRoute/>
}

export default App