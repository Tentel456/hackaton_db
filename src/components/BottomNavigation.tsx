import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GamepadIcon, FileText } from 'lucide-react';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useAuth();


  if (!currentUser) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-lg z-50 border-t border-gray-200">
      <div className="flex justify-around items-center h-16 max-w-4xl mx-auto">
        <Link 
          to="/speech" 
          className={`flex flex-col items-center px-3 py-2 transition-colors duration-200 ${
            location.pathname === '/speech' 
              ? 'text-gradient-primary font-medium' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <span className="text-xs">Распознавание</span>
        </Link>
        
        <Link 
          to="/translate" 
          className={`flex flex-col items-center px-3 py-2 transition-colors duration-200 ${
            location.pathname === '/translate' 
              ? 'text-gradient-primary font-medium' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          <span className="text-xs">Перевод</span>
        </Link>
        
        <Link 
          to="/dictionary" 
          className={`flex flex-col items-center px-3 py-2 transition-colors duration-200 ${
            location.pathname === '/dictionary' 
              ? 'text-gradient-primary font-medium' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-xs">Словарь</span>
        </Link>
        
        <Link 
          to="/text" 
          className={`flex flex-col items-center px-3 py-2 transition-colors duration-200 ${
            location.pathname === '/text' 
              ? 'text-gradient-primary font-medium' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-xs">Текст</span>
        </Link>
        
        <Link 
          to="/games" 
          className={`flex flex-col items-center px-3 py-2 transition-colors duration-200 ${
            location.pathname.startsWith('/games') 
              ? 'text-gradient-primary font-medium' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs">Мини-игры</span>
        </Link>
        
        <Link 
          to="/profile" 
          className={`flex flex-col items-center px-3 py-2 transition-colors duration-200 ${
            location.pathname === '/profile' 
              ? 'text-gradient-primary font-medium' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs">Профиль</span>
        </Link>
        
        <Link 
          to="/" 
          className={`flex flex-col items-center px-3 py-2 transition-colors duration-200 ${
            location.pathname === '/' 
              ? 'text-gradient-primary font-medium' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs">Главная</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNavigation; 