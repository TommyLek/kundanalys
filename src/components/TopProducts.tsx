import { useEffect } from 'react'
import type { ProductSales } from '../types'
import { useVarugruppContext } from '../context/VarugruppContext'
import { useArtikelContext } from '../context/ArtikelContext'

interface TopProductsProps {
  products: ProductSales[]
}

function formatCurrency(value: number): string {
  return value.toLocaleString('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function formatNumber(value: number): string {
  return value.toLocaleString('sv-SE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export function TopProducts({ products }: TopProductsProps) {
  const { getVarugruppLabel } = useVarugruppContext()
  const { getArtikelText, fetchArtiklar } = useArtikelContext()

  // Fetch artikel data for displayed products
  useEffect(() => {
    const artikelnummer = products
      .map((p) => p.artikelnummer)
      .filter((nr) => nr && nr !== 'Okänd')
    if (artikelnummer.length > 0) {
      fetchArtiklar(artikelnummer)
    }
  }, [products, fetchArtiklar])

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Topp produkter
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Artikelnummer
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Artikeltext
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Varugrupp
              </th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Forsaljning
              </th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Antal
              </th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                <span className="inline-flex items-center gap-1">
                  Marginal
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-600">
                    Intern
                  </span>
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product, index) => {
              const marginal = product.forsaljning - product.kostnad
              const marginalPercent =
                product.forsaljning > 0
                  ? (marginal / product.forsaljning) * 100
                  : 0

              return (
                <tr
                  key={product.artikelnummer + index}
                  className="hover:bg-gray-50"
                >
                  <td className="px-5 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.artikelnummer || '-'}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-900 max-w-xs truncate" title={getArtikelText(product.artikelnummer)}>
                    {getArtikelText(product.artikelnummer)}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-500">
                    {getVarugruppLabel(product.varugrupp)}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(product.forsaljning)}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatNumber(product.antal)}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-sm text-right">
                    <span
                      className={
                        marginal >= 0 ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      {formatCurrency(marginal)}
                    </span>
                    <span className="text-gray-400 ml-1">
                      ({marginalPercent.toFixed(1)}%)
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
