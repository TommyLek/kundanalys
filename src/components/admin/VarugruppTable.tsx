import type { Varugrupp } from '../../types/supabase'

interface VarugruppTableProps {
  varugrupper: Varugrupp[]
  onEdit: (item: Varugrupp) => void
  onDelete: (id: string) => void
}

export function VarugruppTable({ varugrupper, onEdit, onDelete }: VarugruppTableProps) {
  if (varugrupper.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">Inga varugrupper registrerade</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Namn</th>
            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beskrivning</th>
            <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Atgarder</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {varugrupper.map((item) => (
            <tr key={item.varugrupp_id} className="hover:bg-gray-50">
              <td className="px-5 py-3 text-sm font-medium text-gray-900">
                {item.varugrupp_id}
              </td>
              <td className="px-5 py-3 text-sm text-gray-900">
                {item.varugrupp_namn}
              </td>
              <td className="px-5 py-3 text-sm text-gray-500 max-w-xs truncate">
                {item.beskrivning || '-'}
              </td>
              <td className="px-5 py-3 text-center">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    item.aktiv ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {item.aktiv ? 'Aktiv' : 'Inaktiv'}
                </span>
              </td>
              <td className="px-5 py-3 text-right text-sm">
                <button
                  onClick={() => onEdit(item)}
                  className="text-blue-600 hover:text-blue-800 mr-3"
                >
                  Redigera
                </button>
                <button
                  onClick={() => onDelete(item.varugrupp_id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Ta bort
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
