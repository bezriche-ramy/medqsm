import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import SetupSession from './pages/SetupSession';
import Session from './pages/Session';
import Review from './pages/Review';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/setup-session" element={<SetupSession />} />
            <Route path="/session/:sessionId" element={<Session />} />
            <Route path="/review/:sessionId" element={<Review />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
