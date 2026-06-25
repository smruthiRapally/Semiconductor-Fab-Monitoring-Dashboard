import React, { useState } from 'react'
import PageHero from '../components/PageHero'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import {
  FileText, Download, Factory, TrendingUp, TrendingDown, AlertTriangle,
  Cpu, Wind, Calendar, Clock, Loader2, CheckCircle,
  IndianRupee, BarChart2, Zap, ShoppingCart, Star,
} from 'lucide-react'
import { reportData } from '../data/mockData'

const HERO_IMG  = 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=1200&q=80&fit=crop'
const BANNER_IMG = 'https://images.unsplash.com/photo-1601128533718-374ffcca299b?w=1200&q=80&fit=crop'

const now = new Date()
const dateStr = now.toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})
const timeStr = now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})

function fmtINR(val) {
  if (val >= 10000000) return `₹${(val/10000000).toFixed(2)}Cr`
  if (val >= 100000)   return `₹${(val/100000).toFixed(1)}L`
  return `₹${val.toLocaleString('en-IN')}`
}

const financialData = [
  { month:'Jan', revenue:42000000, cost:28500000 },
  { month:'Feb', revenue:45000000, cost:29800000 },
  { month:'Mar', revenue:48000000, cost:31200000 },
  { month:'Apr', revenue:51000000, cost:32500000 },
  { month:'May', revenue:54000000, cost:33600000 },
  { month:'Jun', revenue:56000000, cost:34800000 },
]
const finPie = [
  { name:'Materials',   value:38, color:'#2563eb' },
  { name:'Labour',      value:22, color:'#0891b2' },
  { name:'Energy',      value:18, color:'#7c3aed' },
  { name:'Maintenance', value:12, color:'#d97706' },
  { name:'Overhead',    value:10, color:'#16a34a' },
]
const execSummary = {
  headline:'Record revenue of ₹5.6 Cr in June 2024, driven by CRITICAL orders for Samsung (5nm FinFET) and Intel (28nm Power IC).',
  highlights:[
    { icon:'🟢', text:'Yield rate at 96.5% — above 96% target for 3rd consecutive month' },
    { icon:'🟢', text:'12,500 wafers produced — 96.2% of monthly target achieved' },
    { icon:'🟡', text:'Defects increased by 12 units — Particle contamination dominant (45%)' },
    { icon:'🟡', text:'Photoresist (EUV Grade) at 28% stock — reorder initiated' },
    { icon:'🔴', text:'HF Etching Solution critically low (12%) — emergency reorder in progress' },
    { icon:'🟢', text:'Machine uptime at 96.8% — 42 of 48 machines operational' },
  ],
  kpis:[
    { l:'Revenue',  v:'₹5.6 Cr',  trend:'+3.7%', pos:true  },
    { l:'Profit',   v:'₹2.12 Cr', trend:'+3.9%', pos:true  },
    { l:'Margin',   v:'37.9%',    trend:'+0.1%', pos:true  },
    { l:'Yield',    v:'96.5%',    trend:'+0.3%', pos:true  },
    { l:'Defects',  v:'356',      trend:'+12',   pos:false },
    { l:'Uptime',   v:'96.8%',    trend:'+0.2%', pos:true  },
  ],
}
const REPORT_TYPES = [
  { key:'full',       label:'Full Report',      icon:FileText,     accent:'#2563eb', desc:'All 5 sections combined' },
  { key:'production', label:'Production',        icon:Factory,      accent:'#0891b2', desc:'Wafer output & throughput' },
  { key:'financial',  label:'Financial P&L',     icon:IndianRupee,  accent:'#16a34a', desc:'Revenue, cost & profit' },
  { key:'defect',     label:'Defect Report',     icon:AlertTriangle,accent:'#d97706', desc:'Defect types & root causes' },
  { key:'order',      label:'Order Report',      icon:ShoppingCart, accent:'#7c3aed', desc:'Customer orders & status' },
  { key:'executive',  label:'Executive Summary', icon:Star,         accent:'#dc2626', desc:'KPIs & strategic highlights' },
]

