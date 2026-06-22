import React from 'react'

export default function ChartCard({ title, subtitle, children, action, className = '' }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-fade-in ${className}`}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  )
}
