import { useState } from 'react'
import type { Varugrupp, VarugruppInsert } from '../../types/supabase'

interface VarugruppFormProps {
  initialData: Varugrupp | null
  onSubmit: (data: VarugruppInsert) => Promise<void>
  onCancel: () => void
  existingIds: string[]
}

export function VarugruppForm({
  initialData,
  onSubmit,
  onCancel,
  existingIds,
}: VarugruppFormProps) {
  const isEditing = initialData !== null

  const [formData, setFormData] = useState<VarugruppInsert>({
    varugrupp_id: initialData?.varugrupp_id || '',
    varugrupp_namn: initialData?.varugrupp_namn || '',
    beskrivning: initialData?.beskrivning || '',
    aktiv: initialData?.aktiv ?? true,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.varugrupp_id.trim()) {
      newErrors.varugrupp_id = 'Varugrupp-ID ar obligatoriskt'
    } else if (!isEditing && existingIds.includes(formData.varugrupp_id)) {
      newErrors.varugrupp_id = 'Detta ID finns redan'
    }

    if (!formData.varugrupp_namn.trim()) {
      newErrors.varugrupp_namn = 'Namn ar obligatoriskt'
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
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {isEditing ? 'Redigera varugrupp' : 'Ny varugrupp'}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Varugrupp-ID *
          </label>
          <input
            type="text"
            value={formData.varugrupp_id}
            onChange={(e) => setFormData({ ...formData, varugrupp_id: e.target.value })}
            disabled={isEditing}
            className={`w-full px-3 py-2 border rounded-lg ${
              errors.varugrupp_id ? 'border-red-500' : 'border-gray-300'
            } ${isEditing ? 'bg-gray-100' : ''}`}
            placeholder="T.ex. 6479"
          />
          {errors.varugrupp_id && (
            <p className="mt-1 text-sm text-red-600">{errors.varugrupp_id}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Namn *
          </label>
          <input
            type="text"
            value={formData.varugrupp_namn}
            onChange={(e) => setFormData({ ...formData, varugrupp_namn: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg ${
              errors.varugrupp_namn ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="T.ex. Elektronik"
          />
          {errors.varugrupp_namn && (
            <p className="mt-1 text-sm text-red-600">{errors.varugrupp_namn}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Beskrivning
          </label>
          <textarea
            value={formData.beskrivning || ''}
            onChange={(e) => setFormData({ ...formData, beskrivning: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Valfri beskrivning..."
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="aktiv"
            checked={formData.aktiv}
            onChange={(e) => setFormData({ ...formData, aktiv: e.target.checked })}
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
