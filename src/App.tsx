import { useState } from 'react'
import type { OrderRow, CustomerSummary } from './types'
import { FileUpload } from './components/FileUpload'
import { CustomerSelector } from './components/CustomerSelector'
import { Dashboard } from './components/Dashboard'
import { AdminLayout, VarugruppAdmin } from './components/admin'
import { VarugruppProvider } from './context/VarugruppContext'
import { getUniqueCustomers, filterByCustomer } from './utils/csvParser'
import { calculateCustomerSummary } from './utils/analytics'

type View = 'main' | 'admin-varugrupp'

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

  return (
    <VarugruppProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Kundanalys</h1>
            <button
              onClick={() => setView('admin-varugrupp')}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Varugruppregister
            </button>
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
    </VarugruppProvider>
  )
}

export default App
