import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Sparkles, Book, Share2, Globe2, Zap, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const Translation: React.FC = () => {
  const { incrementTranslations } = useAuth();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'loading'>('loading');
  const [translateMode, setTranslateMode] = useState<'replace' | 'annotate'>('replace');
  const [translateSuccess, setTranslateSuccess] = useState(false);


  useEffect(() => {
    checkServerStatus();
  }, []);


  const checkServerStatus = async () => {
    try {
      await axios.get(`${API_URL}/health`);
      setServerStatus('online');
    } catch (error) {
      console.error('Сервер недоступен:', error);
      setServerStatus('offline');
    }
  };


  const handleTranslate = async () => {
    if (!inputText.trim() || serverStatus !== 'online') return;

    setIsLoading(true);
    setTranslateSuccess(false);
    
    try {
      const response = await axios.post(`${API_URL}/translate`, { 
        text: inputText,
        mode: translateMode
      });
      

      if (response.data.translated && response.data.translated !== inputText) {
        setOutputText(response.data.translated);
        setTranslateSuccess(true);
        

        incrementTranslations(inputText, response.data.translated).catch(error => {
          console.error('Ошибка при обновлении статистики переводов:', error);

        });
      } else {
        setOutputText(response.data.translated || 'Перевод не изменил исходный текст.');
      }
    } catch (error) {
      console.error('Ошибка при переводе:', error);
      setOutputText('Произошла ошибка при переводе. Пожалуйста, попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };


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


  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    

    const delayQuery = setTimeout(() => {
      fetchSuggestions(text);
    }, 300);

    return () => clearTimeout(delayQuery);
  };


  const selectSuggestion = (suggestion: string) => {
    setInputText(suggestion);
    setShowSuggestions(false);
  };


  const swapTexts = () => {
    const temp = inputText;
    setInputText(outputText.replace(/\s\([^)]+\)/g, '')); 
    setOutputText(temp);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 pb-28">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        <div className="pb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 mb-6 rounded-full bg-white/20 backdrop-blur">
              <Globe2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
              Slangario
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Сложность в понимании сленга - в прошлом!
            </p>
            
            {}
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

          {}
          <div className="max-w-4xl mx-auto glass-effect rounded-3xl shadow-lg backdrop-blur-sm bg-white/10 p-6 hover-scale">
            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 relative">
                <div className="flex items-center justify-between">
                  <label className="text-lg font-medium text-white">Ваш текст</label>
                  <span className="text-sm text-white/80 bg-white/10 px-3 py-1 rounded-full">
                    {inputText.length}/500
                  </span>
                </div>
                <textarea
                  value={inputText}
                  onChange={handleInputChange}
                  className="w-full h-48 p-4 bg-white/20 backdrop-blur border-0 rounded-2xl focus:ring-2 focus:ring-white/50 focus:border-transparent resize-none text-white placeholder-white/50"
                  placeholder="Введите текст для перевода..."
                  maxLength={500}
                />
                
                {}
                {showSuggestions && (
                  <div className="absolute z-10 mt-1 w-full max-h-64 overflow-y-auto bg-white/20 backdrop-blur-md rounded-xl shadow-lg">
                    <ul className="py-2">
                      {suggestions.map((suggestion, index) => (
                        <li 
                          key={index}
                          className="px-4 py-2 hover:bg-white/30 cursor-pointer text-white"
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
                  <label className="text-lg font-medium text-white">Перевод</label>
                  <button 
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition-all duration-200 text-white"
                    onClick={() => navigator.clipboard.writeText(outputText)}
                  >
                    <Share2 size={16} />
                    <span className="text-sm">Копировать</span>
                  </button>
                </div>
                <div className="w-full h-48 p-4 bg-white/20 backdrop-blur rounded-2xl overflow-auto text-white">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    outputText || 
                    <span className="text-white/50 italic">Здесь появится перевод...</span>
                  )}
                </div>
              </div>
            </div>
            
            {}
            <div className="mt-6 flex justify-center">
              <div className="inline-flex rounded-full bg-white/10 p-1">
                <button
                  onClick={() => setTranslateMode('replace')}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    translateMode === 'replace' 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Только перевод
                </button>
                <button
                  onClick={() => setTranslateMode('annotate')}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    translateMode === 'annotate' 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Слово + перевод
                </button>
              </div>
            </div>

            {}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleTranslate}
                disabled={isLoading || !inputText || serverStatus !== 'online'}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Sparkles className="animate-pulse" size={20} />
                <span className="font-medium">Перевести</span>
              </button>
              <button
                onClick={swapTexts}
                disabled={!outputText || isLoading}
                className="flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur rounded-2xl hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-white"
              >
                <ArrowRightLeft size={20} />
                <span className="font-medium">Поменять местами</span>
              </button>
            </div>
          </div>

          {}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 max-w-4xl mx-auto">
            <div className="glass-effect p-6 rounded-2xl hover-scale backdrop-blur-sm bg-white/10 text-white">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Zap className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Современный словарь</h3>
              <p className="text-white/80">Постоянно обновляемая база молодежного сленга для точного и актуального перевода</p>
            </div>
            
            <div className="glass-effect p-6 rounded-2xl hover-scale backdrop-blur-sm bg-white/10 text-white">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Book className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Богатая база выражений</h3>
              <p className="text-white/80">Обширная коллекция современных сленговых выражений с их толкованием</p>
            </div>
            
            <div className="glass-effect p-6 rounded-2xl hover-scale backdrop-blur-sm bg-white/10 text-white">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <MessageSquare className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Умные подсказки</h3>
              <p className="text-white/80">Интеллектуальная система подсказок поможет понять значение слов в процессе ввода</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Translation; 