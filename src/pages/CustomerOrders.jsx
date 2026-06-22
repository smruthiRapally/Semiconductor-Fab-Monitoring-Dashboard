import React, { useState, useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  ShoppingCart, Search, Filter, ChevronRight, X,
  Truck, CalendarClock, Clock, CheckCircle, Layers,
  TrendingUp, AlertCircle, ArrowUpRight, Radio,
  Building2, Globe, Mail, Package, Zap, Timer,
  BarChart2, IndianRupee, Star, Users, Activity,
} from 'lucide-react'
import { customerOrdersData } from '../data/mockData'

/* ─── shared helpers ─────────────────────────────────────────────── */
function fmtINR(v) {
  if (v >= 10000000) return `₹${(v/10000000).toFixed(2)}Cr`
  if (v >= 100000)   return `₹${(v/100000).toFixed(1)}L`
  return `₹${v.toLocaleString('en-IN')}`
}
function fmtDate(s) {
  return new Date(s).toLocaleDateString('en-IN',{ day:'2-digit', month:'short', year:'numeric' })
}
function daysDiff(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000)
}

/* ─── config ──────────────────────────────────────────────────────── */
const PRIORITY_CFG = {
  CRITICAL: { cls:'badge-red',   color:'#f87171', rank:0 },
  HIGH:     { cls:'badge-amber', color:'#fbbf24', rank:1 },
  NORMAL:   { cls:'badge-blue',  color:'#60a5fa', rank:2 },
}
const STATUS_CFG = {
  'In Fab':      { color:'#06b6d4', dot:'bg-cyan-400',    live:true  },
  'Lithography': { color:'#a78bfa', dot:'bg-purple-400',  live:true  },
  'Testing':     { color:'#4ade80', dot:'bg-green-400',   live:true  },
  'Raw Wafer':   { color:'#64748b', dot:'bg-slate-400',   live:false },
  'Packaging':   { color:'#fb923c', dot:'bg-orange-400',  live:true  },
  'Queued':      { color:'#475569', dot:'bg-slate-500',   live:false },
  'Completed':   { color:'#4ade80', dot:'bg-green-400',   live:false },
}
const STAGES = ['Queued','Raw Wafer','Lithography','Etching','Deposition',
                'Metallization','Testing','Packaging','Completed']
const DELIVERY_CFG = {
  'On Track':     { color:'#4ade80', bg:'rgba(74,222,128,0.1)',  border:'rgba(74,222,128,0.3)'  },
  'Near Complete':{ color:'#22d3ee', bg:'rgba(34,211,238,0.1)',  border:'rgba(34,211,238,0.3)'  },
  'Due Today':    { color:'#fbbf24', bg:'rgba(251,191,36,0.1)',  border:'rgba(251,191,36,0.3)'  },
  'Scheduled':    { color:'#60a5fa', bg:'rgba(96,165,250,0.1)',  border:'rgba(96,165,250,0.3)'  },
  'Delivered':    { color:'#4ade80', bg:'rgba(74,222,128,0.1)',  border:'rgba(74,222,128,0.3)'  },
  'Overdue':      { color:'#f87171', bg:'rgba(248,113,113,0.1)', border:'rgba(248,113,113,0.3)' },
}

