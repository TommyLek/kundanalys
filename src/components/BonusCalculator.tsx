import { useState, useEffect } from 'react'
import type { BonusType } from '../types'
import { calculateBonus } from '../utils/bonusCalculator'

interface BonusCalculatorProps {
  totalForsaljning: number
  kundnummer: number
  onClose: () => void
  onBonusChange: (amount: number) => void
}

function formatCurrency(value: number): string {
  return value.toLocaleString('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function parseSwedishNumber(value: string): number {
  // Handle Swedish number format (space as thousand separator, comma as decimal)
  const cleaned = value.replace(/\s/g, '').replace(',', '.')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

function formatSwedishNumber(value: number, decimals: number = 1): string {
  return value.toLocaleString('sv-SE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function BonusCalculator({ totalForsaljning, kundnummer, onClose, onBonusChange }: BonusCalculatorProps) {
  const [bonusType, setBonusType] = useState<BonusType>('rak')
  const [procentTyp1, setProcentTyp1] = useState('2,5')
  const [procentTyp2, setProcentTyp2] = useState('3,0')
  const [avdrag, setAvdrag] = useState('150 000')

  // Reset when customer changes
  useEffect(() => {
    setBonusType('rak')
    setProcentTyp1('2,5')
    setProcentTyp2('3,0')
    setAvdrag('150 000')
  }, [kundnummer])

  const procent = bonusType === 'rak' ? parseSwedishNumber(procentTyp1) : parseSwedishNumber(procentTyp2)
  const avdragValue = parseSwedishNumber(avdrag)

  const calculation = calculateBonus({
    totalForsaljning,
    bonusType,
    procent,
    avdrag: avdragValue,
  })

  // Report bonus amount changes to parent
  useEffect(() => {
    onBonusChange(calculation.bonusAmount)
  }, [calculation.bonusAmount, onBonusChange])

  const berakningsunderlag = calculation.baseAmount - calculation.deductedAmount

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Beräkning</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Bonus type selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Typ:</label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="bonusType"
              checked={bonusType === 'rak'}
              onChange={() => setBonusType('rak')}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Typ 1</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="bonusType"
              checked={bonusType === 'medAvdrag'}
              onChange={() => setBonusType('medAvdrag')}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Typ 2</span>
          </label>
        </div>
      </div>

      {/* Input fields */}
      <div className="space-y-4 mb-6">
        {bonusType === 'rak' ? (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600 mb-2">Typ 1 - Rak beräkning:</p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Procentsats:</label>
              <input
                type="text"
                value={procentTyp1}
                onChange={(e) => setProcentTyp1(e.target.value)}
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-right"
              />
              <span className="text-sm text-gray-600">%</span>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600 mb-2">Typ 2 - Beräkning med avdrag:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 w-40">Avdrag:</label>
                <input
                  type="text"
                  value={avdrag}
                  onChange={(e) => setAvdrag(e.target.value)}
                  className="w-28 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-right"
                />
                <span className="text-sm text-gray-600">kr</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 w-40">Procentsats på resterande:</label>
                <input
                  type="text"
                  value={procentTyp2}
                  onChange={(e) => setProcentTyp2(e.target.value)}
                  className="w-28 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-right"
                />
                <span className="text-sm text-gray-600">%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calculation result */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Totalbelopp:</span>
          <span className="text-gray-900">{formatCurrency(calculation.baseAmount)}</span>
        </div>
        {bonusType === 'medAvdrag' && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Avdrag:</span>
              <span className="text-gray-900">- {formatCurrency(calculation.deductedAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Beräkningsunderlag:</span>
              <span className="text-gray-900">{formatCurrency(berakningsunderlag)}</span>
            </div>
          </>
        )}
        <div className="flex justify-between text-sm text-gray-500">
          <span>Procentsats:</span>
          <span>{formatSwedishNumber(procent)} %</span>
        </div>
        <div className="border-t border-gray-300 pt-2 mt-2">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-900">BERÄKNAT BELOPP:</span>
            <span className="font-semibold text-gray-900">{formatCurrency(calculation.bonusAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
