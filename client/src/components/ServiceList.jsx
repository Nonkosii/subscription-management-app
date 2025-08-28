export default function ServiceList({ services, subscriptions, onSubscribe, onUnsubscribe }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Available Services</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service.id} className="bg-white rounded-xl shadow-md overflow-hidden card-hover">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{service.name}</h2>
              <p className="text-gray-600 mb-4">{service.description}</p>
              {subscriptions.includes(service.id) ? (
                <button
                  onClick={() => onUnsubscribe(service.id, service.name)}
                  className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition duration-200"
                >
                  Unsubscribe
                </button>
              ) : (
                <button
                  onClick={() => onSubscribe(service.id, service.name)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                >
                  Subscribe
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}