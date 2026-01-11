import { useState } from 'react'
import type { Artikel, ArtikelInsert } from '../../types/supabase'

interface ArtikelFormProps {
  initialData: Artikel | null
  onSubmit: (data: ArtikelInsert) => Promise<void>
  onCancel: () => void
  existingIds: string[]
}

export function ArtikelForm({
  initialData,
  onSubmit,
  onCancel,
  existingIds,
}: ArtikelFormProps) {
  const isEditing = initialData !== null

  const [formData, setFormData] = useState<ArtikelInsert>({
    artikelnummer: initialData?.artikelnummer || '',
    varugrupp_id: initialData?.varugrupp_id || '',
    artikeltext: initialData?.artikeltext || '',
    leverantor_kontonummer: initialData?.leverantor_kontonummer || undefined,
    aktiv: initialData?.aktiv ?? true,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.artikelnummer.trim()) {
      newErrors.artikelnummer = 'Artikelnummer ar obligatoriskt'
    } else if (!isEditing && existingIds.includes(formData.artikelnummer)) {
      newErrors.artikelnummer = 'Detta artikelnummer finns redan'
    }

    if (!formData.artikeltext.trim()) {
      newErrors.artikeltext = 'Artikeltext ar obligatoriskt'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {isEditing ? 'Redigera artikel' : 'Ny artikel'}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Artikelnummer *
          </label>
          <input
            type="text"
            value={formData.artikelnummer}
            onChange={(e) =>
              setFormData({ ...formData, artikelnummer: e.target.value })
            }
            disabled={isEditing}
            className={`w-full px-3 py-2 border rounded-lg ${
              errors.artikelnummer ? 'border-red-500' : 'border-gray-300'
            } ${isEditing ? 'bg-gray-100' : ''}`}
            placeholder="T.ex. 910075981"
          />
          {errors.artikelnummer && (
            <p className="mt-1 text-sm text-red-600">{errors.artikelnummer}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Artikeltext *
          </label>
          <input
            type="text"
            value={formData.artikeltext}
            onChange={(e) =>
              setFormData({ ...formData, artikeltext: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-lg ${
              errors.artikeltext ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="T.ex. SMOOTHIE TWISTER 6630"
          />
          {errors.artikeltext && (
            <p className="mt-1 text-sm text-red-600">{errors.artikeltext}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Varugrupp-ID
          </label>
          <input
            type="text"
            value={formData.varugrupp_id || ''}
            onChange={(e) =>
              setFormData({ ...formData, varugrupp_id: e.target.value || null })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="T.ex. 1213"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Leverantor kontonummer
          </label>
          <input
            type="number"
            value={formData.leverantor_kontonummer || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                leverantor_kontonummer: e.target.value
                  ? parseInt(e.target.value, 10)
                  : undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="T.ex. 53392288"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="aktiv"
            checked={formData.aktiv}
            onChange={(e) =>
              setFormData({ ...formData, aktiv: e.target.checked })
            }
            className="h-4 w-4 text-blue-600 rounded border-gray-300"
          />
          <label htmlFor="aktiv" className="text-sm text-gray-700">
            Aktiv
          </label>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Sparar...' : isEditing ? 'Spara andringar' : 'Skapa'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Avbryt
        </button>
      </div>
    </form>
  )
}
