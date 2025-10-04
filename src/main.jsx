import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './context/AuthContext'
import { MedicationProvider } from './context/MedicationContext'
import AuthForm from './components/auth/AuthForm'
import Header from './components/layout/Header'
import MedicationSearch from './components/medication/MedicationSearch'
import MedicationList from './components/medication/MedicationList'
import InteractionResults from './components/interactions/InteractionResults'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function MainApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header with User Menu - Radix UI Enhanced */}
      <Header />

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 pt-2 pb-6 space-y-8">
        
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

      {/* Footer */}
      <footer className="max-w-2xl mx-auto px-4 py-8 mt-16">
        <div className="bg-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-600 text-center">
            Your medications are securely stored and synced across all your devices.
          </p>
          <p className="text-xs text-gray-500 text-center mt-1">
            This tool provides general information only. Always consult your healthcare provider.
          </p>
        </div>
      </footer>

    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MedicationProvider>
          <MainApp />
        </MedicationProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)