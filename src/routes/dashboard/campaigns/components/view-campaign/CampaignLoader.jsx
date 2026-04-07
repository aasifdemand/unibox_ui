const CampaignLoader = ()=>{
    return(
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-sm text-gray-500">Loading...</p>
      </div>
    )
}

export default CampaignLoader