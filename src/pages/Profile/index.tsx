import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import slangDictionaryModule from '../../../server/data/slangDictionary';


const { getAllSlangWords } = slangDictionaryModule;


interface ApiKey {
  id: string;
  key: string;
  createdAt: Date;
  expiresAt: Date;
  lastUsed?: Date;
  description: string;
  rateLimit: {
    daily: number;
    monthly: number;
  }
}

const Profile: React.FC = () => {
  const { 
    currentUser, 
    logout, 
    userStats, 
    loadUserStats, 
    isOnline, 
    checkNetworkStatus,

    loadApiKeys,
    generateApiKey,
    deleteApiKey,

    getFavoriteWords
  } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [keyDescription, setKeyDescription] = useState('');
  const [selectedTab, setSelectedTab] = useState('general');
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);
  const [actionMessage, setActionMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const navigate = useNavigate();
  const [favoriteWords, setFavoriteWords] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoriteWordsDetails, setFavoriteWordsDetails] = useState<{word: string, meaning: string}[]>([]);


  useEffect(() => {
    const refreshStats = async () => {
      if (!userStats) {
        setIsRefreshing(true);
        try {
          await loadUserStats();
          setLastSyncTime(new Date());
        } catch (error) {
          console.error('Ошибка при загрузке статистики:', error);
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    refreshStats();
  }, [loadUserStats, userStats]);


  useEffect(() => {
    const interval = setInterval(async () => {
      const online = await checkNetworkStatus().catch(console.error);
      if (online && userStats?.needsSync) {

        refreshStatistics();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [checkNetworkStatus, userStats]);

  const handleLogout = async () => {
    try {
      setError(null);
      setLoading(true);
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      setError('Не удалось выйти из системы');
    } finally {
      setLoading(false);
    }
  };


  const refreshStatistics = async () => {
    setIsRefreshing(true);
    try {
      await loadUserStats();
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Ошибка при обновлении статистики:', error);
    } finally {
      setIsRefreshing(false);
    }
  };


  const openSettings = () => {
    setShowSettings(true);
  };


  const closeSettings = () => {
    setShowSettings(false);
  };


  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Дата недоступна';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };


  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };


  

  const fetchApiKeys = async () => {
    if (!currentUser) return;
    
    setIsLoadingKeys(true);
    try {
      const keys = await loadApiKeys();
      setApiKeys(keys);
    } catch (error) {
      console.error('Ошибка при загрузке API ключей:', error);
      setActionMessage({
        text: 'Не удалось загрузить API ключи',
        type: 'error'
      });

      setTimeout(() => setActionMessage(null), 5000);
    } finally {
      setIsLoadingKeys(false);
    }
  };
  

  const handleGenerateApiKey = async () => {
    if (!currentUser) return;
    if (!keyDescription.trim()) {
      setActionMessage({
        text: 'Пожалуйста, добавьте описание для ключа',
        type: 'error'
      });
      return;
    }
    
    setIsGeneratingKey(true);
    
    try {
      const newKey = await generateApiKey(keyDescription);
      
      if (newKey) {
        setApiKeys(prev => [...prev, newKey]);
        setKeyDescription('');
        setActionMessage({
          text: 'API ключ успешно создан',
          type: 'success'
        });
      } else {
        throw new Error('Не удалось создать API ключ');
      }
      

      setTimeout(() => setActionMessage(null), 5000);
    } catch (error: any) {
      console.error('Ошибка при генерации API ключа:', error);
      setActionMessage({
        text: error.message || 'Не удалось создать API ключ',
        type: 'error'
      });

      setTimeout(() => setActionMessage(null), 5000);
    } finally {
      setIsGeneratingKey(false);
    }
  };
  

  const handleDeleteApiKey = async (keyId: string) => {
    if (!currentUser || !window.confirm('Вы уверены, что хотите удалить этот API ключ? Это действие нельзя отменить.')) return;
    
    try {
      const success = await deleteApiKey(keyId);
      
      if (success) {
        setApiKeys(prev => prev.filter(key => key.id !== keyId));
        setActionMessage({
          text: 'API ключ успешно удален',
          type: 'success'
        });
      } else {
        throw new Error('Не удалось удалить API ключ');
      }
      

      setTimeout(() => setActionMessage(null), 5000);
    } catch (error: any) {
      console.error('Ошибка при удалении API ключа:', error);
      setActionMessage({
        text: error.message || 'Не удалось удалить API ключ',
        type: 'error'
      });

      setTimeout(() => setActionMessage(null), 5000);
    }
  };
  

  const formatKeyDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  

  useEffect(() => {
    if (showSettings && selectedTab === 'api') {
      fetchApiKeys();
    }
  }, [showSettings, selectedTab, currentUser]);


  useEffect(() => {
    const loadFavoriteWords = async () => {
      const words = await getFavoriteWords();
      setFavoriteWords(words);
    };
    
    if (currentUser) {
      loadFavoriteWords();
    }
  }, [currentUser, getFavoriteWords, userStats?.favoriteWords]);
  

  useEffect(() => {
    if (showFavorites && favoriteWords.length > 0) {
      const dictionaryData = getAllSlangWords();
      
      if (dictionaryData) {
        const details = favoriteWords.map(word => ({
          word,
          meaning: dictionaryData[word] || 'Значение не найдено'
        }));
        
        setFavoriteWordsDetails(details);
      }
    }
  }, [showFavorites, favoriteWords]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-16">
      {}
      <div className="relative">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-6 sm:px-12 lg:px-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
              <path fill="#fff" fillOpacity="1" d="M0,192L48,176C96,160,192,128,288,122.7C384,117,480,139,576,144C672,149,768,139,864,128C960,117,1056,107,1152,128C1248,149,1344,203,1392,229.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 200" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path fill="#f8fafc" fillOpacity="1" d="M0,160L48,149.3C96,139,192,117,288,122.7C384,128,480,160,576,165.3C672,171,768,149,864,122.7C960,96,1056,64,1152,69.3C1248,75,1344,117,1392,138.7L1440,160L1440,200L1392,200C1344,200,1248,200,1152,200C1056,200,960,200,864,200C768,200,672,200,576,200C480,200,384,200,288,200C192,200,96,200,48,200L0,200Z"></path>
            </svg>
          </div>
          <div className="flex items-center justify-between relative">
            <div>
              <h1 className="text-4xl font-bold mb-2">Профиль пользователя</h1>
              <p className="text-blue-100 text-lg max-w-xl">Управление вашим аккаунтом и персональными настройками</p>
            </div>
            <div className="flex flex-col items-end space-y-2">
              {}
              <div className={`flex items-center px-3 py-2 rounded-full ${
                isOnline ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'
              }`}>
                <span className={`w-3 h-3 rounded-full mr-2 ${
                  isOnline ? 'bg-green-400' : 'bg-red-400'
                }`}></span>
                <span className="text-sm font-medium">
                  {isOnline ? 'Онлайн' : 'Офлайн'}
                </span>
              </div>
              
              {}
              {userStats?.needsSync && (
                <div className="flex items-center px-3 py-2 rounded-full bg-amber-500/20 text-amber-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-sm font-medium">
                    Ожидает синхронизации
                  </span>
                </div>
              )}
              
              {}
              {lastSyncTime && !userStats?.needsSync && (
                <div className="text-xs text-blue-200">
                  Синхронизировано: {lastSyncTime.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {}
      {error && (
        <div className="mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
          <div className="max-w-4xl mx-auto bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-md" role="alert">
            <div className="flex">
              <div className="py-1">
                <svg className="h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {}
      {!isOnline && (
        <div className="mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
          <div className="max-w-4xl mx-auto bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-6 rounded-lg shadow-md" role="alert">
            <div className="flex">
              <div className="py-1">
                <svg className="h-6 w-6 text-amber-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Вы находитесь в автономном режиме</p>
                <p className="text-sm">Статистика сохраняется локально и будет автоматически синхронизирована при восстановлении соединения.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {}
      {isOnline && userStats?.needsSync && (
        <div className="mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
          <div className="max-w-4xl mx-auto bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded-lg shadow-md" role="alert">
            <div className="flex">
              <div className="py-1">
                <svg className="h-6 w-6 text-blue-500 mr-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Синхронизация данных</p>
                <p className="text-sm">Локальные изменения ожидают синхронизации с сервером. Нажмите "Обновить" для немедленной синхронизации.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-10 relative">
                {}
                <button 
                  onClick={openSettings}
                  className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors duration-200"
                  title="Настройки профиля"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>

                <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-full bg-white p-2 shadow-lg">
                    <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-200 to-blue-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <h2 className="text-xl font-semibold text-white truncate">
                    {currentUser?.email || 'Пользователь'}
                  </h2>
                </div>
              </div>
              
              <div className="px-6 py-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Данные аккаунта</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{currentUser?.email || 'Нет данных'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Дата регистрации</p>
                        <p className="font-medium">{formatDate(currentUser?.metadata.creationTime)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {}
          <div className="md:col-span-2">
            {}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <h3 className="text-lg font-semibold text-gray-700">Статистика использования</h3>
                  <div className="flex items-center gap-2">
                    {userStats?.needsSync && (
                      <span className="text-amber-500 text-sm flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Ожидает синхронизации
                      </span>
                    )}
                    {!isOnline && (
                      <span className="text-amber-500 text-sm flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Локальные данные
                      </span>
                    )}
                    <button 
                      onClick={refreshStatistics}
                      className={`text-sm flex items-center transition-colors ${
                        isRefreshing || !isOnline 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-blue-600 hover:text-blue-800'
                      }`}
                      disabled={isRefreshing || !isOnline}
                    >
                      {isRefreshing ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Обновление...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${!isOnline ? 'text-gray-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          {userStats?.needsSync ? "Синхронизировать" : "Обновить"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600">Распознаваний</p>
                        <p className="text-2xl font-bold text-blue-800">{formatNumber(userStats?.recognitions)}</p>
                        <p className="text-xs text-blue-500 mt-1">
                          {userStats?.recognitions && userStats.recognitions > 0 
                            ? `Примерно ${Math.round(userStats.recognitions * 5)} слов распознано` 
                            : 'Нет данных о распознавании'
                          }
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="h-1 w-full bg-blue-200 rounded-full">
                        <div 
                          className="h-1 bg-blue-600 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, (userStats?.recognitions || 0) / 10)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-blue-500 mt-1 text-right">
                        {userStats?.recognitions 
                          ? `${Math.min(100, Math.round((userStats.recognitions / 10) * 100))}% к первой цели` 
                          : '0% к первой цели'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600">Переводов</p>
                        <p className="text-2xl font-bold text-purple-800">{formatNumber(userStats?.translations)}</p>
                        <p className="text-xs text-purple-500 mt-1">
                          {userStats?.translations && userStats.translations > 0 
                            ? `Примерно ${Math.round(userStats.translations * 3)} слов переведено` 
                            : 'Нет данных о переводах'
                          }
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="h-1 w-full bg-purple-200 rounded-full">
                        <div 
                          className="h-1 bg-purple-600 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, (userStats?.translations || 0) / 10)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-purple-500 mt-1 text-right">
                        {userStats?.translations 
                          ? `${Math.min(100, Math.round((userStats.translations / 10) * 100))}% к первой цели` 
                          : '0% к первой цели'
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <p>Общая активность: {formatNumber((userStats?.recognitions || 0) + (userStats?.translations || 0))} действий</p>
                    </div>
                    <div className="text-sm text-white/80">
                      {userStats?.recentActivity && userStats.recentActivity.length > 0 && 
                        `Последняя активность: ${new Date(userStats.recentActivity[0].timestamp).toLocaleString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}`
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">История активности</h3>
                
                {userStats?.recentActivity && userStats.recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {userStats.recentActivity.map((activity, index) => (
                      <div key={index} className={`p-4 rounded-lg ${
                        activity.type === 'recognition' 
                          ? 'bg-blue-50' 
                          : 'bg-purple-50'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            activity.type === 'recognition' 
                              ? 'bg-blue-100' 
                              : 'bg-purple-100'
                          }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${
                              activity.type === 'recognition' 
                                ? 'text-blue-600' 
                                : 'text-purple-600'
                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              {activity.type === 'recognition' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                              )}
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-800">
                                {activity.type === 'recognition' ? 'Распознавание речи' : 'Перевод сленга'}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {new Date(activity.timestamp).toLocaleString('ru-RU', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            
                            <div className="mt-2 overflow-hidden">
                              <div className="bg-white/70 p-2 rounded border border-gray-200 mb-2">
                                <p className="text-sm text-gray-700 line-clamp-2">
                                  <span className="text-xs font-medium text-gray-500 mr-1">Исходный текст:</span>
                                  {activity.text}
                                </p>
                              </div>
                              
                              {activity.result && (
                                <div className="bg-white/70 p-2 rounded border border-gray-200">
                                  <p className="text-sm text-gray-700 line-clamp-2">
                                    <span className="text-xs font-medium text-gray-500 mr-1">Результат:</span>
                                    {activity.result}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-6 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-600">История действий будет доступна после использования приложения</p>
                  </div>
                )}
              </div>
            </div>
            
            {}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/speech')}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-medium py-4 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-md transition-all duration-200 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Перейти к распознаванию сленга
              </button>
              
              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full bg-white hover:bg-gray-50 text-red-600 font-medium py-4 px-4 rounded-xl border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-300 shadow-sm transition-all duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Выход...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Выйти из аккаунта
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mt-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Ваша статистика</h2>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-700 mb-2">
              {formatNumber(userStats?.recognitions)}
            </div>
            <div className="text-blue-600">Распознаваний речи</div>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-indigo-700 mb-2">
              {formatNumber(userStats?.translations)}
            </div>
            <div className="text-indigo-600">Переводов текста</div>
          </div>
          
          <div 
            className="bg-purple-50 p-4 rounded-lg text-center cursor-pointer hover:bg-purple-100 transition-colors"
            onClick={() => navigate('/favorite-words')}
          >
            <div className="text-3xl font-bold text-purple-700 mb-2">
              {formatNumber(userStats?.favoriteWords?.length || 0)}
            </div>
            <div className="text-purple-600 flex items-center justify-center">
              Избранных слов
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="currentColor" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor" 
                className="w-5 h-5 ml-1"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" 
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {}
      {showFavorites && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mt-8">
          <div className="bg-gradient-to-r from-purple-600 to-pink-700 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Избранные слова</h2>
            <button 
              onClick={() => setShowFavorites(false)}
              className="text-white hover:text-pink-200 transition-colors"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor" 
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6">
            {favoriteWordsDetails.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {favoriteWordsDetails.map((item, index) => (
                  <div key={index} className="py-4 first:pt-0 last:pb-0">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{item.word}</h3>
                    <p className="text-gray-700">{item.meaning}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {favoriteWords.length > 0 ? 
                  'Загрузка избранных слов...' : 
                  'У вас пока нет избранных слов. Добавьте слова в избранное на странице словаря.'
                }
              </div>
            )}
            
            <div className="mt-6">
              <button
                onClick={() => navigate('/dictionary')}
                className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-700 text-white rounded-md hover:from-purple-700 hover:to-pink-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Перейти к словарю
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">Настройки профиля</h3>
              <button onClick={closeSettings} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {}
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setSelectedTab('general')}
                  className={`px-4 py-3 text-sm font-medium ${
                    selectedTab === 'general'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Общие настройки
                </button>
                <button
                  onClick={() => setSelectedTab('api')}
                  className={`px-4 py-3 text-sm font-medium ${
                    selectedTab === 'api'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  API ключи для разработчиков
                </button>
                <button
                  onClick={() => setSelectedTab('security')}
                  className={`px-4 py-3 text-sm font-medium ${
                    selectedTab === 'security'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Безопасность
                </button>
              </nav>
            </div>
            
            {}
            <div className="p-5">
              {}
              {actionMessage && (
                <div className={`mb-4 p-3 rounded-lg ${
                  actionMessage?.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {actionMessage?.type === 'success' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {actionMessage?.type === 'error' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {actionMessage?.text}
                </div>
              )}
              
              {}
              {selectedTab === 'general' && (
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Общие настройки профиля</h4>
                  <p className="text-gray-600 mb-4">Здесь будут общие настройки профиля.</p>
                </div>
              )}
              
              {}
              {selectedTab === 'api' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-700">API ключи для разработчиков</h4>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <div className="mr-3 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="font-medium text-blue-800 mb-1">Информация о API ключах</h5>
                        <p className="text-sm text-blue-600 mb-2">
                          API ключи позволяют вашим приложениям взаимодействовать с нашими сервисами.
                          Храните их в безопасности и не передавайте третьим лицам.
                        </p>
                        <ul className="text-xs text-blue-700 list-disc list-inside">
                          <li>Ключи действительны в течение 90 дней с момента создания</li>
                          <li>Лимит запросов: 100 запросов в день, 3000 в месяц</li>
                          <li>Каждый пользователь может создать до 5 ключей</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h5 className="font-medium text-gray-700 mb-2">Документация по API</h5>
                    <p className="text-sm text-gray-600 mb-3">
                      Используйте API ключ в HTTP-заголовке <code className="bg-gray-200 px-1 py-0.5 rounded">Authorization</code> 
                      для доступа к нашему API:
                    </p>
                    <div className="bg-gray-800 text-gray-100 p-3 rounded-md font-mono text-sm overflow-x-auto mb-3">
                      <pre>Authorization: Bearer YOUR_API_KEY</pre>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Базовый URL API:</p>
                    <div className="bg-gray-800 text-gray-100 p-3 rounded-md font-mono text-sm overflow-x-auto mb-3">
                      <pre>https://api.slangapp.ru/v1</pre>
                    </div>
                    <p className="text-sm text-gray-600">
                      <a 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); window.open('/api-docs', '_blank'); }} 
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Полная документация по API →
                      </a>
                    </p>
                  </div>
                  
                  {}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h5 className="font-medium text-gray-700 mb-3">Создать новый API ключ</h5>
                    <div className="flex flex-col md:flex-row gap-3">
                      <input
                        type="text"
                        id="key-description-input"
                        value={keyDescription}
                        onChange={(e) => setKeyDescription(e.target.value)}
                        placeholder="Описание ключа (например: Тестовое приложение)"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={handleGenerateApiKey}
                        disabled={isGeneratingKey || !isOnline}
                        className={`px-4 py-2 rounded-md font-medium text-white ${
                          isGeneratingKey || !isOnline
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        } transition-colors whitespace-nowrap`}
                      >
                        {isGeneratingKey ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Генерация...
                          </>
                        ) : (
                          'Создать ключ'
                        )}
                      </button>
                    </div>
                    {!isOnline && (
                      <p className="text-xs text-amber-600 mt-2">
                        Создание API ключей доступно только онлайн
                      </p>
                    )}
                  </div>
                  
                  {}
                  <h5 className="font-medium text-gray-700 mb-3">Ваши API ключи</h5>
                  {isLoadingKeys ? (
                    <div className="bg-gray-50 p-10 rounded-lg text-center">
                      <svg className="animate-spin h-10 w-10 mx-auto text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-gray-600">Загрузка API ключей...</p>
                    </div>
                  ) : apiKeys.length > 0 ? (
                    <div className="space-y-4">
                      {apiKeys.map(key => (
                        <div key={key.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                              </svg>
                              <span className="font-medium text-gray-700">{key.description}</span>
                            </div>
                            <button 
                              onClick={() => handleDeleteApiKey(key.id)}
                              className="text-red-600 hover:text-red-800 transition-colors text-sm"
                            >
                              Удалить
                            </button>
                          </div>
                          <div className="p-4">
                            <div className="bg-gray-100 p-3 rounded-md font-mono text-sm mb-4 overflow-x-auto relative group">
                              {key.key}
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(key.key);
                                  setActionMessage({
                                    text: 'API ключ скопирован в буфер обмена',
                                    type: 'success'
                                  });
                                  setTimeout(() => setActionMessage(null), 3000);
                                }}
                                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 bg-gray-800 bg-opacity-80 text-white p-1 rounded transition-opacity"
                                title="Копировать ключ"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600 mb-1">Создан:</p>
                                <p className="text-gray-800">{formatKeyDate(key.createdAt)}</p>
                              </div>
                              <div>
                                <p className="text-gray-600 mb-1">Истекает:</p>
                                <p className="text-gray-800">{formatKeyDate(key.expiresAt)}</p>
                              </div>
                              {key.lastUsed && (
                                <div>
                                  <p className="text-gray-600 mb-1">Последнее использование:</p>
                                  <p className="text-gray-800">{formatKeyDate(key.lastUsed)}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-gray-600 mb-1">Лимиты запросов:</p>
                                <p className="text-gray-800">{key.rateLimit.daily} в день / {key.rateLimit.monthly} в месяц</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      <p className="text-gray-600 mb-4">У вас пока нет API ключей</p>
                      <button
                        onClick={() => document.getElementById('key-description-input')?.focus()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Создать первый ключ
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {}
              {selectedTab === 'security' && (
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Настройки безопасности</h4>
                  <p className="text-gray-600 mb-4">Здесь будут настройки безопасности аккаунта.</p>
                </div>
              )}
            </div>
            
            <div className="p-5 border-t border-gray-200 flex justify-end">
              <button 
                onClick={closeSettings}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors duration-200"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile; 