import React, { useState } from 'react';
import { User, Heart, Clock, Settings, Moon, HelpCircle, LogOut } from 'lucide-react';

const Profile: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  
  // Демо-данные пользователя
  const user = {
    name: 'Александр',
    email: 'user@example.com',
    favorites: 12,
    history: 35
  };

  return (
    <div className="pb-20">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-2 mb-6 rounded-full bg-white/20 backdrop-blur">
          <User className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
          Профиль
        </h1>
        <p className="text-lg text-white/90 max-w-2xl mx-auto">
          Управляйте вашими настройками и просматривайте историю переводов
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {/* User Profile Card */}
        <div className="glass-effect rounded-3xl shadow-2xl p-6 hover-scale mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
              {user.name.charAt(0)}
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Heart className="text-indigo-500" size={20} />
                  <span className="text-gray-700">{user.favorites} избранных</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="text-indigo-500" size={20} />
                  <span className="text-gray-700">{user.history} в истории</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* User Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Settings */}
          <div className="glass-effect rounded-3xl shadow-lg p-6 hover-scale">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Settings size={20} className="text-indigo-500" />
              Настройки
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <Moon size={18} className="text-indigo-600" />
                  <span className="text-gray-700">Темная тема</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <Settings size={18} className="text-indigo-600" />
                  <span className="text-gray-700">Уведомления</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>
          
          {/* Support */}
          <div className="glass-effect rounded-3xl shadow-lg p-6 hover-scale">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <HelpCircle size={20} className="text-indigo-500" />
              Поддержка
            </h3>
            
            <div className="space-y-4">
              <button className="w-full text-left flex items-center justify-between p-3 bg-white/30 rounded-xl hover:bg-white/50 transition-all">
                <div className="flex items-center gap-2">
                  <HelpCircle size={18} className="text-indigo-600" />
                  <span className="text-gray-700">Помощь</span>
                </div>
                <span className="text-gray-400">›</span>
              </button>
              
              <button className="w-full text-left flex items-center justify-between p-3 bg-white/30 rounded-xl hover:bg-white/50 transition-all">
                <div className="flex items-center gap-2">
                  <Settings size={18} className="text-indigo-600" />
                  <span className="text-gray-700">Предложить слово</span>
                </div>
                <span className="text-gray-400">›</span>
              </button>
              
              <button className="w-full text-left flex items-center justify-between p-3 bg-white/30 rounded-xl hover:bg-white/50 transition-all">
                <div className="flex items-center gap-2">
                  <LogOut size={18} className="text-red-600" />
                  <span className="text-red-600">Выйти</span>
                </div>
                <span className="text-gray-400">›</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Recent Activity (Future Feature) */}
        <div className="glass-effect rounded-3xl shadow-lg p-6 mt-6 hover-scale">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={20} className="text-indigo-500" />
            Недавняя активность
          </h3>
          
          <div className="text-center p-8 text-gray-500">
            <p>История переводов будет доступна в следующем обновлении</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 