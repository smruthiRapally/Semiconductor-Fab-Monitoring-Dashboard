import React from 'react'
import { Thermometer, Gauge, Clock, Activity, Cpu } from 'lucide-react'

const statusConfig = {
  Running: {
    dot: 'bg-green-500',
    badge: 'bg-green-100 text-green-700 border-green-200',
    glow: 'shadow-green-100',
    label: 'Running',
  },
  Idle: {
    dot: 'bg-yellow-500',
    badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    glow: 'shadow-yellow-100',
    label: 'Idle',
  },
  Maintenance: {
    dot: 'bg-red-500',
    badge: 'bg-red-100 text-red-700 border-red-200',
    glow: 'shadow-red-100',
    label: 'Maintenance',
  },
}

function TempBar({ value }) {
  // 60–90 range
  const pct = ((value - 60) / 30) * 100
  const color = value > 80 ? 'bg-red-500' : value > 70 ? 'bg-yellow-500' : 'bg-green-500'
  return (
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function PressureBar({ value }) {
  // 1.0–2.5 range
  const pct = ((value - 1.0) / 1.5) * 100
  const color = value > 2.0 ? 'bg-orange-500' : 'bg-blue-500'
  return (
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default function MachineCard({ id, name, type, location, temperature, pressure, status, runtime }) {
  const cfg = statusConfig[status] || statusConfig['Idle']

  return (
    <div
      className={`
        bg-white rounded-xl border border-gray-100 p-5
        transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5
        shadow-sm animate-fade-in
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
            <Cpu size={18} className="text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">{name}</h3>
            <p className="text-xs text-gray-500">{type}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full live-indicator ${cfg.dot}`} />
          {cfg.label}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Temperature */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Thermometer size={13} className="text-orange-500" />
            <p className="text-xs text-gray-500 font-medium">Temperature</p>
          </div>
          <p className="text-lg font-bold text-gray-900">{temperature}°C</p>
          <TempBar value={temperature} />
        </div>

        {/* Pressure */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Gauge size={13} className="text-blue-500" />
            <p className="text-xs text-gray-500 font-medium">Pressure</p>
          </div>
          <p className="text-lg font-bold text-gray-900">{pressure} bar</p>
          <PressureBar value={pressure} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="text-gray-400" />
          <span className="text-xs text-gray-500">Runtime</span>
          <span className="text-xs font-semibold text-gray-700">{runtime} hrs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Activity size={13} className="text-gray-400" />
          <span className="text-xs text-gray-500">{location}</span>
        </div>
      </div>
    </div>
  )
}
