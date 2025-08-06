import { Logo } from "../assets/images"

const PageLoading = () => {
    return (
        <div className="containers">
            <div className="fixed flex items-center justify-center top-0 bottom-0 left-0 right-0 bg-white">
                <img className="page-loading-img" src={Logo} alt="Page Logo" width={80} height={80} />
            </div>
        </div>
    )
}

export default PageLoading