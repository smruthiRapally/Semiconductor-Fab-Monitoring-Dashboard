import React, { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts'
import {
  TrendingUp, TrendingDown, DollarSign, Target, Radio,
  ArrowUpRight, IndianRupee, BarChart2, Layers, Package,
} from 'lucide-react'
import { revenueData, revenueByCustomer, costBreakdown } from '../data/mockData'

function formatINR(val) {
  if (val >= 10000000) return `₹${(val/10000000).toFixed(2)}Cr`
  if (val >= 100000)   return `₹${(val/100000).toFixed(1)}L`
  return `₹${val.toLocaleString('en-IN')}`
}

const FabTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2" style={{ border:'1px solid rgba(59,130,246,0.3)' }}>
      <p className="text-[10px] text-slate-500 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="text-xs font-bold" style={{ color:p.color||'#60a5fa' }}>
          {p.name}: {formatINR(p.value)}
        </p>
      ))}
    </div>
  )
}

const latest = revenueData[revenueData.length - 1]
const prev   = revenueData[revenueData.length - 2]
const totalRevenue = revenueData.reduce((s,d) => s+d.revenue, 0)
const totalProfit  = revenueData.reduce((s,d) => s+d.profit, 0)
const avgMargin    = Math.round((totalProfit / totalRevenue) * 100)

