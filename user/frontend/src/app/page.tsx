import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
            Welcome to <span className="text-blue-600">User Platform</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            Secure user management and authentication platform with role-based access control.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/sign-up"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/sign-in"
              className="bg-gray-200 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 text-2xl">�</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              User Registration
            </h3>
            <p className="mt-2 text-gray-600">
              Create secure accounts with email verification and role management
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-2xl">�</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Secure Authentication</h3>
            <p className="mt-2 text-gray-600">
              Advanced authentication with role-based access control
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-600 text-2xl">✅</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Seller Verification
            </h3>
            <p className="mt-2 text-gray-600">
              Comprehensive seller verification and approval workflow
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
