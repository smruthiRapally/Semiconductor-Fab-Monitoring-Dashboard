import React, { useState } from 'react'
import { FileText, Download, Loader2, CheckCircle } from 'lucide-react'
import { reportData } from '../data/mockData'

export default function ReportGenerator() {
  const [pdfLoading, setPdfLoading] = useState(false)
  const [csvLoading, setCsvLoading] = useState(false)
  const [pdfDone, setPdfDone] = useState(false)
  const [csvDone, setCsvDone] = useState(false)

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  async function generatePDF() {
    setPdfLoading(true)
    setPdfDone(false)
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const W = doc.internal.pageSize.getWidth()
      let y = 0

      // ── Header Banner ──
      doc.setFillColor(37, 99, 235)
      doc.rect(0, 0, W, 40, 'F')

      doc.setFillColor(30, 64, 175)
      doc.rect(0, 32, W, 8, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      doc.text('FAB PERFORMANCE REPORT', W / 2, 17, { align: 'center' })

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text('Semiconductor Fabrication Monitoring System', W / 2, 26, { align: 'center' })

      doc.setFontSize(8)
      doc.text(`Generated: ${dateStr}  |  ${timeStr}`, W / 2, 37, { align: 'center' })

      y = 50

      // ── Helper: section heading ──
      const sectionHeader = (title) => {
        if (y > 245) { doc.addPage(); y = 20 }
        doc.setFillColor(243, 244, 246)
        doc.setDrawColor(203, 213, 225)
        doc.roundedRect(14, y, W - 28, 9, 2, 2, 'FD')
        doc.setTextColor(30, 64, 175)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text(title, 20, y + 6.2)
        y += 14
      }

      // ── Helper: key-value row ──
      const kvRow = (key, value) => {
        if (y > 270) { doc.addPage(); y = 20 }
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(75, 85, 99)
        doc.text(key, 22, y)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(17, 24, 39)
        doc.text(String(value), 100, y)
        y += 7
      }

      // ── 1. Production Summary ──
      sectionHeader('1.  PRODUCTION SUMMARY')
      kvRow('Wafers Produced', `${reportData.production.wafersProduced.toLocaleString()} units`)
      kvRow('Production Target', `${reportData.production.wafersTarget.toLocaleString()} units`)
      kvRow('Target Achievement', `${reportData.production.efficiency}%`)
      kvRow('Cycle Time', `${reportData.production.cycleTime} hours`)
      kvRow('Daily Throughput', `${reportData.production.throughput.toLocaleString()} wafers/day`)
      kvRow('Wafers On Hold', `${reportData.production.onHold} units`)
      y += 4

      // ── 2. Yield Summary ──
      sectionHeader('2.  YIELD SUMMARY')
      kvRow('Average Yield Rate', `${reportData.yield.average}%`)
      kvRow('Best Yield Recorded', `${reportData.yield.best}%`)
      kvRow('Worst Yield Recorded', `${reportData.yield.worst}%`)
      kvRow('Yield Target', `${reportData.yield.target}%`)
      kvRow('Trend Direction', reportData.yield.trend)
      y += 4

      // ── 3. Defect Summary ──
      sectionHeader('3.  DEFECT SUMMARY')
      kvRow('Total Defects Found', `${reportData.defects.totalDefects} defects`)
      kvRow('Defect Density', `${reportData.defects.defectDensity} /cm²`)
      kvRow('Critical Defects', `${reportData.defects.criticalDefects} defects`)
      kvRow('Inspection Coverage', `${reportData.defects.inspectionCoverage}%`)
      kvRow('Dominant Defect Type', reportData.defects.dominantType)
      y += 4

      // ── 4. Machine Status ──
      sectionHeader('4.  MACHINE STATUS')
      kvRow('Total Machines', `${reportData.machines.totalMachines} units`)
      kvRow('Currently Running', `${reportData.machines.running} machines`)
      kvRow('Idle Machines', `${reportData.machines.idle} machines`)
      kvRow('Under Maintenance', `${reportData.machines.maintenance} machines`)
      kvRow('Average Uptime', `${reportData.machines.avgUptime}%`)
      y += 4

      // ── 5. Environment Status ──
      sectionHeader('5.  ENVIRONMENT STATUS')
      kvRow('Temperature', reportData.environment.temperature)
      kvRow('Humidity Level', reportData.environment.humidity)
      kvRow('Clean Room Class', reportData.environment.cleanRoomClass)
      kvRow('Air Quality Index', reportData.environment.airQuality)
      kvRow('Particle Count', reportData.environment.particleCount)
      kvRow('Vibration Level', reportData.environment.vibration)
      y += 6

      // ── Defect breakdown table ──
      if (y > 220) { doc.addPage(); y = 20 }
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 64, 175)
      doc.text('Defect Breakdown by Type', 14, y)
      y += 4

      autoTable(doc, {
        startY: y,
        head: [['Defect Type', 'Count', 'Severity', 'Location']],
        body: [
          ['Particle Defects', '128', 'High', 'Lithography'],
          ['Pattern Defects', '98', 'Medium', 'Etching'],
          ['Alignment Defects', '56', 'Low', 'Deposition'],
          ['Contamination', '34', 'High', 'Clean Room'],
          ['Gate Oxide Defects', '22', 'Medium', 'Oxidation'],
          ['Metal Shorts', '18', 'High', 'Metallization'],
        ],
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8, textColor: [55, 65, 81] },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { left: 14, right: 14 },
      })

      y = doc.lastAutoTable.finalY + 10

      // ── Footer ──
      const pages = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(156, 163, 175)
        doc.setFont('helvetica', 'normal')
        doc.text('SemiFab Monitoring System — Confidential', 14, 290)
        doc.text(`Page ${i} of ${pages}`, W - 14, 290, { align: 'right' })
        doc.setDrawColor(203, 213, 225)
        doc.line(14, 286, W - 14, 286)
      }

      const filename = `fab-report-${now.toISOString().slice(0, 10)}.pdf`
      doc.save(filename)
      setPdfDone(true)
      setTimeout(() => setPdfDone(false), 3000)
    } catch (err) {
      console.error('PDF generation error:', err)
      alert('Error generating PDF. Please try again.')
    } finally {
      setPdfLoading(false)
    }
  }

  function generateCSV() {
    setCsvLoading(true)
    setCsvDone(false)
    setTimeout(() => {
      const rows = [
        ['FAB PERFORMANCE REPORT'],
        ['Generated', `${dateStr} ${timeStr}`],
        [''],
        ['PRODUCTION SUMMARY'],
        ['Wafers Produced', reportData.production.wafersProduced],
        ['Production Target', reportData.production.wafersTarget],
        ['Target Achievement (%)', reportData.production.efficiency],
        ['Cycle Time (hrs)', reportData.production.cycleTime],
        ['Daily Throughput', reportData.production.throughput],
        ['On Hold', reportData.production.onHold],
        [''],
        ['YIELD SUMMARY'],
        ['Average Yield (%)', reportData.yield.average],
        ['Best Yield (%)', reportData.yield.best],
        ['Worst Yield (%)', reportData.yield.worst],
        ['Yield Target (%)', reportData.yield.target],
        ['Trend', reportData.yield.trend],
        [''],
        ['DEFECT SUMMARY'],
        ['Total Defects', reportData.defects.totalDefects],
        ['Defect Density (/cm2)', reportData.defects.defectDensity],
        ['Critical Defects', reportData.defects.criticalDefects],
        ['Inspection Coverage (%)', reportData.defects.inspectionCoverage],
        ['Dominant Type', reportData.defects.dominantType],
        [''],
        ['MACHINE STATUS'],
        ['Total Machines', reportData.machines.totalMachines],
        ['Running', reportData.machines.running],
        ['Idle', reportData.machines.idle],
        ['Maintenance', reportData.machines.maintenance],
        ['Avg Uptime (%)', reportData.machines.avgUptime],
        [''],
        ['ENVIRONMENT STATUS'],
        ['Temperature', reportData.environment.temperature],
        ['Humidity', reportData.environment.humidity],
        ['Clean Room Class', reportData.environment.cleanRoomClass],
        ['Air Quality', reportData.environment.airQuality],
        ['Particle Count', reportData.environment.particleCount],
        ['Vibration Level', reportData.environment.vibration],
        [''],
        ['DEFECT BREAKDOWN'],
        ['Type', 'Count', 'Severity', 'Location'],
        ['Particle Defects', 128, 'High', 'Lithography'],
        ['Pattern Defects', 98, 'Medium', 'Etching'],
        ['Alignment Defects', 56, 'Low', 'Deposition'],
        ['Contamination', 34, 'High', 'Clean Room'],
        ['Gate Oxide Defects', 22, 'Medium', 'Oxidation'],
        ['Metal Shorts', 18, 'High', 'Metallization'],
      ]

      const csvContent = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fab-report-${now.toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setCsvLoading(false)
      setCsvDone(true)
      setTimeout(() => setCsvDone(false), 3000)
    }, 800)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        onClick={generatePDF}
        disabled={pdfLoading}
        className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed min-w-[180px] justify-center"
      >
        {pdfLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : pdfDone ? (
          <CheckCircle size={16} className="text-green-300" />
        ) : (
          <FileText size={16} />
        )}
        {pdfLoading ? 'Generating…' : pdfDone ? 'Downloaded!' : 'Generate PDF Report'}
      </button>

      <button
        onClick={generateCSV}
        disabled={csvLoading}
        className="btn-secondary disabled:opacity-60 disabled:cursor-not-allowed min-w-[160px] justify-center"
      >
        {csvLoading ? (
          <Loader2 size={16} className="animate-spin text-gray-500" />
        ) : csvDone ? (
          <CheckCircle size={16} className="text-green-500" />
        ) : (
          <Download size={16} />
        )}
        {csvLoading ? 'Exporting…' : csvDone ? 'Exported!' : 'Export CSV'}
      </button>
    </div>
  )
}
