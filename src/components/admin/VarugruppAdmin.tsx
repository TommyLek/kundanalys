import { useState } from 'react'
import { useVarugrupper } from '../../hooks/useVarugrupper'
import { isSupabaseConfigured } from '../../lib/supabase'
import { VarugruppTable } from './VarugruppTable'
import { VarugruppForm } from './VarugruppForm'
import { VarugruppImport } from './VarugruppImport'
import type { Varugrupp, VarugruppInsert } from '../../types/supabase'

export function VarugruppAdmin() {
  const {
    varugrupper,
    isLoading,
    error,
    refetch,
    createVarugrupp,
    updateVarugrupp,
    deleteVarugrupp,
  } = useVarugrupper()

  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Varugrupp | null>(null)

  if (!isSupabaseConfigured()) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-yellow-800">
          Supabase ej konfigurerad
        </h3>
        <p className="mt-2 text-sm text-yellow-700">
          For att anvanda varugruppregistret, konfigurera Supabase-anslutningen i .env.local
        </p>
      </div>
    )
  }

  const handleCreate = async (data: VarugruppInsert) => {
    const result = await createVarugrupp(data)
    if (result) {
      setShowForm(false)
    }
  }

  const handleUpdate = async (data: VarugruppInsert) => {
    if (editingItem) {
      const result = await updateVarugrupp(editingItem.varugrupp_id, data)
      if (result) {
        setEditingItem(null)
        setShowForm(false)
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm(`Vill du verkligen ta bort varugrupp ${id}?`)) {
      await deleteVarugrupp(id)
    }
  }

  const handleEdit = (item: Varugrupp) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleCancel = () => {
    setEditingItem(null)
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <VarugruppImport onImportComplete={refetch} />

      {showForm ? (
        <VarugruppForm
          initialData={editingItem}
          onSubmit={editingItem ? handleUpdate : handleCreate}
          onCancel={handleCancel}
          existingIds={varugrupper.map((v) => v.varugrupp_id)}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {varugrupper.length} varugrupper registrerade
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Lagg till varugrupp
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Laddar...</p>
            </div>
          ) : (
            <VarugruppTable
              varugrupper={varugrupper}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </>
      )}
    </div>
  )
}
