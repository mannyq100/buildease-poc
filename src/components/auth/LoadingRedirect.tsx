export default function LoadingRedirect() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col items-center p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg backdrop-blur-sm border border-gray-100 dark:border-gray-700">
        <div className="h-12 w-12 rounded-full border-4 border-[#2B6CB0] border-t-[#ED8936] animate-spin mb-4"></div>
        <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base font-medium">
          Redirecting to your dashboard...
        </p>
      </div>
    </div>
  )
}