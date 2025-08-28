export default function ActiveSubscriptions({ services, subscriptions, onUnsubscribe }) {
  const subscribedServices = services.filter(service => 
    subscriptions.includes(service.id)
  )

  if (subscribedServices.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
        </div>
        <h2 className="text-xl font-medium text-gray-700 mb-2">No active subscriptions</h2>
        <p className="text-gray-500">Subscribe to services to see them listed here</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Subscriptions</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subscribedServices.map(service => (
          <div key={service.id} className="bg-white rounded-xl shadow-md overflow-hidden card-hover">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{service.name}</h2>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <button
                onClick={() => onUnsubscribe(service.id, service.name)}
                className="bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                Unsubscribe
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}