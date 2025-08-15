const PageLoading = () => {
    return (
        <div className="fixed flex items-center justify-center top-0 bottom-0 left-0 right-0 bg-white z-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Yuklanmoqda...</p>
            </div>
        </div>
    )
}

export default PageLoading
