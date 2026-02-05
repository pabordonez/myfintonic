import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { ProfitabilityBadge } from '../features/financial-entities/components/ProfitabilityBadge'

describe('ProfitabilityBadge', () => {
  it('renders positive percentage correctly (Green)', () => {
    render(<ProfitabilityBadge currentValue={110} initialValue={100} />)
    // (110-100)/100 = 10%
    const badge = screen.getByText(/10\.00%/)
    expect(badge).toBeInTheDocument()
    // Verificamos clases de Tailwind para asegurar el estilo verde
    expect(badge).toHaveClass('text-green-800')
    expect(badge).toHaveClass('bg-green-100')
  })

  it('renders negative percentage correctly (Red)', () => {
    render(<ProfitabilityBadge currentValue={90} initialValue={100} />)
    // (90-100)/100 = -10%
    const badge = screen.getByText(/10\.00%/)
    expect(badge).toBeInTheDocument()
    // Verificamos clases de Tailwind para asegurar el estilo rojo
    expect(badge).toHaveClass('text-red-800')
    expect(badge).toHaveClass('bg-red-100')
  })

  it('renders zero percentage correctly (Gray)', () => {
    render(<ProfitabilityBadge currentValue={100} initialValue={100} />)
    const badge = screen.getByText(/0\.00%/)
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('text-gray-800')
    expect(badge).toHaveClass('bg-gray-100')
  })

  it('renders with provided percentage prop directly', () => {
    render(<ProfitabilityBadge percentage={25.5} />)
    expect(screen.getByText(/25\.50%/)).toBeInTheDocument()
  })

  it('renders with optional label', () => {
    render(<ProfitabilityBadge percentage={10} label="Total:" />)
    expect(screen.getByText(/Total:/)).toBeInTheDocument()
    expect(screen.getByText(/10\.00%/)).toBeInTheDocument()
  })

  it('handles zero initial value gracefully', () => {
    render(<ProfitabilityBadge currentValue={100} initialValue={0} />)
    expect(screen.getByText(/%/)).toBeInTheDocument()
  })

  it('handles null initial value', () => {
    // @ts-expect-error Testing invalid prop type
    render(<ProfitabilityBadge currentValue={100} initialValue={null} />)
    expect(screen.getByText(/%/)).toBeInTheDocument()
  })
})