import { Home } from "../pages"
import BorrowedProductabout from "../pages/dashboard/BorrowedProductabout"
import Clients from "../pages/dashboard/clicts"
import CreateClient from "../pages/dashboard/CreateClient"
import DebtorAbout from "../pages/dashboard/debtorAbout"

export const PATH = {
    main: "/",
    login: "/login",
    home: "/home",
    clients: "/clients",
    createClient: "/createClient",
    debtor: "/debtor/:id",
    borrrowedProduct: "/borrowed-product/:id"
}

export const DashboardRouteList = [
    {
        id: 1,
        path: PATH.home,
        element: <Home />
    },
    {
        id: 2,
        path: PATH.clients,
        element: <Clients />
    },
    {
        id: 3,
        path: PATH.createClient,
        element: <CreateClient />
    },
    {
        id: 4,
        path: PATH.debtor,
        element: <DebtorAbout />
    },
    {
        id: 5,
        path: PATH.borrrowedProduct,
        element: <BorrowedProductabout />
    }
]
