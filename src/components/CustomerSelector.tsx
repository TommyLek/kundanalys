interface CustomerSelectorProps {
  customers: number[]
  selectedCustomer: number | null
  onSelect: (kundnummer: number) => void
}

export function CustomerSelector({
  customers,
  selectedCustomer,
  onSelect,
}: CustomerSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="customer-select" className="text-sm font-medium text-gray-700">
        Valj kund:
      </label>
      <select
        id="customer-select"
        value={selectedCustomer ?? ''}
        onChange={(e) => {
          const value = e.target.value
          if (value) {
            onSelect(parseInt(value, 10))
          }
        }}
        className="block w-48 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">-- Valj kund --</option>
        {customers.map((kundnummer) => (
          <option key={kundnummer} value={kundnummer}>
            Kund {kundnummer}
          </option>
        ))}
      </select>
    </div>
  )
}
