import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './components/Layout/Sidebar'
import Header from './components/Layout/Header'
import Dashboard from './pages/Dashboard'
import HypothesisLab from './pages/HypothesisLab'
import ExperimentCenter from './pages/ExperimentCenter'
import SimulationRunner from './pages/SimulationRunner'
import AnalysisInsights from './pages/AnalysisInsights'
import AgentCouncil from './pages/AgentCouncil'
import MemoryVault from './pages/MemoryVault'
import ResearchReports from './pages/ResearchReports'
import SupportBot from './components/UI/SupportBot'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }
}

function AnimatedPage({ children }) {
  return <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">{children}</motion.div>
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Header />
          <main className="page-content">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<AnimatedPage><Dashboard /></AnimatedPage>} />
                <Route path="/hypotheses" element={<AnimatedPage><HypothesisLab /></AnimatedPage>} />
                <Route path="/experiments" element={<AnimatedPage><ExperimentCenter /></AnimatedPage>} />
                <Route path="/simulations" element={<AnimatedPage><SimulationRunner /></AnimatedPage>} />
                <Route path="/analysis" element={<AnimatedPage><AnalysisInsights /></AnimatedPage>} />
                <Route path="/agents" element={<AnimatedPage><AgentCouncil /></AnimatedPage>} />
                <Route path="/memory" element={<AnimatedPage><MemoryVault /></AnimatedPage>} />
                <Route path="/reports" element={<AnimatedPage><ResearchReports /></AnimatedPage>} />
              </Routes>
            </AnimatePresence>
          </main>
        </div>
        <SupportBot />
      </div>
    </BrowserRouter>
  )
}
