import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MedicationSearch from './components/medication/MedicationSearch'
import MedicationList from './components/medication/MedicationList'
import InteractionResults from './components/interactions/InteractionResults'
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

// Move DetailedDebug outside and fix it
function DetailedDebug() {
  const { medications, getMedicationsForInteractionCheck } = useMedicationContext();
  const medicationsForCheck = getMedicationsForInteractionCheck ? getMedicationsForInteractionCheck() : [];
  
  const testInteraction = async () => {
    console.log('=== Testing Interaction Check ===');
    console.log('Raw medications:', medications);
    console.log('Medications for check:', medicationsForCheck);
    
    if (medicationsForCheck.length >= 2) {
      const med1 = medicationsForCheck[0];
      const med2 = medicationsForCheck[1];
      console.log(`Testing interaction between:`, med1.name, 'and', med2.name);
      console.log('Med1 generic:', med1.genericName, 'Can check:', med1.canCheckInteractions);
      console.log('Med2 generic:', med2.genericName, 'Can check:', med2.canCheckInteractions);
    }
  };
  
  return (
    <div style={{ padding: '16px', background: '#fff3cd', margin: '16px 0', borderRadius: '8px', fontSize: '12px' }}>
      <h4>Detailed Debug</h4>
      <p>Medications: {medications.length}</p>
      <p>Ready for check: {medicationsForCheck.length}</p>
      {medicationsForCheck.map((med, i) => (
        <div key={i} style={{ margin: '4px 0', padding: '4px', background: '#f8f9fa' }}>
          {med.name} - Generic: {med.genericName || 'NONE'} - Can check: {med.canCheckInteractions ? 'YES' : 'NO'}
        </div>
      ))}
      {medications.length >= 2 && (
        <button onClick={testInteraction} style={{ padding: '4px 8px', margin: '8px 0' }}>
          Test Interaction Check (Check Console)
        </button>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MedicationProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          
          {/* Header - Mobile optimized */}
          <header className="bg-white border-b border-gray-100 sticky top-0 z-40 backdrop-blur-lg bg-white/95">
            <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
              <div className="py-4 sm:py-6">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 11.172V5l-1-1z" />
                    </svg>
                  </div>
                  
                  <div className="text-center">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                      MedCheck
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Drug Interaction Checker
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pb-20">
            
            {/* Hero Section */}
            <div className="py-6 sm:py-8 text-center">
              <h2 className="text-lg sm:text-xl text-gray-700 font-medium mb-2">
                Check medication interactions safely
              </h2>
              <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
                Search and add your medications to identify potential drug interactions using official medical databases
              </p>
            </div>

            {/* Add Debug Component Here */}
            <DetailedDebug />

            <div className="space-y-6 sm:space-y-8">
              
              {/* Search Section */}
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900">Search Medications</h3>
                  </div>
                  <MedicationSearch />
                </div>
              </section>

              {/* Medications List Section */}
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900">Your Medications</h3>
                  </div>
                  <MedicationList />
                </div>
              </section>

              {/* Add InteractionResults Component Here */}
              <InteractionResults />

            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-gray-100 bg-white/80 backdrop-blur-sm">
            <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-xs font-medium text-yellow-800 mb-1">Medical Disclaimer</p>
                    <p className="text-xs text-yellow-700 leading-relaxed">
                      This tool provides general information only. Always consult your healthcare provider before making medication changes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </footer>

        </div>
      </MedicationProvider>
    </QueryClientProvider>
  )
}

export default App