import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './components/Login';
import Register from './components/Register';
import SpeechToText from './pages/SpeechToText';
import Translation from './pages/Translation';
import Profile from './pages/Profile';
import GamesPage from './pages/Games';
import Dictionary from './pages/Dictionary';
import FavoriteWords from './pages/FavoriteWords';
import PrivateRoute from './components/PrivateRoute';
import BottomNavigation from './components/BottomNavigation';
import TextPage from './pages/Text';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen pb-16">
          <Routes>
            {}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {}
            <Route element={<PrivateRoute />}>
              <Route path="/speech" element={<SpeechToText />} />
              <Route path="/translate" element={<Translation />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/games" element={<GamesPage />} />
              <Route path="/text" element={<TextPage />} />
              <Route path="/dictionary" element={<Dictionary />} />
              <Route path="/favorite-words" element={<FavoriteWords />} />
            </Route>
          </Routes>
          <BottomNavigation />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;