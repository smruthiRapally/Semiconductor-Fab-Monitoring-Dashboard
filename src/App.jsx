import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import TopNav from './components/TopNav'
import Dashboard from './pages/Dashboard'
import Production from './pages/Production'
import Machines from './pages/Machines'
import YieldAnalysis from './pages/YieldAnalysis'
import DefectAnalysis from './pages/DefectAnalysis'
import Environment from './pages/Environment'
import Reports from './pages/Reports'
import Materials from './pages/Materials'
import Revenue from './pages/Revenue'
import CustomerOrders from './pages/CustomerOrders'

function App() {
  return (
    <Router>
      <div className="min-h-screen circuit-bg flex flex-col">
        {/* Ambient glow orbs */}
        <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none z-0"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)' }} />
        <div className="fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none z-0"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)' }} />

        <TopNav />

        <main className="flex-1 relative z-10 overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 md:px-6 py-5">
            <Routes>
              <Route path="/"           element={<Dashboard />} />
              <Route path="/production" element={<Production />} />
              <Route path="/machines"   element={<Machines />} />
              <Route path="/yield"      element={<YieldAnalysis />} />
              <Route path="/defects"    element={<DefectAnalysis />} />
              <Route path="/environment" element={<Environment />} />
              <Route path="/reports"    element={<Reports />} />
              <Route path="/materials"  element={<Materials />} />
              <Route path="/revenue"    element={<Revenue />} />
              <Route path="/orders"     element={<CustomerOrders />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  )
}

export default App
