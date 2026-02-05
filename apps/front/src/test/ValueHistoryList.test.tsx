import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { ValueHistoryList, ValueHistory } from '../features/financial-entities/components/ValueHistoryList'

describe('ValueHistoryList', () => {
  const mockHistory: ValueHistory[] = [
    { date: '2023-10-01T10:00:00Z', value: 1100, previousValue: 1000 }, // +10%
    { date: '2023-09-01T10:00:00Z', value: 900, previousValue: 1000 },  // -10%
    { date: '2023-08-01T10:00:00Z', value: 1000, previousValue: 1000 }, // 0%
  ]

  it('renders correctly with data', () => {
    render(<ValueHistoryList history={mockHistory} />)
    expect(screen.getByText('Histórico de Valoraciones')).toBeInTheDocument()
    expect(screen.getByText('01/10/2023')).toBeInTheDocument()
    // Check for percentage text
    const percentageElements = screen.getAllByText(/10\.00%/)
    expect(percentageElements.length).toBeGreaterThan(0)
  })

  it('renders only the last 10 items sorted by date', () => {
    const longHistory = Array.from({ length: 15 }, (_, i) => ({
      date: new Date(2023, 0, i + 1).toISOString(),
      value: 100 + i,
      previousValue: 100,
    }))

    render(<ValueHistoryList history={longHistory} />)
    
    // Should show the latest date (Jan 15)
    expect(screen.getByText('15/01/2023')).toBeInTheDocument()
    // Should NOT show the oldest date (Jan 1) because limit is 10. 
    expect(screen.queryByText('01/01/2023')).not.toBeInTheDocument()
    
    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(10)
  })

  it('calculates percentage correctly and applies styles', () => {
    render(<ValueHistoryList history={mockHistory} />)
    
    // 1100 vs 1000 -> +10% (Green)
    const positiveElement = screen.getByText((content, element) => {
      return (element?.textContent?.includes('10.00%') && element?.className.includes('text-green-800')) ?? false
    })
    expect(positiveElement).toBeInTheDocument()
    
    // 900 vs 1000 -> -10% (Red)
    const negativeElement = screen.getByText((content, element) => {
      return (element?.textContent?.includes('10.00%') && element?.className.includes('text-red-800')) ?? false
    })
    expect(negativeElement).toBeInTheDocument()
  })

  it('formats currency correctly', () => {
     render(<ValueHistoryList history={mockHistory} />)
     // Check for formatted currency string. 
     // 1.100,00 €
     const currencyElements = screen.getAllByText(/1[\.\s]?100,00\s*€/)
     expect(currencyElements.length).toBeGreaterThan(0)
  })

  it('renders items with null previousValue as 0 change', () => {
    const historyWithNulls = [
      { date: '2023-10-01T10:00:00Z', value: 1100, previousValue: 1000 },
      { date: '2023-09-01T10:00:00Z', value: 900, previousValue: null },
    ] as unknown as ValueHistory[]

    render(<ValueHistoryList history={historyWithNulls} />)

    // Should render the valid item
    expect(screen.getByText('01/10/2023')).toBeInTheDocument()
    // Should render the item with null previousValue
    expect(screen.getByText('01/09/2023')).toBeInTheDocument()
    
    // Should show 0.00% for the null previous value item
    expect(screen.getByText('0.00%')).toBeInTheDocument()
  })

  it('calculates and displays total profitability based on initialBalance', () => {
    const initialBalance = 1000
    // Latest value is 1100 (first in sorted list)
    // Profitability = ((1100 - 1000) / 1000) * 100 = 10%
    render(<ValueHistoryList history={mockHistory} initialBalance={initialBalance} />)

    // Check for Total badge
    const totalBadge = screen.getByText((content, element) => {
      return (
        (element?.textContent?.includes('Total:10.00%') && element?.className.includes('text-green-800')) ?? false
      )
    })
    expect(totalBadge).toBeInTheDocument()
  })

  it('renders correctly when history is empty', () => {
    render(<ValueHistoryList history={[]} />)
    expect(screen.getByText('No hay historial disponible.')).toBeInTheDocument()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })

  it('renders correctly when history is undefined', () => {
    render(<ValueHistoryList history={undefined as any} />)
    expect(screen.getByText('No hay historial disponible.')).toBeInTheDocument()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })
})