import { useState } from 'react'
import { useArtiklar } from '../../hooks/useArtiklar'
import { isSupabaseConfigured } from '../../lib/supabase'
import { ArtikelTable } from './ArtikelTable'
import { ArtikelForm } from './ArtikelForm'
import { ArtikelImport } from './ArtikelImport'
import type { Artikel, ArtikelInsert } from '../../types/supabase'

export function ArtikelAdmin() {
  const {
    artiklar,
    isLoading,
    error,
    refetch,
    createArtikel,
    updateArtikel,
    deleteArtikel,
  } = useArtiklar()

  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Artikel | null>(null)

  if (!isSupabaseConfigured()) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-yellow-800">
          Supabase ej konfigurerad
        </h3>
        <p className="mt-2 text-sm text-yellow-700">
          For att anvanda artikelregistret, konfigurera Supabase-anslutningen i
          .env.local
        </p>
      </div>
    )
  }

  const handleCreate = async (data: ArtikelInsert) => {
    const result = await createArtikel(data)
    if (result) {
      setShowForm(false)
    }
  }

  const handleUpdate = async (data: ArtikelInsert) => {
    if (editingItem) {
      const result = await updateArtikel(editingItem.artikelnummer, data)
      if (result) {
        setEditingItem(null)
        setShowForm(false)
      }
    }
  }

  const handleDelete = async (artikelnummer: string) => {
    if (confirm(`Vill du verkligen ta bort artikel ${artikelnummer}?`)) {
      await deleteArtikel(artikelnummer)
    }
  }

  const handleEdit = (item: Artikel) => {
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

      <ArtikelImport onImportComplete={refetch} />

      {showForm ? (
        <ArtikelForm
          initialData={editingItem}
          onSubmit={editingItem ? handleUpdate : handleCreate}
          onCancel={handleCancel}
          existingIds={artiklar.map((a) => a.artikelnummer)}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {artiklar.length.toLocaleString('sv-SE')} artiklar registrerade
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Lagg till artikel
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Laddar...</p>
            </div>
          ) : (
            <ArtikelTable
              artiklar={artiklar}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </>
      )}
    </div>
  )
}
