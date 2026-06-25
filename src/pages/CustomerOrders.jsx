import React, { useState, useMemo } from 'react'
import PageHero from '../components/PageHero'
import {
  ShoppingCart, Search, ChevronRight, X, CalendarClock, CheckCircle,
  AlertCircle, Building2, Globe, Mail, Package, Zap, Timer,
  IndianRupee, Users, Activity, TrendingUp,
} from 'lucide-react'
import { customerOrdersData } from '../data/mockData'

const HERO_IMG = 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1200&q=80&fit=crop'
const BANNER_IMG = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80&fit=crop'

function fmtINR(v) {
  if (v >= 10000000) return `₹${(v/10000000).toFixed(2)}Cr`
  if (v >= 100000)   return `₹${(v/100000).toFixed(1)}L`
  return `₹${v.toLocaleString('en-IN')}`
}
function fmtDate(s) {
  return new Date(s).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})
}
function daysDiff(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000)
}

const PRIORITY_CFG = {
  CRITICAL: { badge:'badge badge-red',   color:'#dc2626', rank:0 },
  HIGH:     { badge:'badge badge-amber', color:'#d97706', rank:1 },
  NORMAL:   { badge:'badge badge-blue',  color:'#2563eb', rank:2 },
}
const STATUS_CFG = {
  'In Fab':      { color:'#0891b2', bg:'#ecfeff', border:'#a5f3fc', live:true  },
  'Lithography': { color:'#7c3aed', bg:'#f5f3ff', border:'#ddd6fe', live:true  },
  'Testing':     { color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0', live:true  },
  'Raw Wafer':   { color:'#64748b', bg:'#f8fafc', border:'#e2e8f0', live:false },
  'Packaging':   { color:'#d97706', bg:'#fffbeb', border:'#fde68a', live:true  },
  'Queued':      { color:'#94a3b8', bg:'#f8fafc', border:'#e2e8f0', live:false },
  'Completed':   { color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0', live:false },
}
const DELIVERY_CFG = {
  'On Track':     { color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0' },
  'Near Complete':{ color:'#0891b2', bg:'#ecfeff', border:'#a5f3fc' },
  'Due Today':    { color:'#d97706', bg:'#fffbeb', border:'#fde68a' },
  'Scheduled':    { color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe' },
  'Delivered':    { color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0' },
  'Overdue':      { color:'#dc2626', bg:'#fef2f2', border:'#fecaca' },
}
const STAGES = ['Queued','Raw Wafer','Lithography','Etching','Deposition','Metallization','Testing','Packaging','Completed']

function LogoBadge({ logo, color, lg }) {
  const sz = lg ? 'w-14 h-14 text-sm' : 'w-9 h-9 text-xs'
  return (
    <div className={`${sz} rounded-xl flex items-center justify-center font-bold flex-shrink-0`}
      style={{ background:`${color}18`, color, border:`1px solid ${color}30` }}>{logo}</div>
  )
}

/* ── Order Detail Modal ── */
function OrderDetailModal({ order, onClose }) {
  if (!order) return null
  const pCfg = PRIORITY_CFG[order.priority]
  const sCfg = STATUS_CFG[order.status] || STATUS_CFG['Queued']
  const dCfg = DELIVERY_CFG[order.deliveryStatus] || DELIVERY_CFG['Scheduled']
  const mfgCost = Math.round(order.costPerWafer * order.totalWafers)
  const profit  = order.revenue - mfgCost
  const margin  = order.revenue > 0 ? Math.round((profit/order.revenue)*100) : 0
  const remaining = order.totalQty - order.completedQty
  const stageIdx  = STAGES.indexOf(order.status)
  const daysLeft  = daysDiff(new Date().toISOString().slice(0,10), order.dueDate)
  const isOverdue = daysLeft < 0 && order.progress < 100

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 overflow-y-auto"
      style={{ background:'rgba(0,0,0,0.5)', backdropFilter:'blur(6px)' }}
      onClick={onClose}>
      <div className="relative w-full max-w-3xl my-4 rounded-2xl bg-white border border-slate-200 shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="h-1 rounded-t-2xl" style={{ background:`linear-gradient(90deg,${order.logoColor},#7c3aed,#0891b2)` }}/>
        <div className="flex items-start justify-between p-5 sm:p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <LogoBadge logo={order.logo} color={order.logoColor} lg/>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight"
                style={{ fontFamily:"'Space Grotesk',sans-serif" }}>{order.customer}</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">{order.product} · {order.id}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className={pCfg.badge}>{order.priority}</span>
                <span className="badge" style={{ background:sCfg.bg, color:sCfg.color, borderColor:sCfg.border }}>
                  {sCfg.live && <span className="w-1.5 h-1.5 rounded-full live-dot inline-block mr-1" style={{ background:sCfg.color }}/>}
                  {order.status}
                </span>
                <span className="badge" style={{ background:dCfg.bg, color:dCfg.color, borderColor:dCfg.border }}>{order.deliveryStatus}</span>
                {isOverdue && <span className="badge badge-red">Overdue</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0 text-xl ml-2">×</button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          {/* KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { l:'Total Qty',  v:order.totalQty.toLocaleString('en-IN'),     u:order.unit, c:'#2563eb', bg:'#eff6ff' },
              { l:'Completed',  v:order.completedQty.toLocaleString('en-IN'), u:order.unit, c:'#16a34a', bg:'#f0fdf4' },
              { l:'Remaining',  v:remaining.toLocaleString('en-IN'),          u:order.unit, c:'#dc2626', bg:'#fef2f2' },
              { l:'Revenue',    v:fmtINR(order.revenue),                      u:'',         c:'#d97706', bg:'#fffbeb' },
            ].map(s => (
              <div key={s.l} className="rounded-xl p-3 text-center border" style={{ background:s.bg, borderColor:`${s.c}25` }}>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider font-medium">{s.l}</p>
                <p className="text-sm font-bold mt-1" style={{ color:s.c }}>{s.v}</p>
                {s.u && <p className="text-[9px] text-slate-400 mt-0.5">{s.u}</p>}
              </div>
            ))}
          </div>

          {/* Progress + pipeline */}
          <div className="rounded-xl p-4 bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600">Production Progress</span>
              <span className="text-xl font-bold" style={{ color:order.progress===100?'#16a34a':'#2563eb' }}>{order.progress}%</span>
            </div>
            <div className="progress-track h-3 mb-4">
              <div className="progress-fill" style={{ width:`${order.progress}%`, background:order.progress===100?'#16a34a':order.progress>=70?'#2563eb':'#7c3aed' }}/>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {STAGES.map((stage,i) => {
                const isDone=i<stageIdx, isCur=i===stageIdx
                const c = isDone?'#16a34a':isCur?'#2563eb':'#94a3b8'
                return (
                  <div key={stage} className="flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-semibold border"
                    style={{ background:`${c}10`, borderColor:`${c}30`, color:c }}>
                    {isDone && <CheckCircle size={8}/>}
                    {isCur && <span className="w-1.5 h-1.5 rounded-full live-dot inline-block" style={{ background:c }}/>}
                    {stage}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Details + Financials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl p-4 border border-slate-100 bg-slate-50">
              <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5"><Package size={10}/>Order Details</p>
              {[
                ['Wafer Type',  order.waferType||'—'],
                ['Technology',  order.technology||'—'],
                ['Application', order.application||'—'],
                ['Total Wafers',`${order.totalWafers?.toLocaleString('en-IN')} wafers`],
                ['Start Date',  fmtDate(order.startDate)],
                ['Due Date',    fmtDate(order.dueDate)],
                ['Est. Compl.', fmtDate(order.estCompletionDate)],
                ['Days Left',   daysLeft>=0?`${daysLeft} days`:`${Math.abs(daysLeft)}d overdue`],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between gap-2 py-1.5 border-b border-slate-100 last:border-0">
                  <span className="text-[10px] text-slate-500">{k}</span>
                  <span className="text-[10px] font-semibold text-slate-800 text-right">{v}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="rounded-xl p-4 border border-slate-100 bg-slate-50">
                <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5"><IndianRupee size={10}/>Financials</p>
                {[
                  ['Total Revenue', fmtINR(order.revenue),  '#16a34a'],
                  ['Mfg Cost',      fmtINR(mfgCost),        '#dc2626'],
                  ['Gross Profit',  fmtINR(profit),         '#d97706'],
                  ['Profit Margin', `${margin}%`,           '#2563eb'],
                  ['Cost/Wafer',    `₹${order.costPerWafer?.toLocaleString('en-IN')}`, '#7c3aed'],
                ].map(([k,v,c]) => (
                  <div key={k} className="flex justify-between gap-2 py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-[10px] text-slate-500">{k}</span>
                    <span className="text-[10px] font-bold text-right" style={{ color:c }}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl p-4 border border-slate-100 bg-slate-50">
                <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5"><Users size={10}/>Customer Contact</p>
                {[[Globe,order.country],[Building2,order.contactName],[Mail,order.contactEmail]].map(([Icon,val],i)=>(
                  <div key={i} className="flex items-center gap-2 py-1.5 border-b border-slate-100 last:border-0">
                    <Icon size={10} className="text-slate-400 flex-shrink-0"/>
                    <span className="text-[10px] text-slate-700 break-all">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline */}
          {order.progressHistory?.length > 1 && (
            <div className="rounded-xl p-4 border border-slate-100 bg-slate-50">
              <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold mb-4 flex items-center gap-1.5"><Activity size={10}/>Production Timeline</p>
              <div className="relative pl-6 space-y-3">
                <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200"/>
                {order.progressHistory.map((h,i) => {
                  const isLast = i===order.progressHistory.length-1
                  return (
                    <div key={i} className="flex items-start gap-3 relative">
                      <div className="absolute -left-3 w-5 h-5 rounded-full flex items-center justify-center bg-white border-2 z-10"
                        style={{ borderColor:isLast?'#2563eb':'#e2e8f0' }}>
                        {isLast ? <span className="w-2 h-2 rounded-full bg-blue-600 live-dot inline-block"/> : <CheckCircle size={10} className="text-slate-400"/>}
                      </div>
                      <div className="flex-1 ml-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-slate-700">{h.stage}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-slate-400">{fmtDate(h.date)}</span>
                            <span className="text-[10px] font-bold" style={{ color:h.pct===100?'#16a34a':'#2563eb' }}>{h.pct}%</span>
                          </div>
                        </div>
                        <div className="progress-track h-1 mt-1">
                          <div className="progress-fill" style={{ width:`${h.pct}%`, background:h.pct===100?'#16a34a':'#2563eb', opacity:0.6 }}/>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Machines */}
          {order.machines?.length > 0 && (
            <div className="rounded-xl p-4 border border-slate-100 bg-slate-50">
              <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5"><Zap size={10}/>Assigned Machines</p>
              <div className="flex flex-wrap gap-2">
                {order.machines.map((m,i) => (
                  <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] bg-blue-50 border border-blue-100 text-blue-700 font-medium">
                    <Zap size={9}/>{m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {order.notes && (
            <div className="rounded-xl p-3 bg-amber-50 border border-amber-100">
              <p className="text-[9px] text-amber-600 uppercase tracking-wider font-semibold mb-1">Notes</p>
              <p className="text-[11px] text-slate-700 leading-relaxed">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Order Card (mobile/cards view) ── */
function OrderCard({ order, onClick }) {
  const pCfg = PRIORITY_CFG[order.priority]
  const sCfg = STATUS_CFG[order.status]   || STATUS_CFG['Queued']
  const dCfg = DELIVERY_CFG[order.deliveryStatus] || DELIVERY_CFG['Scheduled']
  const isOverdue = new Date(order.dueDate) < new Date() && order.progress < 100
  const remaining = order.totalQty - order.completedQty
  return (
    <div onClick={onClick} className="card card-lift cursor-pointer group relative overflow-hidden"
      style={{ borderTop:`3px solid ${order.logoColor}` }}>
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <LogoBadge logo={order.logo} color={order.logoColor}/>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{order.customer}</p>
              <p className="text-[10px] text-slate-500 truncate">{order.product}</p>
              <p className="text-[9px] text-slate-400 font-mono">{order.id}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className={pCfg.badge}>{order.priority}</span>
            {isOverdue && <span className="badge badge-red">Overdue</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="badge" style={{ background:sCfg.bg, color:sCfg.color, borderColor:sCfg.border }}>
            {sCfg.live && <span className="w-1.5 h-1.5 rounded-full live-dot inline-block mr-1" style={{ background:sCfg.color }}/>}
            {order.status}
          </span>
          <span className="badge" style={{ background:dCfg.bg, color:dCfg.color, borderColor:dCfg.border }}>{order.deliveryStatus}</span>
        </div>
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[9px] text-slate-500 font-medium">Progress</span>
            <span className="text-[10px] font-bold" style={{ color:order.progress===100?'#16a34a':'#2563eb' }}>{order.progress}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width:`${order.progress}%`, background:order.progress===100?'#16a34a':order.progress>=70?'#2563eb':'#7c3aed' }}/>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { l:'Total',v:order.totalQty.toLocaleString('en-IN'),     c:'#2563eb',bg:'#eff6ff' },
            { l:'Done', v:order.completedQty.toLocaleString('en-IN'), c:'#16a34a',bg:'#f0fdf4' },
            { l:'Left', v:remaining.toLocaleString('en-IN'),          c:'#dc2626',bg:'#fef2f2' },
          ].map(s => (
            <div key={s.l} className="text-center rounded-lg p-1.5 border" style={{ background:s.bg, borderColor:`${s.c}20` }}>
              <p className="text-[8px] text-slate-500 uppercase tracking-wider">{s.l}</p>
              <p className="text-[10px] font-bold" style={{ color:s.c }}>{s.v}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <span className="text-[9px] text-slate-500 flex items-center gap-1">
            <CalendarClock size={9} className="text-slate-400"/>Due: <span className="text-slate-700 font-medium">{fmtDate(order.dueDate)}</span>
          </span>
          <span className="text-[10px] font-bold text-green-700">{fmtINR(order.revenue)}</span>
        </div>
        <ChevronRight size={13} className="text-slate-400 group-hover:text-blue-500 transition-colors"/>
      </div>
    </div>
  )
}

/* ── Table Row (desktop) ── */
function OrderRow({ order, onClick }) {
  const pCfg = PRIORITY_CFG[order.priority]
  const sCfg = STATUS_CFG[order.status]   || STATUS_CFG['Queued']
  const dCfg = DELIVERY_CFG[order.deliveryStatus] || DELIVERY_CFG['Scheduled']
  const isOverdue = new Date(order.dueDate) < new Date() && order.progress < 100
  const remaining = order.totalQty - order.completedQty
  return (
    <tr onClick={onClick} className="cursor-pointer group border-b border-slate-50 last:border-0">
      <td className="py-3 pl-5 pr-3">
        <div className="flex items-center gap-2.5">
          <LogoBadge logo={order.logo} color={order.logoColor}/>
          <div>
            <p className="text-[11px] font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{order.customer}</p>
            <p className="text-[9px] text-slate-400">{order.country}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-3"><span className="text-[10px] font-mono text-slate-500">{order.id}</span></td>
      <td className="py-3 px-3">
        <p className="text-[10px] font-medium text-slate-700">{order.product}</p>
        <p className="text-[9px] text-slate-400 mt-0.5">{order.technology}</p>
      </td>
      <td className="py-3 px-3 text-center"><p className="text-[10px] font-semibold text-slate-700">{order.totalQty.toLocaleString('en-IN')}</p><p className="text-[9px] text-slate-400">{order.unit}</p></td>
      <td className="py-3 px-3 text-center"><p className="text-[10px] font-semibold text-green-700">{order.completedQty.toLocaleString('en-IN')}</p></td>
      <td className="py-3 px-3 text-center"><p className="text-[10px] font-semibold text-red-600">{remaining.toLocaleString('en-IN')}</p></td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-2 min-w-[80px]">
          <div className="progress-track flex-1">
            <div className="progress-fill" style={{ width:`${order.progress}%`, background:order.progress===100?'#16a34a':order.progress>=70?'#2563eb':'#7c3aed' }}/>
          </div>
          <span className="text-[9px] font-bold w-7 text-right" style={{ color:order.progress===100?'#16a34a':'#2563eb' }}>{order.progress}%</span>
        </div>
      </td>
      <td className="py-3 px-3">
        <p className="text-[9px] text-slate-500">Start: <span className="text-slate-700">{fmtDate(order.startDate)}</span></p>
        <p className="text-[9px] text-slate-500">Due: <span className={isOverdue?'text-red-600 font-semibold':'text-slate-700'}>{fmtDate(order.dueDate)}</span></p>
        <p className="text-[9px] text-slate-500">ETA: <span className="text-amber-700">{fmtDate(order.estCompletionDate)}</span></p>
      </td>
      <td className="py-3 px-3"><span className={pCfg.badge}>{order.priority}</span></td>
      <td className="py-3 px-3"><span className="text-[10px] font-bold text-green-700">{fmtINR(order.revenue)}</span></td>
      <td className="py-3 px-3">
        <span className="badge" style={{ background:sCfg.bg, color:sCfg.color, borderColor:sCfg.border }}>
          {sCfg.live && <span className="w-1.5 h-1.5 rounded-full live-dot inline-block mr-1" style={{ background:sCfg.color }}/>}
          {order.status}
        </span>
      </td>
      <td className="py-3 pr-5 pl-3">
        <span className="badge" style={{ background:dCfg.bg, color:dCfg.color, borderColor:dCfg.border }}>{order.deliveryStatus}</span>
      </td>
    </tr>
  )
}

/* ══════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════ */
export default function CustomerOrders() {
  const [selected,       setSelected]       = useState(null)
  const [search,         setSearch]         = useState('')
  const [filterStatus,   setFilterStatus]   = useState('All')
  const [filterPriority, setFilterPriority] = useState('All')
  const [filterCompany,  setFilterCompany]  = useState('All')
  const [sortBy,         setSortBy]         = useState('priority')
  const [viewMode,       setViewMode]       = useState('table')

  const data = customerOrdersData || []
  const total     = data.length
  const active    = data.filter(o => !['Queued','Completed'].includes(o.status)).length
  const completed = data.filter(o => o.status === 'Completed').length
  const pending   = data.filter(o => o.status === 'Queued').length
  const totalRev  = data.reduce((s,o) => s+(o.revenue||0), 0)
  const critical  = data.filter(o => o.priority === 'CRITICAL').length

  const companies = ['All', ...new Set(data.map(o => o.customer))]
  const statuses  = ['All', ...new Set(data.map(o => o.status))]

  const filtered = useMemo(() => {
    return data
      .filter(o => filterStatus   === 'All' || o.status   === filterStatus)
      .filter(o => filterPriority === 'All' || o.priority === filterPriority)
      .filter(o => filterCompany  === 'All' || o.customer === filterCompany)
      .filter(o => {
        if (!search) return true
        const q = search.toLowerCase()
        return o.customer.toLowerCase().includes(q) || o.id.toLowerCase().includes(q)
          || o.product.toLowerCase().includes(q) || (o.technology||'').toLowerCase().includes(q)
      })
      .sort((a,b) => {
        if (sortBy==='priority') return PRIORITY_CFG[a.priority].rank - PRIORITY_CFG[b.priority].rank
        if (sortBy==='progress') return b.progress - a.progress
        if (sortBy==='revenue')  return (b.revenue||0) - (a.revenue||0)
        if (sortBy==='due')      return new Date(a.dueDate) - new Date(b.dueDate)
        if (sortBy==='company')  return a.customer.localeCompare(b.customer)
        return 0
      })
  }, [search, filterStatus, filterPriority, filterCompany, sortBy, data])

  const kpis = [
    { l:'Total Orders',   v:total,          c:'#2563eb', bg:'#eff6ff', icon:ShoppingCart },
    { l:'Active Orders',  v:active,         c:'#0891b2', bg:'#ecfeff', icon:Activity },
    { l:'Completed',      v:completed,      c:'#16a34a', bg:'#f0fdf4', icon:CheckCircle },
    { l:'Queued/Pending', v:pending,        c:'#d97706', bg:'#fffbeb', icon:Timer },
    { l:'Total Revenue',  v:fmtINR(totalRev),c:'#7c3aed',bg:'#f5f3ff', icon:IndianRupee },
  ]

  const activeFilter = filterStatus!=='All'||filterPriority!=='All'||filterCompany!=='All'||!!search

  return (
    <>
      {selected && <OrderDetailModal order={selected} onClose={() => setSelected(null)}/>}
      <div>

        {/* ① HERO */}
        <PageHero src={HERO_IMG} badge="Order Management · Live" title="Customer Orders" accent="8 Active Clients"
          sub="All wafer fabrication orders — click any row or card to view full production details, financials, and timeline." />

        {/* ② KPI STRIP — indigo/blue tint */}
        <div style={{ background:'linear-gradient(135deg,#eef2ff,#e0e7ff)', padding:'24px 0 20px' }}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 px-2">
            {kpis.map((s,i) => {
              const Icon = s.icon
              return (
                <div key={s.l} className="stat-card card-lift anim-fade-up" style={{ animationDelay:`${i*60}ms`, borderTop:`3px solid ${s.c}` }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="icon-box rounded-xl" style={{ background:s.bg, color:s.c, width:38, height:38 }}><Icon size={16}/></div>
                    {critical > 0 && s.l==='Total Orders' && (
                      <span className="badge badge-red flex items-center gap-1"><AlertCircle size={9}/>{critical} Critical</span>
                    )}
                  </div>
                  <p className="text-xl font-bold text-slate-900">{s.v}</p>
                  <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-wider font-medium leading-tight">{s.l}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* ③ FILTER BAR — white */}
        <div style={{ background:'#fff', padding:'20px 0 16px' }}>
          <div className="card p-4 mx-2 space-y-3">
            {/* Search + view toggle */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-[200px] input-field py-2">
                <Search size={13} className="text-slate-400 flex-shrink-0"/>
                <input value={search} onChange={e=>setSearch(e.target.value)}
                  placeholder="Search company, order ID, product, technology…"
                  className="bg-transparent text-[11px] text-slate-700 outline-none w-full placeholder-slate-400"/>
                {search && <button onClick={()=>setSearch('')} className="text-slate-400 hover:text-slate-600"><X size={12}/></button>}
              </div>
              <div className="flex rounded-lg overflow-hidden border border-slate-200">
                {[['table','Table'],['cards','Cards']].map(([k,l]) => (
                  <button key={k} onClick={()=>setViewMode(k)}
                    className="px-3 py-2 text-[11px] font-semibold transition-all"
                    style={{ background:viewMode===k?'#eff6ff':'#fff', color:viewMode===k?'#2563eb':'#64748b' }}>{l}</button>
                ))}
              </div>
            </div>
            {/* Filters row */}
            <div className="flex flex-wrap items-start gap-3">
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold mr-1">Status:</span>
                {statuses.map(s => (
                  <button key={s} onClick={()=>setFilterStatus(s)}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all"
                    style={{ background:filterStatus===s?'#eff6ff':'#f8fafc', borderColor:filterStatus===s?'#bfdbfe':'#e2e8f0', color:filterStatus===s?'#2563eb':'#64748b' }}>{s}</button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold mr-1">Priority:</span>
                {['All','CRITICAL','HIGH','NORMAL'].map(p => {
                  const c = p==='CRITICAL'?'#dc2626':p==='HIGH'?'#d97706':p==='NORMAL'?'#2563eb':'#64748b'
                  const bg= p==='CRITICAL'?'#fef2f2':p==='HIGH'?'#fffbeb':p==='NORMAL'?'#eff6ff':'#f8fafc'
                  return (
                    <button key={p} onClick={()=>setFilterPriority(p)}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all"
                      style={{ background:filterPriority===p?bg:'#f8fafc', borderColor:filterPriority===p?`${c}40`:'#e2e8f0', color:filterPriority===p?c:'#64748b' }}>{p}</button>
                  )
                })}
              </div>
            </div>
            {/* Company + sort */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Company:</span>
                <select value={filterCompany} onChange={e=>setFilterCompany(e.target.value)} className="input-field py-1.5 text-[11px] w-auto">
                  {companies.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold mr-1">Sort:</span>
                {[['priority','Priority'],['progress','Progress'],['revenue','Revenue'],['due','Due'],['company','Company']].map(([k,l])=>(
                  <button key={k} onClick={()=>setSortBy(k)}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded transition-all"
                    style={{ color:sortBy===k?'#2563eb':'#94a3b8', borderBottom:sortBy===k?'2px solid #2563eb':'2px solid transparent' }}>{l}</button>
                ))}
              </div>
            </div>
          </div>
          {/* Results bar */}
          <div className="flex items-center justify-between px-2 mt-3">
            <p className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of <span className="font-semibold text-slate-700">{total}</span> orders
            </p>
            {activeFilter && (
              <button onClick={()=>{setFilterStatus('All');setFilterPriority('All');setFilterCompany('All');setSearch('')}}
                className="btn-ghost text-[11px] py-1 px-2.5 flex items-center gap-1 text-red-500 border-red-100 hover:bg-red-50">
                <X size={11}/>Clear filters
              </button>
            )}
          </div>
        </div>

        {/* ④ IMAGE BANNER */}
        <div style={{ position:'relative', overflow:'hidden', minHeight:200, display:'flex', alignItems:'center' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:`url('${BANNER_IMG}')`, backgroundSize:'cover', backgroundPosition:'center 40%', zIndex:0 }}/>
          <div style={{ position:'absolute', inset:0, zIndex:1, background:'linear-gradient(90deg,rgba(5,10,30,0.92) 0%,rgba(5,10,30,0.65) 55%,rgba(5,10,30,0.18) 100%)' }}/>
          <div style={{ position:'relative', zIndex:2, padding:'32px 40px', maxWidth:660 }}>
            <p style={{ fontSize:'0.65rem', fontWeight:700, color:'#93c5fd', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8 }}>Order Intelligence</p>
            <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'clamp(1.4rem,2.5vw,2rem)', fontWeight:800, color:'#fff', lineHeight:1.2, marginBottom:10 }}>
              8 Customers. 56,000+ Wafers.<br/><span style={{ color:'#60a5fa' }}>All Tracked Live.</span>
            </h3>
            <div className="flex flex-wrap gap-8">
              {[{v:'₹5.6 Cr',l:'Monthly Revenue'},{v:'92%',l:'On-Time Rate'},{v:'78%',l:'Avg Progress'}].map(s=>(
                <div key={s.l} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'1.6rem', fontWeight:800, color:'#fff', fontFamily:"'Space Grotesk',sans-serif", lineHeight:1 }}>{s.v}</div>
                  <div style={{ fontSize:'0.65rem', color:'rgba(148,163,184,0.9)', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:4 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ⑤ TABLE / CARDS — green tint bg */}
        <div style={{ background:'linear-gradient(135deg,#f0fdf4,#dcfce7)', padding:'24px 0 28px' }}>
          <div className="px-2">
            {/* Desktop table */}
            {viewMode==='table' && (
              <div className="card overflow-hidden hidden md:block">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2"><ShoppingCart size={14} className="text-blue-600"/>All Orders</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Click any row to view full order details</p>
                  </div>
                  <span className="badge badge-green">{filtered.length} orders</span>
                </div>
                <div className="overflow-x-auto bg-white">
                  <table className="w-full" style={{ minWidth:'920px' }}>
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {['Company','Order ID','Product / Tech','Total Qty','Completed','Remaining','Progress','Dates','Priority','Revenue','Stage','Delivery'].map(h => (
                          <th key={h} className="text-left text-[9px] uppercase tracking-wider text-slate-500 font-semibold py-3 px-3 first:pl-5 last:pr-5 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filtered.map(o => <OrderRow key={o.id} order={o} onClick={()=>setSelected(o)}/>)}
                    </tbody>
                  </table>
                </div>
                {filtered.length === 0 && (
                  <div className="py-16 text-center bg-white">
                    <ShoppingCart size={32} className="text-slate-300 mx-auto mb-3"/>
                    <p className="text-sm text-slate-500 font-medium">No orders match your filters.</p>
                  </div>
                )}
              </div>
            )}

            {/* Mobile cards / cards view */}
            <div className={viewMode==='cards' ? 'block' : 'md:hidden'}>
              {filtered.length === 0 ? (
                <div className="card py-16 text-center">
                  <ShoppingCart size={32} className="text-slate-300 mx-auto mb-3"/>
                  <p className="text-sm text-slate-500 font-medium">No orders match your filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.map(o => <OrderCard key={o.id} order={o} onClick={()=>setSelected(o)}/>)}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
