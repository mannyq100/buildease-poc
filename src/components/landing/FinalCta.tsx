export function FinalCta({ onSignup }: { onSignup: () => void }) {
  return (
    <section className="py-16 bg-gradient-to-br from-blue-50/30 via-white to-orange-50/20">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-[#2B6CB0] via-[#2563EB] to-[#1E40AF] text-white shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-orange-300/20 to-transparent rounded-full blur-2xl"></div>
          
          <div className="relative z-10 p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold font-inter mb-4 leading-tight">Ready to deliver with confidence?</h3>
            <p className="text-white/90 font-opensans mb-8 text-lg leading-relaxed max-w-2xl mx-auto">Create your first project in minutes. It's free, fast, and designed for the field.</p>
            <div>
              <button
                type="button"
                onClick={onSignup}
                className="inline-flex items-center bg-white text-[#2B6CB0] hover:bg-gray-50 px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
              >
                Get Started Free
                <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
