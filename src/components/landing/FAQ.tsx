import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const FAQS = [
  {
    q: 'Is BuildEase really free?',
    a: 'Yes. You can create projects, plan phases, manage expenses, and collaborate with your team at no cost.'
  },
  {
    q: 'Who is BuildEase for?',
    a: 'Homeowners and contractors. It offers a clear project plan for homeowners and fast, flexible tools for contractors.'
  },
  {
    q: 'Does it work on mobile?',
    a: 'Absolutely. BuildEase is mobile-first and optimized for on-site use with touch-friendly controls.'
  },
  {
    q: 'How are my files stored?',
    a: 'Documents and images are stored securely with Supabase Storage. Access is controlled using row-level security (RLS) policies.'
  }
]

export function FAQ() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <span className="inline-block text-sm text-[#ED8936] font-medium uppercase tracking-wider bg-[#ED8936]/10 px-4 py-2 rounded-full border border-[#ED8936]/20 mb-4">FAQ</span>
          <h2 className="text-3xl md:text-4xl font-bold font-inter text-gray-900">Frequently asked questions</h2>
          <p className="text-gray-600 font-opensans mt-3">Everything you need to know to get started quickly.</p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((item, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger className="text-left text-gray-900 font-medium">{item.q}</AccordionTrigger>
              <AccordionContent className="text-gray-600 font-opensans">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
