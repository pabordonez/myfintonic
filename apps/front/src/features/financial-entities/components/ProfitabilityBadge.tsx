import { ArrowDown, ArrowUp, Minus } from 'lucide-react'

interface ProfitabilityBadgeProps {
  currentValue?: number
  initialValue?: number
  percentage?: number
  label?: string
  className?: string
  iconSize?: number
}

export const ProfitabilityBadge = ({
  currentValue,
  initialValue,
  percentage: providedPercentage,
  label,
  className = 'px-2.5 py-0.5 text-xs',
  iconSize = 3,
}: ProfitabilityBadgeProps) => {
  let percentage = 0

  if (providedPercentage !== undefined) {
    percentage = providedPercentage
  } else if (
    currentValue !== undefined &&
    initialValue !== undefined &&
    initialValue !== 0
  ) {
    percentage = ((currentValue - initialValue) / initialValue) * 100
  }

  const isPositive = percentage > 0
  const isNegative = percentage < 0

  return (
    <div
      className={`flex items-center rounded-full font-medium ${
        isPositive
          ? 'bg-green-100 text-green-800'
          : isNegative
            ? 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-800'
      } ${className}`}
    >
      {isPositive ? (
        <ArrowUp className={`w-${iconSize} h-${iconSize} mr-1`} />
      ) : isNegative ? (
        <ArrowDown className={`w-${iconSize} h-${iconSize} mr-1`} />
      ) : (
        <Minus className={`w-${iconSize} h-${iconSize} mr-1`} />
      )}
      {label && <span className="mr-1">{label}</span>}
      {Math.abs(percentage).toFixed(2)}%
    </div>
  )
}
