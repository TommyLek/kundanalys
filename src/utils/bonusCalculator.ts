import type { BonusType, BonusCalculation } from '../types'

interface BonusParams {
  totalForsaljning: number
  bonusType: BonusType
  procent: number
  avdrag: number
}

export function calculateBonus({
  totalForsaljning,
  bonusType,
  procent,
  avdrag,
}: BonusParams): BonusCalculation {
  if (bonusType === 'rak') {
    // Rak bonus: totalForsaljning * (procent / 100)
    const bonusAmount = totalForsaljning * (procent / 100)
    return {
      baseAmount: totalForsaljning,
      deductedAmount: 0,
      bonusAmount: Math.round(bonusAmount),
    }
  } else {
    // Med avdrag: (totalForsaljning - avdrag) * (procent / 100)
    const deductedAmount = Math.min(avdrag, totalForsaljning)
    const berakningsunderlag = Math.max(0, totalForsaljning - deductedAmount)
    const bonusAmount = berakningsunderlag * (procent / 100)
    return {
      baseAmount: totalForsaljning,
      deductedAmount,
      bonusAmount: Math.round(bonusAmount),
    }
  }
}
