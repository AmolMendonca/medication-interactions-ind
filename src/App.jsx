import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MedicationSearch from './components/medication/MedicationSearch'
import MedicationList from './components/medication/MedicationList'
import InteractionResults from './components/interactions/InteractionResults'
import useDocumentHead from './hooks/useDocumentHead'
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
  
  // Dynamic SEO based on user activity
  const getDynamicTitle = () => {
    if (medications.length > 0 && interactions.length > 0) {
      return `${interactions.length} Drug Interactions Found | MedSure Checker`;
    } else if (medications.length > 0) {
      return `Checking ${medications.length} Medications | MedSure`;
    }
    return "MedSure - Free Drug Interaction Checker for Indian Medications";
  };

  const getDynamicDescription = () => {
    if (medications.length > 0 && interactions.length > 0) {
      return `Found ${interactions.length} potential drug interactions among your ${medications.length} medications. Get detailed analysis and safety recommendations.`;
    } else if (medications.length > 0) {
      return `Analyzing ${medications.length} medications for potential drug interactions. Get instant safety results for Indian medicines.`;
    }
    return "Check drug interactions between Indian medicines instantly. Free, safe, and accurate - includes Ayurvedic, allopathic, and homeopathic medications.";
  };

  // Update document head dynamically
  useDocumentHead({
    title: getDynamicTitle(),
    description: getDynamicDescription(),
    keywords: "drug interaction checker India, Indian medicines, medication safety, Ayurvedic medicine interactions, prescription checker",
    ogTitle: getDynamicTitle(),
    ogDescription: getDynamicDescription()
  });
  
  return (
    <>
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
    <QueryClientProvider client={queryClient}>
      <MedicationProvider>
        <AppContent />
      </MedicationProvider>
    </QueryClientProvider>
  )
}

export default App