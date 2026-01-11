import { useState } from 'react'
import type { OrderRow, CustomerSummary } from './types'
import { FileUpload } from './components/FileUpload'
import { CustomerSelector } from './components/CustomerSelector'
import { Dashboard } from './components/Dashboard'
import { AdminLayout, VarugruppAdmin, ArtikelAdmin } from './components/admin'
import { VarugruppProvider } from './context/VarugruppContext'
import { ArtikelProvider } from './context/ArtikelContext'
import { getUniqueCustomers, filterByCustomer } from './utils/csvParser'
import { calculateCustomerSummary } from './utils/analytics'

type View = 'main' | 'admin-varugrupp' | 'admin-artikel'

function App() {
  const [view, setView] = useState<View>('main')
  const [allRows, setAllRows] = useState<OrderRow[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null)
  const [customerSummary, setCustomerSummary] = useState<CustomerSummary | null>(null)

  const customers = allRows.length > 0 ? getUniqueCustomers(allRows) : []

  const handleDataLoaded = (rows: OrderRow[]) => {
    setAllRows(rows)
    setSelectedCustomer(null)
    setCustomerSummary(null)
  }

  const handleCustomerSelect = (kundnummer: number) => {
    setSelectedCustomer(kundnummer)
    const customerRows = filterByCustomer(allRows, kundnummer)
    const summary = calculateCustomerSummary(customerRows, kundnummer)
    setCustomerSummary(summary)
  }

  if (view === 'admin-varugrupp') {
    return (
      <AdminLayout title="Varugruppregister" onBack={() => setView('main')}>
        <VarugruppAdmin />
      </AdminLayout>
    )
  }

  if (view === 'admin-artikel') {
    return (
      <AdminLayout title="Artikelregister" onBack={() => setView('main')}>
        <ArtikelAdmin />
      </AdminLayout>
    )
  }

  return (
    <VarugruppProvider>
      <ArtikelProvider>
        <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Kundanalys</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setView('admin-varugrupp')}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Varugrupper
              </button>
              <button
                onClick={() => setView('admin-artikel')}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Artiklar
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          {allRows.length === 0 ? (
            <FileUpload onDataLoaded={handleDataLoaded} />
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <CustomerSelector
                      customers={customers}
                      selectedCustomer={selectedCustomer}
                      onSelect={handleCustomerSelect}
                    />
                    <span className="text-sm text-gray-500">
                      {allRows.length.toLocaleString('sv-SE')} orderrader laddade
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setAllRows([])
                      setSelectedCustomer(null)
                      setCustomerSummary(null)
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Ladda ny fil
                  </button>
                </div>
              </div>

              {customerSummary && <Dashboard summary={customerSummary} />}
            </div>
          )}
        </main>
        </div>
      </ArtikelProvider>
    </VarugruppProvider>
  )
}

export default App
