// Cost of living data by state (indexed to national average of 100)
// Data approximated from various cost of living indices
export const costOfLivingByState: { [key: string]: { index: number; medianRent: number; medianIncome: number } } = {
  'Alabama': { index: 85, medianRent: 850, medianIncome: 52000 },
  'Alaska': { index: 125, medianRent: 1250, medianIncome: 77000 },
  'Arizona': { index: 102, medianRent: 1350, medianIncome: 62000 },
  'Arkansas': { index: 83, medianRent: 800, medianIncome: 49000 },
  'California': { index: 138, medianRent: 2100, medianIncome: 80000 },
  'Colorado': { index: 105, medianRent: 1650, medianIncome: 75000 },
  'Connecticut': { index: 108, medianRent: 1400, medianIncome: 79000 },
  'Delaware': { index: 101, medianRent: 1250, medianIncome: 70000 },
  'Florida': { index: 99, medianRent: 1500, medianIncome: 59000 },
  'Georgia': { index: 91, medianRent: 1200, medianIncome: 61000 },
  'Hawaii': { index: 170, medianRent: 2200, medianIncome: 83000 },
  'Idaho': { index: 95, medianRent: 1100, medianIncome: 60000 },
  'Illinois': { index: 93, medianRent: 1200, medianIncome: 68000 },
  'Indiana': { index: 84, medianRent: 950, medianIncome: 57000 },
  'Iowa': { index: 88, medianRent: 900, medianIncome: 61000 },
  'Kansas': { index: 86, medianRent: 900, medianIncome: 60000 },
  'Kentucky': { index: 85, medianRent: 850, medianIncome: 52000 },
  'Louisiana': { index: 88, medianRent: 950, medianIncome: 51000 },
  'Maine': { index: 96, medianRent: 1100, medianIncome: 59000 },
  'Maryland': { index: 117, medianRent: 1650, medianIncome: 86000 },
  'Massachusetts': { index: 127, medianRent: 1900, medianIncome: 84000 },
  'Michigan': { index: 88, medianRent: 950, medianIncome: 59000 },
  'Minnesota': { index: 96, medianRent: 1200, medianIncome: 74000 },
  'Mississippi': { index: 81, medianRent: 800, medianIncome: 46000 },
  'Missouri': { index: 86, medianRent: 950, medianIncome: 57000 },
  'Montana': { index: 97, medianRent: 1100, medianIncome: 57000 },
  'Nebraska': { index: 88, medianRent: 950, medianIncome: 63000 },
  'Nevada': { index: 100, medianRent: 1300, medianIncome: 63000 },
  'New Hampshire': { index: 107, medianRent: 1400, medianIncome: 77000 },
  'New Jersey': { index: 115, medianRent: 1700, medianIncome: 85000 },
  'New Mexico': { index: 89, medianRent: 950, medianIncome: 51000 },
  'New York': { index: 125, medianRent: 1800, medianIncome: 72000 },
  'North Carolina': { index: 92, medianRent: 1100, medianIncome: 57000 },
  'North Dakota': { index: 93, medianRent: 950, medianIncome: 64000 },
  'Ohio': { index: 86, medianRent: 950, medianIncome: 58000 },
  'Oklahoma': { index: 84, medianRent: 850, medianIncome: 54000 },
  'Oregon': { index: 118, medianRent: 1450, medianIncome: 67000 },
  'Pennsylvania': { index: 93, medianRent: 1100, medianIncome: 63000 },
  'Rhode Island': { index: 107, medianRent: 1350, medianIncome: 71000 },
  'South Carolina': { index: 90, medianRent: 1050, medianIncome: 56000 },
  'South Dakota': { index: 89, medianRent: 850, medianIncome: 59000 },
  'Tennessee': { index: 87, medianRent: 1050, medianIncome: 56000 },
  'Texas': { index: 91, medianRent: 1200, medianIncome: 64000 },
  'Utah': { index: 101, medianRent: 1300, medianIncome: 75000 },
  'Vermont': { index: 105, medianRent: 1250, medianIncome: 63000 },
  'Virginia': { index: 103, medianRent: 1400, medianIncome: 76000 },
  'Washington': { index: 113, medianRent: 1600, medianIncome: 78000 },
  'West Virginia': { index: 84, medianRent: 750, medianIncome: 49000 },
  'Wisconsin': { index: 91, medianRent: 1000, medianIncome: 64000 },
  'Wyoming': { index: 92, medianRent: 950, medianIncome: 65000 },
  'Washington DC': { index: 152, medianRent: 2200, medianIncome: 90000 },
}

export const US_STATES = Object.keys(costOfLivingByState).sort()

export interface CostOfLivingData {
  index: number
  medianRent: number
  medianIncome: number
}

export function getCostOfLiving(state: string): CostOfLivingData | null {
  return costOfLivingByState[state] || null
}

export function calculateMinimumSalary(
  state: string,
  monthlyExpenses: number,
  vaDisability: number = 0
): {
  minimumSalary: number
  takehomePay: number
  monthlyIncome: number
  breakdown: {
    grossMonthly: number
    estimatedTaxes: number
    netMonthly: number
    vaDisability: number
    totalMonthly: number
    expenses: number
    surplus: number
  }
} | null {
  const costData = getCostOfLiving(state)
  if (!costData) return null

  // Calculate required net monthly income (after VA disability)
  // Clamp to 0 — if VA disability covers all expenses, minimum salary is $0
  const requiredNetMonthly = Math.max(0, monthlyExpenses - vaDisability)

  // Estimate taxes at ~25% effective rate (federal + state + FICA)
  const taxRate = 0.25

  // Back-calculate gross salary needed
  const grossMonthly = requiredNetMonthly > 0 ? requiredNetMonthly / (1 - taxRate) : 0
  const minimumSalary = Math.ceil(grossMonthly * 12)

  // Calculate actual breakdown
  const estimatedTaxes = grossMonthly * taxRate
  const netMonthly = grossMonthly - estimatedTaxes
  const totalMonthly = netMonthly + vaDisability
  const surplus = totalMonthly - monthlyExpenses

  return {
    minimumSalary,
    takehomePay: Math.ceil(netMonthly * 12),
    monthlyIncome: totalMonthly,
    breakdown: {
      grossMonthly: Math.ceil(grossMonthly),
      estimatedTaxes: Math.ceil(estimatedTaxes),
      netMonthly: Math.ceil(netMonthly),
      vaDisability,
      totalMonthly: Math.ceil(totalMonthly),
      expenses: monthlyExpenses,
      surplus: Math.ceil(surplus)
    }
  }
}

export function calculateRecommendedSalary(
  state: string,
  monthlyExpenses: number,
  vaDisability: number = 0,
  savingsGoal: number = 0.20 // 20% savings rate recommended
): number | null {
  const costData = getCostOfLiving(state)
  if (!costData) return null

  // Calculate required net monthly to cover expenses + savings
  // Clamp to 0 — if VA disability covers all expenses, minimum salary is $0
  const baseRequired = Math.max(0, monthlyExpenses - vaDisability)
  const requiredNetMonthly = baseRequired / (1 - savingsGoal)

  // Estimate taxes
  const taxRate = 0.25
  const grossMonthly = requiredNetMonthly > 0 ? requiredNetMonthly / (1 - taxRate) : 0

  return Math.ceil(grossMonthly * 12)
}