/* ─── small reusable pieces ──────────────────────────────────────── */
function CircuitAccent({ color }) {
  return (
    <div className="absolute top-0 left-0 right-0 h-0.5"
      style={{ background:`linear-gradient(90deg,transparent,${color},transparent)` }}/>
  )
}
function LogoBadge({ logo, color, size = 'md' }) {
  const sz = size === 'lg' ? 'w-14 h-14 text-base' : 'w-9 h-9 text-xs'
  return (
    <div className={`${sz} rounded-xl flex items-center justify-center font-black text-white flex-shrink-0`}
      style={{ background:`${color}30`, border:`1px solid ${color}60` }}>
      {logo}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   DETAIL MODAL
═══════════════════════════════════════════════ */
function OrderDetailModal({ order, onClose }) {
  if (!order) return null
  const pCfg = PRIORITY_CFG[order.priority]
  const sCfg = STATUS_CFG[order.status] || STATUS_CFG['Queued']
  const dCfg = DELIVERY_CFG[order.deliveryStatus] || DELIVERY_CFG['Scheduled']
  const mfgCost  = Math.round(order.costPerWafer * order.totalWafers)
  const profit   = order.revenue - mfgCost
  const margin   = order.revenue > 0 ? Math.round((profit/order.revenue)*100) : 0
  const remaining = order.totalQty - order.completedQty
  const stageIdx  = STAGES.indexOf(order.status)
  const daysLeft  = daysDiff(new Date().toISOString().slice(0,10), order.dueDate)
  const isOverdue = daysLeft < 0 && order.progress < 100

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 overflow-y-auto"
      style={{ background:'rgba(0,0,0,0.8)', backdropFilter:'blur(8px)' }}
      onClick={onClose}>
      <div className="relative w-full max-w-3xl my-4 rounded-2xl glass"
        style={{ border:'1px solid rgba(59,130,246,0.3)' }}
        onClick={e => e.stopPropagation()}>
        <CircuitAccent color="#8b5cf6"/>
        <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none rounded-tr-2xl overflow-hidden"
          style={{ background:`radial-gradient(circle at 100% 0%,${order.logoColor}08,transparent 60%)` }}/>

        {/* ── Modal Header ── */}
        <div className="flex items-start justify-between p-5 sm:p-6 pb-4"
          style={{ borderBottom:'1px solid rgba(59,130,246,0.12)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <LogoBadge logo={order.logo} color={order.logoColor} size="lg"/>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">{order.customer}</h2>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">{order.product} · {order.id}</p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className={`fab-badge ${pCfg.cls}`}>{order.priority}</span>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold"
                  style={{ background:sCfg.color+'15', border:`1px solid ${sCfg.color}30`, color:sCfg.color }}>
                  {sCfg.live && <span className={`w-1.5 h-1.5 rounded-full live-dot ${sCfg.dot}`}/>}
                  {order.status}
                </div>
                <div className="px-2 py-0.5 rounded-full text-[9px] font-semibold"
                  style={{ background:dCfg.bg, border:`1px solid ${dCfg.border}`, color:dCfg.color }}>
                  {order.deliveryStatus}
                </div>
                {isOverdue && <span className="fab-badge badge-red">OVERDUE</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0 text-xl font-light ml-2">
            ×
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* ── KPI Strip ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { l:'Total Qty',   v:order.totalQty.toLocaleString('en-IN'),     u:order.unit,  c:'#60a5fa' },
              { l:'Completed',   v:order.completedQty.toLocaleString('en-IN'), u:order.unit,  c:'#4ade80' },
              { l:'Remaining',   v:remaining.toLocaleString('en-IN'),          u:order.unit,  c:'#f87171' },
              { l:'Revenue',     v:fmtINR(order.revenue),                      u:'',          c:'#fbbf24' },
            ].map(s => (
              <div key={s.l} className="rounded-xl p-3 text-center"
                style={{ background:`${s.c}08`, border:`1px solid ${s.c}20` }}>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest">{s.l}</p>
                <p className="text-sm font-black mt-1" style={{ color:s.c }}>{s.v}</p>
                {s.u && <p className="text-[9px] text-slate-600 mt-0.5">{s.u}</p>}
              </div>
            ))}
          </div>

          {/* ── Progress + Stage Pipeline ── */}
          <div className="rounded-xl p-4" style={{ background:'rgba(15,23,42,0.6)', border:'1px solid rgba(59,130,246,0.1)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Production Progress</span>
              <span className="text-xl font-black" style={{ color: order.progress===100?'#4ade80':'#22d3ee' }}>
                {order.progress}%
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden mb-4" style={{ background:'rgba(15,23,42,0.8)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width:`${order.progress}%`,
                  background: order.progress===100 ? 'linear-gradient(90deg,#10b981,#4ade80)' :
                               order.progress>=70  ? 'linear-gradient(90deg,#1d4ed8,#06b6d4)' :
                                                     'linear-gradient(90deg,#7c3aed,#a78bfa)',
                  boxShadow: order.progress===100 ? '0 0 10px rgba(74,222,128,0.5)' : '0 0 10px rgba(6,182,212,0.5)',
                }}/>
            </div>
            {/* Stage pills */}
            <div className="flex flex-wrap gap-1.5">
              {STAGES.map((stage, i) => {
                const isDone    = i < stageIdx
                const isCurrent = i === stageIdx
                const c = isDone ? '#4ade80' : isCurrent ? '#06b6d4' : '#334155'
                return (
                  <div key={stage} className="flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-semibold"
                    style={{ background:`${c}15`, border:`1px solid ${c}30`, color:c }}>
                    {isDone && <CheckCircle size={8}/>}
                    {isCurrent && <span className="w-1.5 h-1.5 rounded-full live-dot" style={{ background:c }}/>}
                    {stage}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Details + Financials grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Order details */}
            <div className="rounded-xl p-4" style={{ background:'rgba(15,23,42,0.6)', border:'1px solid rgba(59,130,246,0.1)' }}>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Package size={10}/>Order Details
              </p>
              {[
                ['Wafer Type',   order.waferType],
                ['Technology',   order.technology],
                ['Application',  order.application],
                ['Total Wafers', `${order.totalWafers.toLocaleString('en-IN')} wafers`],
                ['Completed W.', `${order.completedWafers.toLocaleString('en-IN')} wafers`],
                ['Start Date',   fmtDate(order.startDate)],
                ['Due Date',     fmtDate(order.dueDate)],
                ['Est. Compl.',  fmtDate(order.estCompletionDate)],
                ['Days Left',    daysLeft >= 0 ? `${daysLeft} days` : `${Math.abs(daysLeft)}d overdue`],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between items-start gap-2 py-1.5"
                  style={{ borderBottom:'1px solid rgba(59,130,246,0.06)' }}>
                  <span className="text-[10px] text-slate-500 flex-shrink-0">{k}</span>
                  <span className="text-[10px] font-semibold text-slate-200 text-right">{v}</span>
                </div>
              ))}
            </div>

            {/* Financial details */}
            <div className="space-y-3">
              <div className="rounded-xl p-4" style={{ background:'rgba(15,23,42,0.6)', border:'1px solid rgba(59,130,246,0.1)' }}>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <IndianRupee size={10}/>Financials
                </p>
                {[
                  ['Total Revenue',  fmtINR(order.revenue),  '#4ade80'],
                  ['Mfg Cost',       fmtINR(mfgCost),        '#f87171'],
                  ['Gross Profit',   fmtINR(profit),         '#fbbf24'],
                  ['Profit Margin',  `${margin}%`,           '#22d3ee'],
                  ['Cost / Wafer',   `₹${order.costPerWafer.toLocaleString('en-IN')}`, '#a78bfa'],
                  ['Rev / Wafer',    fmtINR(Math.round(order.revenue/Math.max(order.totalWafers,1))), '#60a5fa'],
                ].map(([k,v,c]) => (
                  <div key={k} className="flex justify-between items-start gap-2 py-1.5"
                    style={{ borderBottom:'1px solid rgba(59,130,246,0.06)' }}>
                    <span className="text-[10px] text-slate-500">{k}</span>
                    <span className="text-[10px] font-bold text-right" style={{ color:c }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Contact */}
              <div className="rounded-xl p-4" style={{ background:'rgba(15,23,42,0.6)', border:'1px solid rgba(59,130,246,0.1)' }}>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Users size={10}/>Customer Contact
                </p>
                <div className="flex items-center gap-2 mb-1.5">
                  <Globe size={10} className="text-slate-500"/>
                  <span className="text-[10px] text-slate-400">{order.country}</span>
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Building2 size={10} className="text-slate-500"/>
                  <span className="text-[10px] text-slate-300 font-medium">{order.contactName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={10} className="text-slate-500"/>
                  <span className="text-[10px] text-blue-400 break-all">{order.contactEmail}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Progress History ── */}
          {order.progressHistory && order.progressHistory.length > 1 && (
            <div className="rounded-xl p-4" style={{ background:'rgba(15,23,42,0.6)', border:'1px solid rgba(59,130,246,0.1)' }}>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Activity size={10}/>Production Timeline
              </p>
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-3 top-0 bottom-0 w-px" style={{ background:'rgba(59,130,246,0.15)' }}/>
                <div className="space-y-3">
                  {order.progressHistory.map((h, i) => {
                    const isLast = i === order.progressHistory.length - 1
                    return (
                      <div key={i} className="flex items-start gap-4 relative">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                          style={{ background: isLast ? 'rgba(6,182,212,0.2)' : 'rgba(59,130,246,0.15)',
                                   border: `1px solid ${isLast ? '#06b6d4' : 'rgba(59,130,246,0.3)'}` }}>
                          {isLast
                            ? <span className="w-2 h-2 rounded-full live-dot" style={{ background:'#06b6d4' }}/>
                            : <CheckCircle size={10} className="text-blue-400"/>
                          }
                        </div>
                        <div className="flex-1 pb-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold text-slate-200">{h.stage}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-slate-500">{fmtDate(h.date)}</span>
                              <span className="text-[10px] font-black" style={{ color: h.pct===100?'#4ade80':'#22d3ee' }}>
                                {h.pct}%
                              </span>
                            </div>
                          </div>
                          <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background:'rgba(15,23,42,0.8)' }}>
                            <div className="h-full rounded-full"
                              style={{ width:`${h.pct}%`, background: h.pct===100?'#4ade80':'#06b6d4', opacity:0.7 }}/>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Machines assigned ── */}
          {order.machines && order.machines.length > 0 && (
            <div className="rounded-xl p-4" style={{ background:'rgba(15,23,42,0.6)', border:'1px solid rgba(59,130,246,0.1)' }}>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Zap size={10}/>Assigned Machines
              </p>
              <div className="flex flex-wrap gap-2">
                {order.machines.map((m,i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px]"
                    style={{ background:'rgba(37,99,235,0.12)', border:'1px solid rgba(59,130,246,0.2)' }}>
                    <Zap size={9} className="text-cyan-400"/>
                    <span className="text-slate-300">{m}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Notes ── */}
          {order.notes && (
            <div className="rounded-xl p-3" style={{ background:'rgba(37,99,235,0.08)', border:'1px solid rgba(59,130,246,0.15)' }}>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Notes</p>
              <p className="text-[11px] text-slate-300 leading-relaxed">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   ORDER CARD (mobile)
═══════════════════════════════════════════════ */
function OrderCard({ order, onClick }) {
  const pCfg = PRIORITY_CFG[order.priority]
  const sCfg = STATUS_CFG[order.status] || STATUS_CFG['Queued']
  const dCfg = DELIVERY_CFG[order.deliveryStatus] || DELIVERY_CFG['Scheduled']
  const isOverdue = new Date(order.dueDate) < new Date() && order.progress < 100
  const remaining = order.totalQty - order.completedQty

  return (
    <div onClick={onClick}
      className="glass rounded-2xl p-4 relative overflow-hidden cursor-pointer group transition-all duration-200 hover:brightness-110 active:scale-[0.99]"
      style={{ border:`1px solid ${order.logoColor}18` }}>
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background:pCfg.color }}/>
      <CircuitAccent color={order.logoColor}/>

      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3 pl-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <LogoBadge logo={order.logo} color={order.logoColor}/>
          <div className="min-w-0">
            <p className="text-xs font-black text-white group-hover:text-cyan-300 transition-colors truncate">
              {order.customer}
            </p>
            <p className="text-[10px] text-slate-400 truncate">{order.product}</p>
            <p className="text-[9px] text-slate-600">{order.id}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className={`fab-badge ${pCfg.cls}`}>{order.priority}</span>
          {isOverdue && <span className="fab-badge badge-red">OVERDUE</span>}
        </div>
      </div>

      {/* Status + delivery */}
      <div className="flex flex-wrap gap-1.5 mb-3 pl-2">
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold"
          style={{ background:sCfg.color+'15', border:`1px solid ${sCfg.color}30`, color:sCfg.color }}>
          {sCfg.live && <span className={`w-1.5 h-1.5 rounded-full live-dot ${sCfg.dot}`}/>}
          {order.status}
        </div>
        <div className="px-2 py-0.5 rounded-full text-[9px] font-semibold"
          style={{ background:dCfg.bg, border:`1px solid ${dCfg.border}`, color:dCfg.color }}>
          {order.deliveryStatus}
        </div>
      </div>

      {/* Progress bar */}
      <div className="pl-2 mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[9px] text-slate-500">Progress</span>
          <span className="text-[10px] font-black" style={{ color: order.progress===100?'#4ade80':'#22d3ee' }}>
            {order.progress}%
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background:'rgba(15,23,42,0.8)' }}>
          <div className="h-full rounded-full"
            style={{
              width:`${order.progress}%`,
              background: order.progress===100 ? 'linear-gradient(90deg,#10b981,#4ade80)' :
                           order.progress>=70  ? 'linear-gradient(90deg,#1d4ed8,#06b6d4)' :
                                                 'linear-gradient(90deg,#7c3aed,#a78bfa)',
              boxShadow:'0 0 6px rgba(6,182,212,0.4)',
            }}/>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 pl-2 mb-3">
        {[
          { l:'Total',     v:order.totalQty.toLocaleString('en-IN'),     c:'#60a5fa' },
          { l:'Done',      v:order.completedQty.toLocaleString('en-IN'), c:'#4ade80' },
          { l:'Remaining', v:remaining.toLocaleString('en-IN'),          c:'#f87171' },
        ].map(s => (
          <div key={s.l} className="rounded-lg p-2 text-center"
            style={{ background:`${s.c}08`, border:`1px solid ${s.c}15` }}>
            <p className="text-[8px] text-slate-600 uppercase">{s.l}</p>
            <p className="text-[10px] font-black mt-0.5" style={{ color:s.c }}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pl-2 pt-2.5"
        style={{ borderTop:'1px solid rgba(59,130,246,0.07)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <CalendarClock size={9} className="text-slate-500"/>
            <span className="text-[9px] text-slate-500">Due: <span className="text-slate-300">{fmtDate(order.dueDate)}</span></span>
          </div>
          <div>
            <span className="text-[9px] text-green-300 font-bold">{fmtINR(order.revenue)}</span>
          </div>
        </div>
        <ChevronRight size={12} className="text-slate-600 group-hover:text-cyan-400 transition-colors"/>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   TABLE ROW (desktop)
═══════════════════════════════════════════════ */
function OrderTableRow({ order, onClick }) {
  const pCfg = PRIORITY_CFG[order.priority]
  const sCfg = STATUS_CFG[order.status] || STATUS_CFG['Queued']
  const dCfg = DELIVERY_CFG[order.deliveryStatus] || DELIVERY_CFG['Scheduled']
  const isOverdue = new Date(order.dueDate) < new Date() && order.progress < 100
  const remaining = order.totalQty - order.completedQty

  return (
    <tr onClick={onClick}
      className="cursor-pointer group transition-all duration-150"
      style={{ borderBottom:'1px solid rgba(59,130,246,0.06)' }}>
      {/* Company */}
      <td className="py-3 pl-5 pr-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
            style={{ background:`${order.logoColor}30`, border:`1px solid ${order.logoColor}50` }}>
            {order.logo}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-white truncate group-hover:text-cyan-300 transition-colors leading-tight">
              {order.customer}
            </p>
            <p className="text-[9px] text-slate-500 truncate">{order.country}</p>
          </div>
        </div>
      </td>

      {/* Order ID */}
      <td className="py-3 px-3">
        <p className="text-[10px] font-mono text-slate-400">{order.id}</p>
      </td>

      {/* Product / wafer */}
      <td className="py-3 px-3">
        <p className="text-[10px] font-semibold text-slate-200 leading-tight">{order.product}</p>
        <p className="text-[9px] text-slate-500 mt-0.5 truncate max-w-[140px]">{order.technology}</p>
      </td>

      {/* Qty */}
      <td className="py-3 px-3 text-center">
        <p className="text-[10px] font-bold text-slate-200">{order.totalQty.toLocaleString('en-IN')}</p>
        <p className="text-[9px] text-slate-600">{order.unit}</p>
      </td>

      {/* Completed */}
      <td className="py-3 px-3 text-center">
        <p className="text-[10px] font-bold text-green-300">{order.completedQty.toLocaleString('en-IN')}</p>
      </td>

      {/* Remaining */}
      <td className="py-3 px-3 text-center">
        <p className="text-[10px] font-bold text-red-300">{remaining.toLocaleString('en-IN')}</p>
      </td>

      {/* Progress */}
      <td className="py-3 px-3">
        <div className="flex items-center gap-2 min-w-[80px]">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(15,23,42,0.8)' }}>
            <div className="h-full rounded-full"
              style={{
                width:`${order.progress}%`,
                background: order.progress===100?'linear-gradient(90deg,#10b981,#4ade80)':
                             order.progress>=70?'linear-gradient(90deg,#1d4ed8,#06b6d4)':
                                               'linear-gradient(90deg,#7c3aed,#a78bfa)',
              }}/>
          </div>
          <span className="text-[9px] font-black w-6 text-right"
            style={{ color: order.progress===100?'#4ade80':'#22d3ee' }}>
            {order.progress}%
          </span>
        </div>
      </td>

      {/* Start / Due / Est Completion */}
      <td className="py-3 px-3">
        <div className="space-y-0.5">
          <p className="text-[9px] text-slate-500">Start: <span className="text-slate-300">{fmtDate(order.startDate)}</span></p>
          <p className="text-[9px] text-slate-500">Due: <span className={isOverdue?'text-red-300 font-bold':'text-slate-300'}>{fmtDate(order.dueDate)}</span></p>
          <p className="text-[9px] text-slate-500">ETA: <span className="text-amber-300">{fmtDate(order.estCompletionDate)}</span></p>
        </div>
      </td>

      {/* Priority */}
      <td className="py-3 px-3">
        <span className={`fab-badge ${pCfg.cls}`}>{order.priority}</span>
      </td>

      {/* Revenue */}
      <td className="py-3 px-3">
        <p className="text-[10px] font-bold text-green-300">{fmtINR(order.revenue)}</p>
      </td>

      {/* Stage */}
      <td className="py-3 px-3">
        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-semibold w-max"
          style={{ background:sCfg.color+'15', border:`1px solid ${sCfg.color}30`, color:sCfg.color }}>
          {sCfg.live && <span className={`w-1.5 h-1.5 rounded-full live-dot ${sCfg.dot}`}/>}
          {order.status}
        </div>
      </td>

      {/* Delivery */}
      <td className="py-3 pr-5 pl-3">
        <div className="flex items-center gap-1.5">
          <div className="px-2 py-0.5 rounded-full text-[9px] font-semibold"
            style={{ background:dCfg.bg, border:`1px solid ${dCfg.border}`, color:dCfg.color }}>
            {order.deliveryStatus}
          </div>
          {isOverdue && <span className="fab-badge badge-red text-[8px]">!</span>}
        </div>
      </td>
    </tr>
  )
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export default function CustomerOrders() {
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [search,        setSearch]        = useState('')
  const [filterStatus,  setFilterStatus]  = useState('All')
  const [filterPriority,setFilterPriority]= useState('All')
  const [filterCompany, setFilterCompany] = useState('All')
  const [sortBy,        setSortBy]        = useState('priority')
  const [viewMode,      setViewMode]      = useState('table') // 'table' | 'cards'

  /* ── derived stats ── */
  const totalOrders     = customerOrdersData.length
  const activeOrders    = customerOrdersData.filter(o => !['Queued','Completed'].includes(o.status)).length
  const completedOrders = customerOrdersData.filter(o => o.status === 'Completed').length
  const pendingOrders   = customerOrdersData.filter(o => o.status === 'Queued').length
  const totalRevenue    = customerOrdersData.reduce((s,o) => s+o.revenue, 0)
  const criticalCount   = customerOrdersData.filter(o => o.priority === 'CRITICAL').length

  /* ── filter options ── */
  const companies  = ['All', ...new Set(customerOrdersData.map(o => o.customer))]
  const statuses   = ['All', ...new Set(customerOrdersData.map(o => o.status))]
  const priorities = ['All', 'CRITICAL', 'HIGH', 'NORMAL']

  /* ── filtered + sorted ── */
  const filtered = useMemo(() => {
    return customerOrdersData
      .filter(o => filterStatus   === 'All' || o.status   === filterStatus)
      .filter(o => filterPriority === 'All' || o.priority === filterPriority)
      .filter(o => filterCompany  === 'All' || o.customer === filterCompany)
      .filter(o => {
        if (!search) return true
        const q = search.toLowerCase()
        return o.customer.toLowerCase().includes(q)
          || o.id.toLowerCase().includes(q)
          || o.product.toLowerCase().includes(q)
          || o.technology.toLowerCase().includes(q)
      })
      .sort((a, b) => {
        if (sortBy === 'priority') return PRIORITY_CFG[a.priority].rank - PRIORITY_CFG[b.priority].rank
        if (sortBy === 'progress') return b.progress - a.progress
        if (sortBy === 'revenue')  return b.revenue - a.revenue
        if (sortBy === 'due')      return new Date(a.dueDate) - new Date(b.dueDate)
        if (sortBy === 'company')  return a.customer.localeCompare(b.customer)
        return 0
      })
  }, [search, filterStatus, filterPriority, filterCompany, sortBy])

  return (
    <>
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)}/>
      )}

      <div className="space-y-5">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">
              <span className="gradient-text-cyan">Customer</span> Orders
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <Radio size={10} className="text-green-400 live-dot"/>
              All wafer fabrication orders · Click any row or card for full details
            </p>
          </div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <span className="fab-badge badge-red"><AlertCircle size={9}/>{criticalCount} CRITICAL</span>
            )}
            <span className="fab-badge badge-cyan"><Zap size={9}/>LIVE</span>
          </div>
        </div>

        {/* ── Summary KPI Strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { l:'Total Orders',     v:totalOrders,                 c:'#60a5fa', glow:'rgba(96,165,250,0.3)',   icon:ShoppingCart },
            { l:'Active Orders',    v:activeOrders,                c:'#06b6d4', glow:'rgba(6,182,212,0.3)',    icon:Activity },
            { l:'Completed',        v:completedOrders,             c:'#4ade80', glow:'rgba(74,222,128,0.3)',   icon:CheckCircle },
            { l:'Pending / Queued', v:pendingOrders,               c:'#fbbf24', glow:'rgba(251,191,36,0.3)',   icon:Timer },
            { l:'Total Revenue',    v:fmtINR(totalRevenue),        c:'#10b981', glow:'rgba(16,185,129,0.3)',   icon:IndianRupee },
          ].map((s, i) => {
            const Icon = s.icon
            return (
              <div key={s.l} className="glass rounded-2xl p-4 relative overflow-hidden stat-card-fab anim-fade-up"
                style={{ animationDelay:`${i*60}ms`, border:`1px solid ${s.c}20` }}>
                <div className="absolute top-0 left-0 right-0 h-0.5"
                  style={{ background:`linear-gradient(90deg,transparent,${s.c},transparent)` }}/>
                <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
                  style={{ background:`radial-gradient(ellipse at 50% 100%,${s.glow} 0%,transparent 70%)` }}/>
                <div className="relative z-10 flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background:`${s.c}20`, border:`1px solid ${s.c}40`, boxShadow:`0 0 12px ${s.glow}` }}>
                    <Icon size={14} style={{ color:s.c }}/>
                  </div>
                </div>
                <p className="relative z-10 text-xl font-black text-white">{s.v}</p>
                <p className="relative z-10 text-[9px] text-slate-500 mt-1 uppercase tracking-widest leading-tight">{s.l}</p>
              </div>
            )
          })}
        </div>

        {/* ── Filters + Search + Sort ── */}
        <div className="glass rounded-2xl p-4 space-y-3">
          {/* Row 1: Search + view toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-[180px] px-3 py-2 rounded-lg"
              style={{ background:'rgba(15,23,42,0.7)', border:'1px solid rgba(59,130,246,0.15)' }}>
              <Search size={12} className="text-slate-500 flex-shrink-0"/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search company, order ID, product, technology…"
                className="bg-transparent text-[10px] text-slate-300 outline-none w-full placeholder-slate-600"/>
              {search && (
                <button onClick={() => setSearch('')} className="text-slate-600 hover:text-slate-400 transition-colors">
                  <X size={11}/>
                </button>
              )}
            </div>
            {/* View mode toggle */}
            <div className="flex rounded-lg overflow-hidden" style={{ border:'1px solid rgba(59,130,246,0.15)' }}>
              {[['table','Table'],['cards','Cards']].map(([k,l]) => (
                <button key={k} onClick={() => setViewMode(k)}
                  className="px-3 py-2 text-[10px] font-bold transition-all"
                  style={{
                    background: viewMode===k ? 'rgba(37,99,235,0.25)' : 'rgba(15,23,42,0.7)',
                    color: viewMode===k ? '#93c5fd' : '#475569',
                  }}>{l}</button>
              ))}
            </div>
          </div>

          {/* Row 2: Filter pills */}
          <div className="flex flex-wrap items-start gap-3">
            {/* Status filter */}
            <div className="flex flex-wrap gap-1">
              <span className="text-[9px] text-slate-600 uppercase tracking-wider self-center mr-1">Status:</span>
              {statuses.map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className="text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider transition-all"
                  style={{
                    background: filterStatus===s ? 'rgba(37,99,235,0.25)' : 'rgba(15,23,42,0.6)',
                    border: `1px solid ${filterStatus===s ? 'rgba(59,130,246,0.5)' : 'rgba(59,130,246,0.1)'}`,
                    color: filterStatus===s ? '#93c5fd' : '#475569',
                  }}>{s}</button>
              ))}
            </div>

            {/* Priority filter */}
            <div className="flex flex-wrap gap-1">
              <span className="text-[9px] text-slate-600 uppercase tracking-wider self-center mr-1">Priority:</span>
              {priorities.map(p => {
                const cfg = p !== 'All' ? PRIORITY_CFG[p] : null
                return (
                  <button key={p} onClick={() => setFilterPriority(p)}
                    className="text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider transition-all"
                    style={{
                      background: filterPriority===p ? (cfg?`${cfg.color}20`:'rgba(37,99,235,0.25)') : 'rgba(15,23,42,0.6)',
                      border: `1px solid ${filterPriority===p ? (cfg?`${cfg.color}50`:'rgba(59,130,246,0.5)') : 'rgba(59,130,246,0.1)'}`,
                      color: filterPriority===p ? (cfg?cfg.color:'#93c5fd') : '#475569',
                    }}>{p}</button>
                )
              })}
            </div>
          </div>

          {/* Row 3: Company filter + Sort */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1">
              <span className="text-[9px] text-slate-600 uppercase tracking-wider self-center mr-1">Company:</span>
              <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-lg outline-none transition-all"
                style={{ background:'rgba(15,23,42,0.8)', border:'1px solid rgba(59,130,246,0.2)', color:'#93c5fd' }}>
                {companies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-slate-600 uppercase tracking-wider">Sort by:</span>
              {[['priority','Priority'],['progress','Progress'],['revenue','Revenue'],['due','Due Date'],['company','Company']].map(([k,l]) => (
                <button key={k} onClick={() => setSortBy(k)}
                  className="text-[9px] font-bold px-2 py-0.5 rounded transition-all"
                  style={{ color: sortBy===k?'#06b6d4':'#475569', borderBottom: sortBy===k?'1px solid #06b6d4':'1px solid transparent' }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Results count ── */}
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-slate-500">
            Showing <span className="text-slate-300 font-bold">{filtered.length}</span> of <span className="text-slate-300 font-bold">{totalOrders}</span> orders
          </p>
          {(filterStatus !== 'All' || filterPriority !== 'All' || filterCompany !== 'All' || search) && (
            <button
              onClick={() => { setFilterStatus('All'); setFilterPriority('All'); setFilterCompany('All'); setSearch('') }}
              className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
              <X size={10}/>Clear filters
            </button>
          )}
        </div>

        {/* ── Desktop Table ── */}
        {viewMode === 'table' && (
          <div className="glass rounded-2xl overflow-hidden hidden md:block anim-fade-up">
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom:'1px solid rgba(59,130,246,0.1)' }}>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShoppingCart size={14} className="text-cyan-400"/>All Orders
                </h2>
                <p className="text-[10px] text-slate-500 mt-0.5">Click any row to view full order details</p>
              </div>
              <span className="fab-badge badge-blue">{filtered.length} ORDERS</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth:'900px' }}>
                <thead>
                  <tr style={{ background:'rgba(15,23,42,0.8)', borderBottom:'1px solid rgba(59,130,246,0.12)' }}>
                    {['Company','Order ID','Product / Tech','Total Qty','Completed','Remaining','Progress %','Dates','Priority','Revenue','Stage','Delivery'].map(h => (
                      <th key={h} className="text-left text-[9px] uppercase tracking-widest text-slate-500 font-bold py-3 px-3 first:pl-5 last:pr-5 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(order => (
                    <OrderTableRow key={order.id} order={order} onClick={() => setSelectedOrder(order)}/>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <ShoppingCart size={32} className="text-slate-700 mx-auto mb-3"/>
                <p className="text-sm text-slate-500">No orders match your filters.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Cards grid (mobile-first, also desktop toggle) ── */}
        <div className={`${viewMode === 'cards' ? 'block' : 'md:hidden'}`}>
          {filtered.length === 0 ? (
            <div className="glass rounded-2xl py-16 text-center">
              <ShoppingCart size={32} className="text-slate-700 mx-auto mb-3"/>
              <p className="text-sm text-slate-500">No orders match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map(order => (
                <OrderCard key={order.id} order={order} onClick={() => setSelectedOrder(order)}/>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  )
}
