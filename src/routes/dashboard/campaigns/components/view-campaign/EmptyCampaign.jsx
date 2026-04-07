import { useNavigate } from "react-router-dom"

const EmptyCampaign = ()=>{
    const navigate = useNavigate()
    return (
        <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-100 rounded-lg p-12 text-center">
          <h3 className="text-xl font-semibold text-purple-800 mb-2">Campaign Not Found</h3>
          <p className="text-sm text-red-600 mb-6">
            We couldn&apos;t find the campaign you&apos;re looking for.
          </p>

          <button
            onClick={() => navigate('/dashboard/campaigns')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    )
}

export default EmptyCampaign