import Link from 'next/link'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-6">
          Welcome to Auction Management Service
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Buy and sell land and vehicles through our secure auction platform.
          Each auction has its own dedicated room for real-time bidding.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auctions"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700"
          >
            Browse Auctions
          </Link>
          <Link
            href="/auctions/create"
            className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-300"
          >
            Create Auction
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-blue-600 text-4xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold mb-2">Land Auctions</h3>
          <p className="text-gray-600">
            Buy or sell residential, commercial, and agricultural land through our platform.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-blue-600 text-4xl mb-4">🚗</div>
          <h3 className="text-xl font-semibold mb-2">Vehicle Auctions</h3>
          <p className="text-gray-600">
            Find great deals on cars, trucks, and other vehicles from verified sellers.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-blue-600 text-4xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold mb-2">Dedicated Rooms</h3>
          <p className="text-gray-600">
            Each auction has its own room with unique code for secure and organized bidding.
          </p>
        </div>
      </div>
    </div>
  )
}
