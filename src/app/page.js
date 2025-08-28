import MaxWidthWrapper from "@/components/MaxWidthWrapper";

export default async function Home() {
  return (
    <MaxWidthWrapper className="mb-12 mt-8">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">⚾ Red Sox Daily Notifier</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get daily email notifications about Boston Red Sox games at 6 AM Vancouver time.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-red-800 mb-4">How it works</h2>
          <div className="space-y-3 text-left">
            <div className="flex items-start space-x-3">
              <span className="text-red-600 font-bold">1.</span>
              <p className="text-gray-700">Every day at 6 AM Vancouver time, checks the MLB schedule for Red Sox games</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-red-600 font-bold">2.</span>
              <p className="text-gray-700">If there are games, sends an email with game times details</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-red-600 font-bold">3.</span>
              <p className="text-gray-700">If no games are scheduled, we let you know so you can plan your day</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Test the System</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Test with mock data:</strong> <code className="bg-gray-200 px-2 py-1 rounded">/api/test-email?test=true</code></p>
            <p><strong>Test with real games:</strong> <code className="bg-gray-200 px-2 py-1 rounded">/api/test-email</code></p>
            <p><strong>Cron endpoint:</strong> <code className="bg-gray-200 px-2 py-1 rounded">/api/cron/daily-sox</code></p>
          </div>
        </div>
      </div>

    </MaxWidthWrapper>
  );
}