const ChartTip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-md px-3 py-2">
      <p className="text-[10px] text-slate-500 mb-1">{label}</p>
      {payload.map(p=>(
        <p key={p.name} className="text-xs font-bold" style={{ color:p.color||'#2563eb' }}>
          {p.name}: {fmtINR(p.value)}
        </p>
      ))}
    </div>
  )
}

/* ── PDF generator ── */
async function generatePDF(type) {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')
  const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' })
  const W = doc.internal.pageSize.getWidth(); let y = 0
  const titles = { full:'FAB PERFORMANCE REPORT', production:'PRODUCTION REPORT', financial:'FINANCIAL REPORT', defect:'DEFECT ANALYSIS REPORT', order:'ORDER SUMMARY REPORT', executive:'EXECUTIVE SUMMARY' }
  doc.setFillColor(2,8,23); doc.rect(0,0,W,297,'F')
  doc.setFillColor(37,99,235); doc.rect(0,0,W,45,'F')
  doc.setFillColor(30,64,175); doc.rect(0,38,W,7,'F')
  doc.setTextColor(255,255,255)
  doc.setFontSize(20); doc.setFont('helvetica','bold')
  doc.text(titles[type]||titles.full, W/2, 16, { align:'center' })
  doc.setFontSize(9); doc.setFont('helvetica','normal')
  doc.text('Semiconductor Fabrication Monitoring System — SemiFab Control Center', W/2, 25, { align:'center' })
  doc.setFontSize(8); doc.text(`Generated: ${dateStr}  |  ${timeStr}`, W/2, 35, { align:'center' })
  y = 55
  const sec = (title) => {
    if (y>248) { doc.addPage(); doc.setFillColor(2,8,23); doc.rect(0,0,W,297,'F'); y=15 }
    doc.setFillColor(15,23,42); doc.setDrawColor(37,99,235)
    doc.roundedRect(12,y,W-24,9,2,2,'FD')
    doc.setTextColor(96,165,250); doc.setFontSize(10); doc.setFont('helvetica','bold')
    doc.text(title,18,y+6.2); y+=14
  }
  const kv = (k,v) => {
    if (y>272) { doc.addPage(); doc.setFillColor(2,8,23); doc.rect(0,0,W,297,'F'); y=15 }
    doc.setFontSize(8.5); doc.setFont('helvetica','normal'); doc.setTextColor(148,163,184)
    doc.text(k,20,y); doc.setFont('helvetica','bold'); doc.setTextColor(226,232,240)
    doc.text(String(v),105,y); y+=7
  }
  if (type==='executive'||type==='full') {
    sec('EXECUTIVE SUMMARY')
    const lines = doc.splitTextToSize(execSummary.headline, W-40)
    doc.setFontSize(8.5); doc.setFont('helvetica','normal'); doc.setTextColor(148,163,184)
    doc.text(lines,20,y); y+=lines.length*6+4
    y+=4
  }
  if (type==='production'||type==='full') {
    sec('1. PRODUCTION SUMMARY')
    kv('Wafers Produced',`${reportData.production.wafersProduced.toLocaleString('en-IN')} units`)
    kv('Target',`${reportData.production.wafersTarget.toLocaleString('en-IN')} units`)
    kv('Achievement',`${reportData.production.efficiency}%`)
    kv('Cycle Time',`${reportData.production.cycleTime} hours`)
    kv('Throughput',`${reportData.production.throughput.toLocaleString('en-IN')} wafers/day`)
    y+=4
  }
  if (type==='financial'||type==='full') {
    sec('2. FINANCIAL REPORT')
    kv('Revenue (Jun)','₹5.60 Cr'); kv('Mfg Cost (Jun)','₹3.48 Cr')
    kv('Profit (Jun)','₹2.12 Cr'); kv('Profit Margin','37.9%'); kv('Revenue YTD','₹29.6 Cr')
    y+=4
  }
  if (type==='defect'||type==='full') {
    sec('3. DEFECT ANALYSIS REPORT')
    kv('Total Defects',`${reportData.defects.totalDefects}`)
    kv('Defect Density',`${reportData.defects.defectDensity} /cm²`)
    kv('Critical Defects',`${reportData.defects.criticalDefects}`)
    kv('Inspection Coverage',`${reportData.defects.inspectionCoverage}%`)
    kv('Dominant Type','Particle Defects (45%)')
    y+=4
    autoTable(doc,{
      startY:y,
      head:[['Defect Type','Count','Severity','Location','Est. Cost']],
      body:[['Particle Defects','128','High','Lithography','₹3.84 Lakh'],['Pattern Defects','98','Medium','Etching','₹2.94 Lakh'],['Alignment Defects','56','Low','Deposition','₹1.68 Lakh'],['Contamination','34','High','Clean Room','₹1.02 Lakh'],['Gate Oxide','22','Medium','Oxidation','₹66,000'],['Metal Shorts','18','High','Metallization','₹54,000']],
      headStyles:{ fillColor:[37,99,235], textColor:255, fontStyle:'bold', fontSize:8 },
      bodyStyles:{ fontSize:7.5, textColor:[203,213,225], fillColor:[2,8,23] },
      alternateRowStyles:{ fillColor:[15,23,42] }, margin:{left:12,right:12},
    })
    y = doc.lastAutoTable.finalY + 8
  }
  if (type==='order'||type==='full') {
    sec('4. ORDER SUMMARY REPORT')
    autoTable(doc,{
      startY:y,
      head:[['Order ID','Customer','Product','Progress','Status','Revenue']],
      body:[['ORD-001','Samsung Semiconductor','5nm FinFET Logic','78%','In Fab','₹1.82 Cr'],['ORD-002','TSMC Alliance','14nm RF Chips','45%','Lithography','₹1.45 Cr'],['ORD-003','Intel Foundry','28nm Power IC','92%','Testing','₹1.08 Cr'],['ORD-004','Qualcomm Fab','7nm Mobile SoC','22%','Raw Wafer','₹74 Lakh'],['ORD-005','NXP Technologies','180nm Automotive','99%','Packaging','₹32 Lakh'],['ORD-006','Infineon Systems','65nm Mixed Signal','0%','Queued','₹19 Lakh']],
      headStyles:{ fillColor:[37,99,235], textColor:255, fontStyle:'bold', fontSize:8 },
      bodyStyles:{ fontSize:7.5, textColor:[203,213,225], fillColor:[2,8,23] },
      alternateRowStyles:{ fillColor:[15,23,42] }, margin:{left:12,right:12},
    })
    y = doc.lastAutoTable.finalY + 8
  }
  if (type==='full') {
    sec('5. MACHINE & ENVIRONMENT STATUS')
    kv('Running Machines',`${reportData.machines.running} / ${reportData.machines.totalMachines}`)
    kv('Avg Uptime',`${reportData.machines.avgUptime}%`)
    kv('Temperature',reportData.environment.temperature)
    kv('Humidity',reportData.environment.humidity)
    kv('Clean Room',reportData.environment.cleanRoomClass)
  }
  const pages = doc.internal.getNumberOfPages()
  for (let i=1;i<=pages;i++) {
    doc.setPage(i)
    doc.setFontSize(7.5); doc.setTextColor(71,85,105); doc.setFont('helvetica','normal')
    doc.text('SemiFab Monitoring System — Confidential',12,291)
    doc.text(`Page ${i} of ${pages}`,W-12,291,{align:'right'})
    doc.setDrawColor(37,99,235,0.3); doc.line(12,287,W-12,287)
  }
  doc.save(`semifab-${type}-report-${now.toISOString().slice(0,10)}.pdf`)
}

