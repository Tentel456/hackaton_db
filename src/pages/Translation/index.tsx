import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Sparkles, Book, Share2, Globe2, Zap, MessageSquare } from 'lucide-react';
import axios from 'axios';

// Базовый URL API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const Translation: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'loading'>('loading');
  const [translateMode, setTranslateMode] = useState<'replace' | 'annotate'>('replace');

  // Проверка статуса сервера при загрузке
  useEffect(() => {
    checkServerStatus();
  }, []);

  // Проверка статуса сервера
  const checkServerStatus = async () => {
    try {
      await axios.get(`${API_URL}/health`);
      setServerStatus('online');
    } catch (error) {
      console.error('Сервер недоступен:', error);
      setServerStatus('offline');
    }
  };

  // Обработка перевода текста
  const handleTranslate = async () => {
    if (!inputText.trim() || serverStatus !== 'online') return;

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/translate`, { 
        text: inputText,
        mode: translateMode
      });
      setOutputText(response.data.translated);
    } catch (error) {
      console.error('Ошибка при переводе:', error);
      setOutputText('Произошла ошибка при переводе. Пожалуйста, попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  // Поиск подсказок при вводе
  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 2 || serverStatus !== 'online') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/suggestions?query=${encodeURIComponent(query)}`);
      setSuggestions(response.data.suggestions);
      setShowSuggestions(response.data.suggestions.length > 0);
    } catch (error) {
      console.error('Ошибка при получении подсказок:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Обработка изменения ввода с задержкой для запроса подсказок
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    
    // Задержка для запроса подсказок
    const delayQuery = setTimeout(() => {
      fetchSuggestions(text);
    }, 300);

    return () => clearTimeout(delayQuery);
  };

  // Функция для выбора подсказки
  const selectSuggestion = (suggestion: string) => {
    setInputText(suggestion);
    setShowSuggestions(false);
  };

  // Функция для обмена текстами
  const swapTexts = () => {
    const temp = inputText;
    setInputText(outputText.replace(/\s\([^)]+\)/g, '')); // Удаляем пояснения в скобках
    setOutputText(temp);
  };

  return (
    <div className="pb-20">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-2 mb-6 rounded-full bg-white/20 backdrop-blur">
          <Globe2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
          Slangario
        </h1>
        <p className="text-lg text-white/90 max-w-2xl mx-auto">
          Сложность в понимании сленга - в прошлом!
        </p>
        
        {/* Индикатор статуса сервера */}
        <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full ${
          serverStatus === 'online' 
            ? 'bg-green-500/20 text-green-100' 
            : serverStatus === 'offline' 
              ? 'bg-red-500/20 text-red-100' 
              : 'bg-yellow-500/20 text-yellow-100'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            serverStatus === 'online' 
              ? 'bg-green-400' 
              : serverStatus === 'offline' 
                ? 'bg-red-400' 
                : 'bg-yellow-400'
          }`}></span>
          <span className="text-sm font-medium">
            {serverStatus === 'online' 
              ? 'Сервер онлайн' 
              : serverStatus === 'offline' 
                ? 'Сервер недоступен' 
                : 'Проверка статуса...'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto glass-effect rounded-3xl shadow-2xl p-6 hover-scale">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 relative">
            <div className="flex items-center justify-between">
              <label className="text-lg font-medium text-gray-800">Ваш текст</label>
              <span className="text-sm text-gray-600 bg-white/50 px-3 py-1 rounded-full">
                {inputText.length}/500
              </span>
            </div>
            <textarea
              value={inputText}
              onChange={handleInputChange}
              className="w-full h-48 p-4 bg-white/50 backdrop-blur border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-800 placeholder-gray-500"
              placeholder="Введите текст для перевода..."
              maxLength={500}
            />
            
            {/* Панель с подсказками */}
            {showSuggestions && (
              <div className="absolute z-10 mt-1 w-full max-h-64 overflow-y-auto bg-white rounded-xl shadow-lg">
                <ul className="py-2">
                  {suggestions.map((suggestion, index) => (
                    <li 
                      key={index}
                      className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-gray-800"
                      onClick={() => selectSuggestion(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-lg font-medium text-gray-800">Перевод</label>
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-white/30 backdrop-blur rounded-full hover:bg-white/40 transition-all duration-200"
                onClick={() => navigator.clipboard.writeText(outputText)}
              >
                <Share2 size={16} />
                <span className="text-sm">Копировать</span>
              </button>
            </div>
            <div className="w-full h-48 p-4 bg-white/50 backdrop-blur rounded-2xl overflow-auto text-gray-800">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                outputText || 
                <span className="text-gray-500 italic">Здесь появится перевод...</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Режим перевода */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex rounded-full bg-white/10 p-1">
            <button
              onClick={() => setTranslateMode('replace')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                translateMode === 'replace' 
                  ? 'bg-white text-indigo-700' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Только перевод
            </button>
            <button
              onClick={() => setTranslateMode('annotate')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                translateMode === 'annotate' 
                  ? 'bg-white text-indigo-700' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Слово + перевод
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleTranslate}
            disabled={isLoading || !inputText || serverStatus !== 'online'}
            className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Sparkles className="animate-pulse" size={20} />
            <span className="font-medium">Перевести</span>
          </button>
          <button
            onClick={swapTexts}
            disabled={!outputText || isLoading}
            className="flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur rounded-2xl hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ArrowRightLeft size={20} />
            <span className="font-medium">Поменять местами</span>
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 pb-8">
        <div className="glass-effect p-6 rounded-2xl hover-scale">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Zap className="text-white" size={24} />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Современный словарь</h3>
          <p className="text-gray-600">Постоянно обновляемая база молодежного сленга для точного и актуального перевода</p>
        </div>
        
        <div className="glass-effect p-6 rounded-2xl hover-scale">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Book className="text-white" size={24} />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Богатая база выражений</h3>
          <p className="text-gray-600">Обширная коллекция современных сленговых выражений с их толкованием</p>
        </div>
        
        <div className="glass-effect p-6 rounded-2xl hover-scale">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <MessageSquare className="text-white" size={24} />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Умные подсказки</h3>
          <p className="text-gray-600">Интеллектуальная система подсказок поможет понять значение слов в процессе ввода</p>
        </div>
      </div>
    </div>
  );
};

export default Translation; 