import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MedicationSearch from './components/medication/MedicationSearch'
import MedicationList from './components/medication/MedicationList'
import InteractionResults from './components/interactions/InteractionResults'
import { MedicationProvider } from './context/MedicationContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MedicationProvider>
        <div className="min-h-screen bg-gray-50">
          
          {/* Minimal Header */}
          <header className="bg-white border-b border-gray-100">
            <div className="max-w-2xl mx-auto px-4 py-6">
              <h1 className="text-2xl font-semibold text-gray-900 text-center">
                MedCheck
              </h1>
              <p className="text-sm text-gray-500 text-center mt-1">
                Drug interaction checker
              </p>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
            
            {/* Search Section */}
            <section>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Add medications
              </h2>
              <MedicationSearch />
            </section>

            {/* Medication List */}
            <section>
              <MedicationList />
            </section>

            {/* Interactions */}
            <section>
              <InteractionResults />
            </section>

          </main>

          {/* Minimal Footer */}
          <footer className="max-w-2xl mx-auto px-4 py-8 mt-16">
            <div className="bg-gray-100 rounded-xl p-4">
              <p className="text-xs text-gray-600 text-center">
                This tool provides general information only. Always consult your healthcare provider.
              </p>
            </div>
          </footer>

        </div>
      </MedicationProvider>
    </QueryClientProvider>
  )
}

export default App