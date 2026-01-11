import { useState } from 'react'
import type { OrderRow, CustomerSummary } from './types'
import { FileUpload } from './components/FileUpload'
import { CustomerSelector } from './components/CustomerSelector'
import { Dashboard } from './components/Dashboard'
import { getUniqueCustomers, filterByCustomer } from './utils/csvParser'
import { calculateCustomerSummary } from './utils/analytics'

function App() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Kundanalys</h1>
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

            {customerSummary && (
              <Dashboard summary={customerSummary} />
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
