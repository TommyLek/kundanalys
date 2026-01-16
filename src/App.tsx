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
  const [showInternalData, setShowInternalData] = useState(true)
  const [showBonusCalculator, setShowBonusCalculator] = useState(false)
  const [bonusAmount, setBonusAmount] = useState(0)

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
    setShowBonusCalculator(false)
    setBonusAmount(0)
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
                  <div className="flex items-center gap-4">
                    {customerSummary && (
                      <button
                        onClick={() => setShowBonusCalculator(!showBonusCalculator)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          showBonusCalculator
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title="Beräkning"
                      >
                        B
                      </button>
                    )}
                    <button
                      onClick={() => setShowInternalData(!showInternalData)}
                      className={`text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${
                        showInternalData
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {showInternalData ? (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Internt lage
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                          Kundvisning
                        </>
                      )}
                    </button>
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
              </div>

              {customerSummary && (
                <Dashboard
                  summary={customerSummary}
                  showInternalData={showInternalData}
                  showBonusCalculator={showBonusCalculator}
                  onCloseBonusCalculator={() => setShowBonusCalculator(false)}
                  bonusAmount={bonusAmount}
                  onBonusChange={setBonusAmount}
                />
              )}
            </div>
          )}
        </main>
        </div>
      </ArtikelProvider>
    </VarugruppProvider>
  )
}

export default App