function generateCSV() {
  const rows = [
    ['FAB PERFORMANCE REPORT — SemiFab Control Center'],
    [`Generated: ${dateStr} ${timeStr}`],[''],
    ['PRODUCTION SUMMARY'],
    ['Wafers Produced',reportData.production.wafersProduced],['Target',reportData.production.wafersTarget],
    ['Achievement(%)',reportData.production.efficiency],['Throughput/day',reportData.production.throughput],[''],
    ['FINANCIAL REPORT'],['Revenue Jun','₹5.60 Cr'],['Mfg Cost Jun','₹3.48 Cr'],['Profit Jun','₹2.12 Cr'],['Margin','37.9%'],[''],
    ['DEFECT REPORT'],['Total Defects',reportData.defects.totalDefects],['Critical',reportData.defects.criticalDefects],['Coverage(%)',reportData.defects.inspectionCoverage],[''],
    ['ORDER SUMMARY'],['Order ID','Customer','Product','Progress','Status'],
    ['ORD-001','Samsung Semiconductor','5nm FinFET Logic','78%','In Fab'],
    ['ORD-002','TSMC Alliance','14nm RF Chips','45%','Lithography'],
    ['ORD-003','Intel Foundry','28nm Power IC','92%','Testing'],
    ['ORD-004','Qualcomm Fab','7nm Mobile SoC','22%','Raw Wafer'],
    ['ORD-005','NXP Technologies','180nm Automotive','99%','Packaging'],
    ['ORD-006','Infineon Systems','65nm Mixed Signal','0%','Queued'],
  ]
  const csv = rows.map(r=>r.map(c=>`"${c}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href=url
  a.download=`semifab-full-report-${now.toISOString().slice(0,10)}.csv`
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
}

/* ── Section card (data preview) ── */
function SectionCard({ icon:Icon, accent, title, rows, delay=0 }) {
  return (
    <div className="card overflow-hidden anim-fade-up" style={{ animationDelay:`${delay}ms`, borderTop:`3px solid ${accent}` }}>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100" style={{ background:`${accent}08` }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:accent }}>
          <Icon size={13} className="text-white"/>
        </div>
        <h3 className="text-xs font-bold text-slate-800">{title}</h3>
      </div>
      {rows.map(([k,v])=>(
        <div key={k} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
          <span className="text-[10px] text-slate-500">{k}</span>
          <span className="text-[11px] font-semibold text-slate-800">{v}</span>
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════ */
export default function Reports() {
  const [states,     setStates]     = useState({})
  const [csvState,   setCsvState]   = useState('idle')
  const [activeTab,  setActiveTab]  = useState('overview')

  const handlePDF = async (key) => {
    setStates(s=>({...s,[key]:'loading'}))
    try { await generatePDF(key); setStates(s=>({...s,[key]:'done'})) }
    catch(e) { console.error(e); setStates(s=>({...s,[key]:'idle'})) }
    finally { setTimeout(()=>setStates(s=>({...s,[key]:'idle'})),3000) }
  }
  const handleCSV = () => {
    setCsvState('loading')
    setTimeout(()=>{ generateCSV(); setCsvState('done'); setTimeout(()=>setCsvState('idle'),3000) },600)
  }

  const tabs = [
    { key:'overview',   label:'Overview'   },
    { key:'financial',  label:'Financial'  },
    { key:'production', label:'Production' },
    { key:'defects',    label:'Defects'    },
    { key:'orders',     label:'Orders'     },
  ]

  return (
    <div>
      {/* ① HERO */}
      <PageHero src={HERO_IMG} badge="Reports & Analytics · Export Ready" title="Reports & Analytics" accent="6 Report Types"
        sub="Generate, export and analyze — production, financial, defect, order reports and executive summaries." />

      {/* ② EXECUTIVE SUMMARY — amber tint */}
      <div style={{ background:'linear-gradient(135deg,#fffbeb,#fef3c7)', padding:'24px 0 20px' }}>
        <div className="card p-5 mx-2" style={{ borderTop:'3px solid #d97706' }}>
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="icon-box rounded-xl" style={{ background:'#fffbeb', color:'#d97706', width:38, height:38 }}><Star size={17}/></div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Executive Summary</h2>
                <p className="text-[10px] text-slate-500">Jun 2024 · Key highlights &amp; strategic KPIs</p>
              </div>
            </div>
            <button onClick={()=>handlePDF('executive')}
              className="btn-secondary text-[11px] py-2 px-4 flex items-center gap-2"
              disabled={states['executive']==='loading'}>
              {states['executive']==='loading'?<Loader2 size={12} className="animate-spin"/>:states['executive']==='done'?<CheckCircle size={12} className="text-green-600"/>:<Download size={12}/>}
              {states['executive']==='loading'?'Generating…':states['executive']==='done'?'Downloaded!':'Export PDF'}
            </button>
          </div>

          <p className="text-sm text-slate-700 mb-4 leading-relaxed">{execSummary.headline}</p>

          {/* KPI grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
            {execSummary.kpis.map(k=>(
              <div key={k.l} className="rounded-xl p-3 text-center border"
                style={{ background:k.pos?'#f0fdf4':'#fef2f2', borderColor:k.pos?'#bbf7d0':'#fecaca' }}>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider font-medium">{k.l}</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{k.v}</p>
                <div className="flex items-center justify-center gap-0.5 mt-1">
                  {k.pos?<TrendingUp size={9} className="text-green-600"/>:<TrendingDown size={9} className="text-red-500"/>}
                  <span className={`text-[9px] font-bold ${k.pos?'text-green-700':'text-red-600'}`}>{k.trend}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Highlights */}
          <div className="space-y-2">
            {execSummary.highlights.map((h,i)=>(
              <div key={i} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-amber-50 transition-colors">
                <span className="text-base flex-shrink-0">{h.icon}</span>
                <p className="text-xs text-slate-600 leading-relaxed">{h.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ③ DOWNLOAD REPORT CARDS — blue/indigo tint */}
      <div style={{ background:'linear-gradient(135deg,#eff6ff,#dbeafe)', padding:'24px 0 20px' }}>
        <div className="px-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2"><FileText size={14} className="text-blue-600"/>Download Reports</h2>
              <p className="text-xs text-slate-500 mt-0.5">Click any card to generate and download a PDF report</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {REPORT_TYPES.map((rt,i)=>{
              const Icon = rt.icon
              const st = states[rt.key]
              return (
                <div key={rt.key} className="card p-4 anim-fade-up" style={{ animationDelay:`${i*60}ms`, borderTop:`3px solid ${rt.accent}` }}>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="icon-box rounded-xl" style={{ background:`${rt.accent}15`, color:rt.accent, width:38, height:38 }}><Icon size={16}/></div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{rt.label}</p>
                      <p className="text-[9px] text-slate-500">{rt.desc}</p>
                    </div>
                  </div>
                  <button onClick={()=>handlePDF(rt.key)} disabled={st==='loading'}
                    className="w-full btn-primary text-[11px] py-2 justify-center disabled:opacity-50"
                    style={{ background:rt.accent }}>
                    {st==='loading'?<Loader2 size={11} className="animate-spin"/>:st==='done'?<CheckCircle size={11}/>:<Download size={11}/>}
                    {st==='loading'?'Generating…':st==='done'?'Downloaded!':'Export PDF'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ④ CSV EXPORT — white */}
      <div style={{ background:'#fff', padding:'20px 0 16px' }}>
        <div className="card p-5 mx-2" style={{ borderTop:'3px solid #16a34a' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2"><FileText size={14} className="text-green-600"/>Full Data Export (CSV)</h2>
              <p className="text-xs text-slate-500 mt-1">All sections · Production · Financial · Defects · Orders · Machines · Environment</p>
              <div className="flex flex-wrap gap-3 mt-2">
                <span className="flex items-center gap-1 text-[10px] text-slate-500"><Calendar size={10} className="text-blue-500"/>{dateStr}</span>
                <span className="flex items-center gap-1 text-[10px] text-slate-500"><Clock size={10} className="text-blue-500"/>{timeStr}</span>
              </div>
            </div>
            <button onClick={handleCSV} disabled={csvState==='loading'}
              className="btn-secondary min-w-[160px] justify-center disabled:opacity-50 flex items-center gap-2">
              {csvState==='loading'?<Loader2 size={14} className="animate-spin"/>:csvState==='done'?<CheckCircle size={14} className="text-green-600"/>:<Download size={14}/>}
              {csvState==='loading'?'Exporting…':csvState==='done'?'Exported!':'Export Full CSV'}
            </button>
          </div>
        </div>
      </div>

      {/* ⑤ IMAGE BANNER */}
      <div style={{ position:'relative', overflow:'hidden', minHeight:200, display:'flex', alignItems:'center' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:`url('${BANNER_IMG}')`, backgroundSize:'cover', backgroundPosition:'center', zIndex:0 }}/>
        <div style={{ position:'absolute', inset:0, zIndex:1, background:'linear-gradient(90deg,rgba(5,10,30,0.92) 0%,rgba(5,10,30,0.65) 55%,rgba(5,10,30,0.18) 100%)' }}/>
        <div style={{ position:'relative', zIndex:2, padding:'32px 40px', maxWidth:660 }}>
          <p style={{ fontSize:'0.65rem', fontWeight:700, color:'#93c5fd', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8 }}>Report Intelligence</p>
          <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'clamp(1.4rem,2.5vw,2rem)', fontWeight:800, color:'#fff', lineHeight:1.2, marginBottom:10 }}>
            1,240+ Data Points.<br/><span style={{ color:'#60a5fa' }}>6 Report Types. One Download.</span>
          </h3>
          <div className="flex flex-wrap gap-8">
            {[{v:'5',l:'Report Sections'},{v:'PDF+CSV',l:'Export Formats'},{v:'₹5.6 Cr',l:'Jun Revenue'}].map(s=>(
              <div key={s.l} style={{ textAlign:'center' }}>
                <div style={{ fontSize:'1.6rem', fontWeight:800, color:'#fff', fontFamily:"'Space Grotesk',sans-serif", lineHeight:1 }}>{s.v}</div>
                <div style={{ fontSize:'0.65rem', color:'rgba(148,163,184,0.9)', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ⑥ DATA PREVIEW TABS — purple/green tint */}
      <div style={{ background:'linear-gradient(135deg,#f5f3ff,#ede9fe)', padding:'24px 0 28px' }}>
        <div className="px-2">
          <div className="flex flex-wrap gap-2 mb-5">
            {tabs.map(t=>(
              <button key={t.key} onClick={()=>setActiveTab(t.key)}
                className="text-[11px] font-semibold px-3 py-2 rounded-lg border transition-all"
                style={{ background:activeTab===t.key?'#fff':'rgba(255,255,255,0.6)', borderColor:activeTab===t.key?'#bfdbfe':'transparent', color:activeTab===t.key?'#2563eb':'#64748b', boxShadow:activeTab===t.key?'0 2px 8px rgba(37,99,235,0.12)':'none' }}>
                {t.label}
              </button>
            ))}
          </div>

          {activeTab==='overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <SectionCard icon={Factory}      accent="#2563eb" title="Production Summary" rows={[['Wafers Produced',`${reportData.production.wafersProduced.toLocaleString('en-IN')} units`],['Target',`${reportData.production.wafersTarget.toLocaleString('en-IN')} units`],['Achievement',`${reportData.production.efficiency}%`],['Cycle Time',`${reportData.production.cycleTime} hrs`],['Throughput',`${reportData.production.throughput.toLocaleString('en-IN')}/day`]]}/>
              <SectionCard icon={IndianRupee}  accent="#16a34a" title="Financial Summary"  rows={[['Revenue (Jun)','₹5.60 Crore'],['Mfg Cost (Jun)','₹3.48 Crore'],['Profit (Jun)','₹2.12 Crore'],['Profit Margin','37.9%'],['Revenue YTD','₹29.6 Crore']]}/>
              <SectionCard icon={AlertTriangle}accent="#d97706" title="Defect Summary"     rows={[['Total Defects',`${reportData.defects.totalDefects}`],['Defect Density',`${reportData.defects.defectDensity} /cm²`],['Critical',`${reportData.defects.criticalDefects}`],['Inspection',`${reportData.defects.inspectionCoverage}%`],['Dominant','Particle (45%)']]}/>
              <SectionCard icon={ShoppingCart} accent="#7c3aed" title="Order Summary"      rows={[['Total Orders','8'],['Critical Priority','1'],['Active Orders','5'],['Total Revenue','₹55.9 Lakh'],['Due Today','2']]}/>
              <SectionCard icon={Cpu}          accent="#0891b2" title="Machine Status"     rows={[['Total',`${reportData.machines.totalMachines}`],['Running',`${reportData.machines.running}`],['Idle',`${reportData.machines.idle}`],['Maintenance',`${reportData.machines.maintenance}`],['Avg Uptime',`${reportData.machines.avgUptime}%`]]}/>
              <SectionCard icon={Wind}         accent="#06b6d4" title="Environment Status" rows={[['Temperature',reportData.environment.temperature],['Humidity',reportData.environment.humidity],['Clean Room',reportData.environment.cleanRoomClass],['Air Quality',reportData.environment.airQuality],['Particle Count',reportData.environment.particleCount]]}/>
            </div>
          )}

          {activeTab==='financial' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 card p-5" style={{ borderTop:'3px solid #16a34a' }}>
                <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2"><IndianRupee size={14} className="text-green-600"/>Revenue vs Mfg Cost</h3>
                <p className="text-[10px] text-slate-500 mb-3">Jan – Jun 2024</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={financialData} margin={{ top:5, right:10, left:0, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                    <XAxis dataKey="month" tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fontSize:9, fill:'#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v=>fmtINR(v)}/>
                    <Tooltip content={<ChartTip/>}/>
                    <Bar dataKey="revenue" name="Revenue" fill="#16a34a" radius={[4,4,0,0]} maxBarSize={32} fillOpacity={0.75}/>
                    <Bar dataKey="cost"    name="Cost"    fill="#dc2626" radius={[4,4,0,0]} maxBarSize={32} fillOpacity={0.55}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card p-5" style={{ borderTop:'3px solid #7c3aed' }}>
                <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2"><BarChart2 size={14} className="text-purple-600"/>Cost Breakdown</h3>
                <div className="flex justify-center mb-4">
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={finPie} cx="50%" cy="50%" outerRadius={58} innerRadius={36} dataKey="value" strokeWidth={2} stroke="#fff" paddingAngle={3}>
                        {finPie.map((d,i)=><Cell key={i} fill={d.color}/>)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {finPie.map(d=>(
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background:d.color }}/><span className="text-[10px] text-slate-600">{d.name}</span></div>
                      <span className="text-[10px] font-bold" style={{ color:d.color }}>{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab==='production' && (
            <SectionCard icon={Factory} accent="#2563eb" title="Production Report — Full Data" rows={[['Wafers Produced',`${reportData.production.wafersProduced.toLocaleString('en-IN')} units`],['Target',`${reportData.production.wafersTarget.toLocaleString('en-IN')} units`],['Achievement',`${reportData.production.efficiency}%`],['Cycle Time',`${reportData.production.cycleTime} hrs`],['Throughput',`${reportData.production.throughput.toLocaleString('en-IN')} wafers/day`],['On Hold',`${reportData.production.onHold} wafers`],['Revenue Est','₹5.60 Crore'],['Cost/Wafer','₹2,784'],['Lithography %','95%'],['Etching %','88%'],['Deposition %','92%'],['Packaging %','80%']]}/>
          )}

          {activeTab==='defects' && (
            <SectionCard icon={AlertTriangle} accent="#d97706" title="Defect Analysis Report" rows={[['Total Defects','356'],['Defect Density','0.028 /cm²'],['Critical','38'],['Inspection Coverage','98.4%'],['Particle Defects','128 (45%)'],['Pattern Defects','98 (35%)'],['Alignment Defects','56 (20%)'],['Dominant Stage','Lithography'],['Center Density','0.012 /cm²'],['Edge Density','0.048 /cm²'],['Capture Rate','98%'],['Est. Defect Cost','₹6.54 Lakh/month']]}/>
          )}

          {activeTab==='orders' && (
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-800">Order Report — All Active Orders</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Progress</th><th>Status</th><th>Revenue</th><th>Delivery</th></tr></thead>
                  <tbody>
                    {[
                      ['ORD-001','Samsung Semiconductor','5nm FinFET Logic','78%','In Fab','₹1.82 Cr','30 Jun 2024'],
                      ['ORD-002','TSMC Alliance','14nm RF Chips','45%','Lithography','₹1.45 Cr','08 Jul 2024'],
                      ['ORD-003','Intel Foundry','28nm Power IC','92%','Testing','₹1.08 Cr','24 Jun 2024'],
                      ['ORD-004','Qualcomm Fab','7nm Mobile SoC','22%','Raw Wafer','₹74 Lakh','20 Jul 2024'],
                      ['ORD-005','NXP Technologies','180nm Automotive','99%','Packaging','₹32 Lakh','22 Jun 2024'],
                      ['ORD-006','Infineon Systems','65nm Mixed Signal','0%','Queued','₹19 Lakh','01 Aug 2024'],
                    ].map(r=>(
                      <tr key={r[0]}>
                        {r.map((c,i)=><td key={i} className={i===3?'font-bold text-blue-600':''}>{c}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
