import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import PeakIntelligence from './pages/PeakIntelligence';
import ConsumptionBehaviour from './pages/ConsumptionBehaviour';
import Forecasting from './pages/Forecasting';
import DataProcessing from './pages/DataProcessing';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <Sidebar />
        <main className="content">
          <Header />
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/peak" element={<PeakIntelligence />} />
            <Route path="/behaviour" element={<ConsumptionBehaviour />} />
            <Route path="/forecast" element={<Forecasting />} />
            <Route path="/processing" element={<DataProcessing />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
