import { useState } from 'react'
import type { Artikel } from '../../types/supabase'

interface ArtikelTableProps {
  artiklar: Artikel[]
  onEdit: (item: Artikel) => void
  onDelete: (artikelnummer: string) => void
}

export function ArtikelTable({ artiklar, onEdit, onDelete }: ArtikelTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 50

  const filteredArtiklar = artiklar.filter(
    (a) =>
      a.artikelnummer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.artikeltext.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.varugrupp_id && a.varugrupp_id.includes(searchQuery))
  )

  const totalPages = Math.ceil(filteredArtiklar.length / pageSize)
  const paginatedArtiklar = filteredArtiklar.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  if (artiklar.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">Inga artiklar registrerade</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Sok artikelnummer, text eller varugrupp..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setCurrentPage(1)
          }}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
        />
        <span className="text-sm text-gray-500">
          {filteredArtiklar.length} artiklar
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Artikelnr
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Artikeltext
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Varugrupp
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Leverantor
              </th>
              <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Atgarder
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedArtiklar.map((item) => (
              <tr key={item.artikelnummer} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-sm font-medium text-gray-900">
                  {item.artikelnummer}
                </td>
                <td className="px-5 py-3 text-sm text-gray-900 max-w-xs truncate">
                  {item.artikeltext}
                </td>
                <td className="px-5 py-3 text-sm text-gray-500">
                  {item.varugrupp_id || '-'}
                </td>
                <td className="px-5 py-3 text-sm text-gray-500">
                  {item.leverantor_kontonummer || '-'}
                </td>
                <td className="px-5 py-3 text-center">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      item.aktiv
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
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
                    onClick={() => onDelete(item.artikelnummer)}
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Foregaende
          </button>
          <span className="text-sm text-gray-600">
            Sida {currentPage} av {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Nasta
          </button>
        </div>
      )}
    </div>
  )
}
