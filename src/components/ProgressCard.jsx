import React, { useEffect, useState } from 'react'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

function getProgressColor(progress) {
  if (progress >= 90) return { bar: 'bg-green-500', text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' }
  if (progress >= 80) return { bar: 'bg-yellow-500', text: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' }
  return { bar: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
}

function getStatusLabel(progress) {
  if (progress >= 90) return { label: 'On Track', icon: CheckCircle }
  if (progress >= 80) return { label: 'Caution', icon: Clock }
  return { label: 'Behind', icon: AlertCircle }
}

export default function ProgressCard({ name, progress, description, wafers, target, index = 0 }) {
  const [animated, setAnimated] = useState(false)
  const colors = getProgressColor(progress)
  const status = getStatusLabel(progress)
  const StatusIcon = status.icon

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), index * 150 + 100)
    return () => clearTimeout(timer)
  }, [index])

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all duration-300 hover:shadow-md animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{name}</h3>
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
          <StatusIcon size={11} />
          {status.label}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-gray-500 font-medium">Progress</span>
          <span className={`text-sm font-bold ${colors.text}`}>{progress}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${colors.bar}`}
            style={{ width: animated ? `${progress}%` : '0%' }}
          />
        </div>
      </div>

      {/* Wafer Stats */}
      {(wafers !== undefined && target !== undefined) && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="text-center">
            <p className="text-xs text-gray-500">Completed</p>
            <p className="text-sm font-bold text-gray-800">{wafers.toLocaleString()}</p>
          </div>
          <div className="h-6 w-px bg-gray-200" />
          <div className="text-center">
            <p className="text-xs text-gray-500">Target</p>
            <p className="text-sm font-bold text-gray-800">{target.toLocaleString()}</p>
          </div>
          <div className="h-6 w-px bg-gray-200" />
          <div className="text-center">
            <p className="text-xs text-gray-500">Remaining</p>
            <p className="text-sm font-bold text-gray-800">{(target - wafers).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  )
}
