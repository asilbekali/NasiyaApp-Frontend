import { Home } from "../pages"

export const PATH = {
    main: "/",
    login: "/login",
    home: "/home"
}

export const DashboardRouteList = [
    {
        id: 1,
        path: PATH.home,
        element: <Home />
    }
]
