import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import TestEmailButton from "@/components/TestEmailButton";

export default async function Home() {
  return (
    <MaxWidthWrapper className="mb-12 mt-8">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">⚾ Red Sox Game Times</h1>
          <p className="text-xl text-gray-600 max-w-xl mx-auto text-pretty">
            Get today's Boston Red Sox game times sent directly to your email.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-red-800 mb-4">What you'll get</h2>
          <div className="space-y-3 text-left">
            <div className="flex items-start space-x-3">
              <span className="text-red-600 font-bold">📧</span>
              <p className="text-gray-700">Instant email with today's Red Sox game times</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-red-600 font-bold">🕐</span>
              <p className="text-gray-700">Game times converted to Local timezone</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-red-600 font-bold">📍</span>
              <p className="text-gray-700">Venue information and opponent details</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-2xl mx-auto">
          <TestEmailButton />
        </div>
      </div>
    </MaxWidthWrapper>
  );
}