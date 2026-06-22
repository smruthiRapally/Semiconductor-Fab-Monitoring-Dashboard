import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

const colorMap = {
  blue: {
    border: 'border-l-blue-500',
    icon: 'bg-blue-50 text-blue-600',
    value: 'text-blue-600',
  },
  green: {
    border: 'border-l-green-500',
    icon: 'bg-green-50 text-green-600',
    value: 'text-green-600',
  },
  indigo: {
    border: 'border-l-indigo-500',
    icon: 'bg-indigo-50 text-indigo-600',
    value: 'text-indigo-600',
  },
  red: {
    border: 'border-l-red-500',
    icon: 'bg-red-50 text-red-600',
    value: 'text-red-600',
  },
  yellow: {
    border: 'border-l-yellow-500',
    icon: 'bg-yellow-50 text-yellow-600',
    value: 'text-yellow-600',
  },
  purple: {
    border: 'border-l-purple-500',
    icon: 'bg-purple-50 text-purple-600',
    value: 'text-purple-600',
  },
}

export default function StatCard({ label, value, unit = '', change, changeType, color = 'blue', icon: Icon }) {
  const colors = colorMap[color] || colorMap.blue
  const isPositive = changeType === 'positive'

  return (
    <div
      className={`
        bg-white rounded-xl shadow-sm border border-gray-100
        border-l-4 ${colors.border}
        p-5 flex flex-col gap-4
        transition-all duration-300 hover:-translate-y-1 hover:shadow-md
        animate-fade-in cursor-default
      `}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${colors.value}`}>
            {value}
            {unit && <span className="text-xl ml-0.5">{unit}</span>}
          </p>
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors.icon} flex-shrink-0`}>
            <Icon size={22} />
          </div>
        )}
      </div>

      {change && (
        <div className="flex items-center gap-1.5 pt-1 border-t border-gray-50">
          {isPositive ? (
            <TrendingUp size={14} className="text-green-500" />
          ) : (
            <TrendingDown size={14} className="text-red-500" />
          )}
          <span className={`text-xs font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </span>
          <span className="text-xs text-gray-400">vs last week</span>
        </div>
      )}
    </div>
  )
}