export default function Revenue() {
  const [view, setView] = useState('monthly')

  const revenueGrowth = (((latest.revenue - prev.revenue) / prev.revenue)*100).toFixed(1)
  const profitGrowth  = (((latest.profit  - prev.profit)  / prev.profit) *100).toFixed(1)
  const costPerWafer  = Math.round(latest.cost / latest.wafers)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">
            <span className="gradient-text-cyan">Revenue</span> &amp; Profit Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Radio size={10} className="text-green-400 live-dot"/>
            Financial performance · Manufacturing cost vs selling price
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="fab-badge badge-green"><ArrowUpRight size={9}/>+{revenueGrowth}% MoM</span>
          <span className="fab-badge badge-cyan">FY 2024</span>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { l:'Total Revenue (YTD)', v:formatINR(totalRevenue),   c:'#10b981', glow:'rgba(16,185,129,0.3)', icon:IndianRupee, sub:`+${revenueGrowth}% last month` },
          { l:'Total Profit (YTD)',  v:formatINR(totalProfit),    c:'#4ade80', glow:'rgba(74,222,128,0.3)', icon:TrendingUp,  sub:`${avgMargin}% avg margin` },
          { l:'Mfg Cost (Jun)',      v:formatINR(latest.cost),    c:'#f87171', glow:'rgba(248,113,113,0.3)',icon:Package,     sub:`₹${costPerWafer.toLocaleString()}/wafer` },
          { l:'Profit Margin (Jun)', v:`${Math.round((latest.profit/latest.revenue)*100)}%`, c:'#fbbf24', glow:'rgba(251,191,36,0.3)', icon:Target, sub:`+${profitGrowth}% vs May` },
        ].map((s,i) => {
          const Icon = s.icon
          return (
            <div key={s.l} className="glass rounded-2xl p-4 relative overflow-hidden stat-card-fab anim-fade-up"
              style={{ animationDelay:`${i*70}ms`, border:`1px solid ${s.c}20` }}>
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:`linear-gradient(90deg,transparent,${s.c},transparent)` }}/>
              <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
                style={{ background:`radial-gradient(ellipse at 50% 100%,${s.glow} 0%,transparent 70%)` }}/>
              <div className="relative z-10 flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background:`${s.c}20`, border:`1px solid ${s.c}40`, boxShadow:`0 0 16px ${s.glow}` }}>
                  <Icon size={16} style={{ color:s.c }}/>
                </div>
              </div>
              <p className="relative z-10 text-xl font-black" style={{ color:s.c }}>{s.v}</p>
              <p className="relative z-10 text-[10px] text-slate-500 mt-0.5 uppercase tracking-widest">{s.l}</p>
              <p className="relative z-10 text-[9px] text-slate-600 mt-1">{s.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Revenue vs Cost Chart */}
      <div className="glass rounded-2xl p-5 relative overflow-hidden anim-fade-up">
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:'linear-gradient(90deg,transparent,#10b981,#2563eb,transparent)' }}/>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <IndianRupee size={14} className="text-green-400"/>Revenue vs Manufacturing Cost vs Profit
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Jan – Jun 2024 · All values in INR</p>
          </div>
          <div className="flex gap-1.5">
            {[['monthly','Monthly']].map(([k,l]) => (
              <button key={k} onClick={() => setView(k)}
                className="text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: view===k ? 'rgba(37,99,235,0.25)' : 'rgba(15,23,42,0.6)',
                  border: `1px solid ${view===k ? 'rgba(59,130,246,0.5)' : 'rgba(59,130,246,0.12)'}`,
                  color: view===k ? '#93c5fd' : '#475569',
                }}>{l}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={revenueData} margin={{ top:5, right:10, left:0, bottom:0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(59,130,246,0.07)" vertical={false}/>
            <XAxis dataKey="month" tick={{ fontSize:11, fill:'#475569' }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize:9, fill:'#475569' }} axisLine={false} tickLine={false} tickFormatter={v=>formatINR(v)}/>
            <Tooltip content={<FabTooltip/>}/>
            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize:'10px', color:'#64748b', paddingTop:'12px' }}/>
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r:5 }}/>
            <Area type="monotone" dataKey="cost"    name="Mfg Cost" stroke="#f87171" strokeWidth={2} fill="url(#costGrad)" dot={false} activeDot={{ r:5 }}/>
            <Area type="monotone" dataKey="profit"  name="Profit"   stroke="#4ade80" strokeWidth={2} fill="url(#profGrad)" dot={false} activeDot={{ r:5 }}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue by Customer + Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue by customer */}
        <div className="glass rounded-2xl p-5 relative overflow-hidden anim-fade-up" style={{ animationDelay:'100ms' }}>
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:'linear-gradient(90deg,transparent,#2563eb,transparent)' }}/>
          <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <BarChart2 size={14} className="text-blue-400"/>Revenue by Customer
          </h2>
          <p className="text-[10px] text-slate-500 mb-3">Jun 2024 breakdown</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueByCustomer} layout="vertical" margin={{ top:0, right:10, left:0, bottom:0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(59,130,246,0.07)" horizontal={false}/>
              <XAxis type="number" tick={{ fontSize:9, fill:'#475569' }} axisLine={false} tickLine={false} tickFormatter={v=>formatINR(v)}/>
              <YAxis type="category" dataKey="customer" tick={{ fontSize:9, fill:'#64748b' }} axisLine={false} tickLine={false} width={70}/>
              <Tooltip content={<FabTooltip/>}/>
              <Bar dataKey="revenue" name="Revenue" radius={[0,4,4,0]} maxBarSize={18}>
                {revenueByCustomer.map((d,i) => (
                  <Cell key={i} fill={d.color} style={{ filter:`drop-shadow(0 0 4px ${d.color}60)` }}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost breakdown pie */}
        <div className="glass rounded-2xl p-5 relative overflow-hidden anim-fade-up" style={{ animationDelay:'150ms' }}>
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:'linear-gradient(90deg,transparent,#f59e0b,transparent)' }}/>
          <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <Layers size={14} className="text-amber-400"/>Manufacturing Cost Breakdown
          </h2>
          <p className="text-[10px] text-slate-500 mb-3">Jun 2024 cost structure</p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={costBreakdown} cx="50%" cy="50%" outerRadius={68} innerRadius={38}
                  dataKey="value" strokeWidth={0} paddingAngle={3}>
                  {costBreakdown.map((d,i) => (
                    <Cell key={i} fill={d.color} style={{ filter:`drop-shadow(0 0 5px ${d.color}60)` }}/>
                  ))}
                </Pie>
                <Tooltip content={({ active, payload }) => {
                  if (!active||!payload?.length) return null
                  const d = payload[0]
                  return <div className="glass rounded px-2 py-1.5" style={{ border:`1px solid ${d.payload.color}40` }}>
                    <p className="text-[10px] font-bold" style={{ color:d.payload.color }}>{d.name}: {d.value}%</p>
                  </div>
                }}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2 w-full">
              {costBreakdown.map(d => (
                <div key={d.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background:d.color }}/>
                    <span className="text-[10px] text-slate-400 truncate">{d.name}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] font-bold" style={{ color:d.color }}>{d.value}%</span>
                    <p className="text-[9px] text-slate-600">{formatINR(d.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly P&L Table */}
      <div className="glass rounded-2xl overflow-hidden anim-fade-up" style={{ animationDelay:'200ms' }}>
        <div className="px-5 py-4" style={{ borderBottom:'1px solid rgba(59,130,246,0.1)' }}>
          <h2 className="text-sm font-bold text-white">Monthly P&amp;L Statement</h2>
          <p className="text-[10px] text-slate-500 mt-0.5">Revenue · Manufacturing Cost · Profit · Margin · Wafers</p>
        </div>

        {/* Mobile view */}
        <div className="md:hidden divide-y divide-blue-950/30">
          {revenueData.map((d) => {
            const margin = Math.round((d.profit/d.revenue)*100)
            return (
              <div key={d.month} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white">{d.month}</span>
                  <span className="fab-badge badge-green">Margin: {margin}%</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><p className="text-[9px] text-slate-600">Revenue</p><p className="text-[11px] font-bold text-green-300">{formatINR(d.revenue)}</p></div>
                  <div><p className="text-[9px] text-slate-600">Mfg Cost</p><p className="text-[11px] font-bold text-red-400">{formatINR(d.cost)}</p></div>
                  <div><p className="text-[9px] text-slate-600">Profit</p><p className="text-[11px] font-bold text-yellow-300">{formatINR(d.profit)}</p></div>
                  <div><p className="text-[9px] text-slate-600">Wafers</p><p className="text-[11px] font-bold text-slate-200">{d.wafers.toLocaleString('en-IN')}</p></div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(15,23,42,0.8)' }}>
                  <div className="h-full rounded-full" style={{ width:`${margin}%`, background:'linear-gradient(90deg,#10b981,#4ade80)', boxShadow:'0 0 6px rgba(16,185,129,0.5)' }}/>
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full fab-table">
            <thead>
              <tr>
                <th>Month</th><th>Revenue</th><th>Mfg Cost</th>
                <th>Profit / Loss</th><th>Profit Margin</th><th>Wafers Sold</th><th>Rev/Wafer</th>
              </tr>
            </thead>
            <tbody>
              {revenueData.map((d) => {
                const margin = Math.round((d.profit/d.revenue)*100)
                const isPrev = d.month === prev.month
                const isLatest = d.month === latest.month
                return (
                  <tr key={d.month} style={isLatest ? { background:'rgba(37,99,235,0.05)' } : {}}>
                    <td className="font-bold text-slate-200">
                      {d.month}
                      {isLatest && <span className="ml-2 fab-badge badge-cyan text-[8px]">LATEST</span>}
                    </td>
                    <td className="font-bold text-green-300">{formatINR(d.revenue)}</td>
                    <td className="font-bold text-red-400">{formatINR(d.cost)}</td>
                    <td className="font-bold text-yellow-300">{formatINR(d.profit)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(15,23,42,0.8)' }}>
                          <div className="h-full rounded-full" style={{ width:`${margin}%`, background:'linear-gradient(90deg,#10b981,#4ade80)' }}/>
                        </div>
                        <span className="text-[10px] font-bold text-green-300">{margin}%</span>
                      </div>
                    </td>
                    <td className="text-slate-300">{d.wafers.toLocaleString('en-IN')}</td>
                    <td className="text-slate-400">{formatINR(Math.round(d.revenue/d.wafers))}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Summary footer */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-5 py-4"
          style={{ borderTop:'1px solid rgba(59,130,246,0.1)', background:'rgba(15,23,42,0.4)' }}>
          {[
            { l:'Total Revenue', v:formatINR(totalRevenue), c:'#4ade80' },
            { l:'Total Mfg Cost', v:formatINR(revenueData.reduce((s,d)=>s+d.cost,0)), c:'#f87171' },
            { l:'Total Profit', v:formatINR(totalProfit), c:'#fbbf24' },
            { l:'Avg Profit Margin', v:`${avgMargin}%`, c:'#22d3ee' },
          ].map(s => (
            <div key={s.l} className="text-center">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest">{s.l}</p>
              <p className="text-sm font-black mt-1" style={{ color:s.c }}>{s.v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
