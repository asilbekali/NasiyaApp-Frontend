import { Home } from "../pages"
import BorrowedProductabout from "../pages/dashboard/BorrowedProductabout"
import BorrowedProductCreate from "../pages/dashboard/BorrowedProductCreate"
import Chat from "../pages/dashboard/Chat"
import Clients from "../pages/dashboard/clicts"
import CreateClient from "../pages/dashboard/CreateClient"
import DebtorAbout from "../pages/dashboard/debtorAbout"
import Reports from "../pages/dashboard/Reports"
import Settings from "../pages/dashboard/Settings"

export const PATH = {
    main: "/",
    login: "/login",
    home: "/home",
    clients: "/clients",
    createClient: "/createClient",
    debtor: "/debtor/:id",
    borrrowedProduct: "/borrowed-product/:id",
    createBorrowedProduct: "/borrowed-product/create",
    reports: "/reports",
    debtorChat: "/debtorchat/:id",
    settings: "/settings"
}

export const DashboardRouteList = [
    {
        id: 1,
        path: PATH.home,
        element: <Home />,
    },
    {
        id: 2,
        path: PATH.clients,
        element: <Clients />,
    },
    {
        id: 3,
        path: PATH.createClient,
        element: <CreateClient />,
    },
    {
        id: 4,
        path: PATH.debtor,
        element: <DebtorAbout />,
    },
    {
        id: 5,
        path: PATH.borrrowedProduct,
        element: <BorrowedProductabout />,
    },
    {
        id: 6,
        path: PATH.createBorrowedProduct,
        element: <BorrowedProductCreate />,
    },
    {
        id: 7,
        path: PATH.reports,
        element: <Reports />,
    },
    {
        id: 8,
        path: PATH.debtorChat,
        element: <Chat />,
    },
    {
        id: 9,
        path: PATH.settings,
        element: <Settings />,
    },
    {
        id: 10,
        path: PATH.main,
        element: <Home/>,
    },
]
