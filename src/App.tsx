import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BottomNavigation from './components/BottomNavigation';
import Translation from './pages/Translation';
import SpeechToText from './pages/SpeechToText';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <div className="min-h-screen gradient-animate bg-gradient-to-br from-violet-400 via-indigo-400 to-purple-500">
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Translation />} />
            <Route path="/speech-to-text" element={<SpeechToText />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
        <BottomNavigation />
      </div>
    </Router>
  );
}

export default App;