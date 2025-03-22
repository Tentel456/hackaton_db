import React from 'react';
import { NavLink } from 'react-router-dom';
import { Mic, User, Globe2 } from 'lucide-react';

const BottomNavigation: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg">
      <div className="flex justify-around items-center p-3">
        <NavLink 
          to="/" 
          className={({ isActive }) => `
            flex flex-col items-center gap-1 px-6 py-2 rounded-xl
            ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-indigo-500'}
          `}
          end
        >
          <Globe2 size={24} />
          <span className="text-xs font-medium">Перевод</span>
        </NavLink>
        
        <NavLink 
          to="/speech-to-text" 
          className={({ isActive }) => `
            flex flex-col items-center gap-1 px-6 py-2 rounded-xl
            ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-indigo-500'}
          `}
        >
          <Mic size={24} />
          <span className="text-xs font-medium">Распознать</span>
        </NavLink>
        
        <NavLink 
          to="/profile" 
          className={({ isActive }) => `
            flex flex-col items-center gap-1 px-6 py-2 rounded-xl
            ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-indigo-500'}
          `}
        >
          <User size={24} />
          <span className="text-xs font-medium">Профиль</span>
        </NavLink>
      </div>
    </div>
  );
};

export default BottomNavigation; 