import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import MedicationSearch from './components/medication/MedicationSearch'
import MedicationList from './components/medication/MedicationList'
import InteractionResults from './components/interactions/InteractionResults'
import SEOHead from './components/SEO/SEOHead'
import { MedicationProvider, useMedicationContext } from './context/MedicationContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Main content component that can use medication context
function AppContent() {
  const { medications, interactions } = useMedicationContext();
  
  return (
    <>
      <SEOHead 
        medicationCount={medications.length}
        interactionCount={interactions.length}
      />
      
      <div className="min-h-screen bg-gray-50">
          
          {/* iOS-style Header */}
          <header className="bg-white/95 backdrop-blur-2xl border-b border-gray-200/40 sticky top-0 z-50 safe-area-top">
            <div className="max-w-sm mx-auto">
              {/* Status Bar Space */}
              <div className="h-11"></div>
              
              {/* Navigation Bar */}
              <div className="px-4 pb-3">
                <div className="text-center">
                  {/* Large Title - iOS Style */}
                  <h1 className="text-[34px] font-bold text-black tracking-tight leading-[40px] -mb-1">
                    MedSure
                  </h1>
                  <p className="text-[17px] text-gray-600 font-normal leading-[22px]">
                    Drug Interaction Checker
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Container */}
          <main className="max-w-sm mx-auto px-4 pb-8">
            
            {/* Search Section */}
            <section className="pt-4">
              <MedicationSearch />
            </section>

            {/* Medication List */}
            <section className="mt-8">
              <MedicationList />
            </section>

            {/* Interactions */}
            <section className="mt-8">
              <InteractionResults />
            </section>

          </main>

          {/* iOS-style Footer */}
          <footer className="max-w-sm mx-auto px-4 pb-8 safe-area-bottom">
            <div className="bg-gray-100/60 rounded-2xl p-4 border border-gray-200/40">
              <p className="text-[13px] text-gray-500 text-center leading-[18px]">
                For informational purposes only. Always consult your healthcare provider for medical advice.
              </p>
            </div>
          </footer>

        </div>
        
        {/* Hidden SEO Content for Indian Drug Terms */}
        <div className="sr-only">
          <h2>Indian Medication Database</h2>
          <p>Comprehensive drug interaction checker supporting over 250,000 Indian medications including:</p>
          <ul>
            <li>Ayurvedic medicines and herbal supplements</li>
            <li>Allopathic prescription drugs available in India</li>
            <li>Over-the-counter medications like Crocin, Dolo, Sinarest</li>
            <li>Traditional Indian medicines - Unani, Siddha, Homeopathic</li>
            <li>Generic and branded medications from Indian pharmaceutical companies</li>
          </ul>
          <h3>Common Indian Medicine Interactions</h3>
          <p>Check interactions for popular Indian brands: Combiflam, Zerodol, Cheston Cold, D-Cold Total, Liv-52, Triphala, Ashwagandha, Brahmi, and more.</p>
        </div>
      </>
    );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MedicationProvider>
          <AppContent />
        </MedicationProvider>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

export default App