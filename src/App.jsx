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
      return `${interactions.length} Drug Interactions Found - Medicine Checker India | MedSure`;
    } else if (medications.length > 0) {
      return `Checking ${medications.length} Medications - Drug Interaction Checker | MedSure`;
    }
    return "Drug Interaction Checker India - Free Medicine Safety Check | MedSure";
  };

  const getDynamicDescription = () => {
    if (medications.length > 0 && interactions.length > 0) {
      return `Found ${interactions.length} potential drug interactions among your ${medications.length} medications. Free medicine interaction checker for India. Get detailed medication safety analysis and interaction severity ratings instantly.`;
    } else if (medications.length > 0) {
      return `Analyzing ${medications.length} medications for drug interactions using MedSure's free medicine interaction checker. Instant safety results for Indian medicines including Ayurvedic, allopathic, and homeopathic drugs.`;
    }
    return "Free drug interaction checker for India. Check medicine interactions online for 250,000+ Indian medications including Ayurvedic, allopathic, homeopathic drugs. Instant medication safety analysis.";
  };

  // Update document head dynamically with SEO keywords
  useDocumentHead({
    title: getDynamicTitle(),
    description: getDynamicDescription(),
    keywords: "drug interaction checker, drug interaction checker India, medicine interaction checker, medication interaction checker, check drug interactions, medicine safety checker, drug compatibility checker, prescription interaction checker, online drug interaction checker, free drug interaction checker, Indian medicine checker, Ayurvedic drug interactions, medicine interaction checker India, pharmaceutical interaction checker, prescription safety check, drug-drug interaction checker, medication safety India, tablet interaction checker, medicine compatibility check, drug interaction database India",
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
        
        {/* SEO-Optimized Hidden Content - Indexed by Search Engines */}
        <div className="sr-only">
          <h2>Free Drug Interaction Checker for India - MedSure</h2>
          <p>MedSure is India's most comprehensive free drug interaction checker and medicine interaction checker designed specifically for Indian medications. Check drug interactions online instantly with our medication safety checker supporting over 250,000 Indian medicines.</p>
          
          <h3>Drug Interaction Checker India - Comprehensive Medicine Database</h3>
          <p>Our drug interaction database includes:</p>
          <ul>
            <li>Ayurvedic medicine interaction checker - Traditional Indian herbal medicines and supplements</li>
            <li>Allopathic drug interaction checker - Prescription drugs and generic medications available in India</li>
            <li>Over-the-counter medicine checker - Popular OTC brands like Crocin, Dolo 650, Sinarest, Combiflam</li>
            <li>Homeopathic medicine compatibility checker - Traditional homeopathic treatments</li>
            <li>Traditional Indian medicine interactions - Unani, Siddha, and other traditional systems</li>
            <li>Branded and generic medication safety checker from major Indian pharmaceutical companies</li>
          </ul>
          
          <h3>How to Use Our Medicine Interaction Checker</h3>
          <p>Using MedSure's free drug interaction checker is simple: Add your medications to check for drug interactions, get instant interaction analysis, and view detailed safety information. Our prescription interaction checker works with all types of Indian medicines.</p>
          
          <h3>Popular Indian Medicine Interactions to Check</h3>
          <p>Check drug interactions for commonly used Indian medicines including: Combiflam interactions, Zerodol interactions, Cheston Cold interactions, D-Cold Total interactions, Crocin interactions, Dolo 650 interactions, Paracetamol interactions, Ibuprofen interactions, and traditional Ayurvedic medicines like Liv-52 interactions, Triphala interactions, Ashwagandha interactions, Brahmi interactions, Chyawanprash interactions.</p>
          
          <h3>Drug Interaction Checker Features</h3>
          <ul>
            <li>Free online drug interaction checker - No registration required</li>
            <li>Medicine safety checker for 250,000+ Indian medications</li>
            <li>Real-time medication interaction analysis and alerts</li>
            <li>Drug compatibility checker for multiple medications simultaneously</li>
            <li>Prescription interaction checker with detailed severity ratings</li>
            <li>Pharmaceutical interaction database updated regularly</li>
            <li>Medicine interaction tool supporting Ayurvedic, Allopathic, and Homeopathic drugs</li>
          </ul>
          
          <h3>Who Should Use This Drug Interaction Checker?</h3>
          <p>Our medicine interaction checker India is designed for patients, caregivers, pharmacists, healthcare providers, and anyone managing multiple medications. Use our drug safety checker before starting new medications, supplements, or traditional medicines.</p>
          
          <h3>Drug Interaction Safety in India</h3>
          <p>Medication safety is crucial when taking multiple drugs. Our drug-drug interaction checker helps identify potential risks between prescription medications, over-the-counter drugs, supplements, and traditional medicines. Always consult your doctor or pharmacist before making changes to your medication regimen.</p>
          
          <h3>Common Drug Interaction Searches</h3>
          <p>Popular searches: drug interaction checker India, medicine interaction checker, medication interaction checker online, check drug interactions free, Indian medicine checker, Ayurvedic drug interactions, prescription interaction checker, pharmacy interaction checker, drug compatibility checker, medicine safety checker India, tablet interaction checker, drug interaction database India, medication safety online, herbal medicine interactions India.</p>
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