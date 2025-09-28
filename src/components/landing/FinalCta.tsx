export function FinalCta({ onSignup }: { onSignup: () => void }) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-r from-[#2B6CB0]/90 via-[#2B6CB0] to-[#1E40AF] text-white">
          <div className="p-8 md:p-12 text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-bold font-inter mb-3">Ready to deliver with confidence?</h3>
            <p className="text-white/90 font-opensans mb-6">Create your first project in minutes. It’s free, fast, and designed for the field.</p>
            <div>
              <button
                type="button"
                onClick={onSignup}
                className="inline-flex items-center bg-white text-[#2B6CB0] hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-sm"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
