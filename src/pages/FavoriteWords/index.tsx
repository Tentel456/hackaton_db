import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import slangDictionaryModule from '../../../server/data/slangDictionary';


const { getAllSlangWords } = slangDictionaryModule;


interface FavoriteWord {
  word: string;
  meaning: string;
}

const FavoriteWords: React.FC = () => {
  const { getFavoriteWords, userStats, removeFavoriteWord, isFavoriteWord } = useAuth();
  const [loading, setLoading] = useState(true);
  const [favoriteWords, setFavoriteWords] = useState<FavoriteWord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [animatedHeartWord, setAnimatedHeartWord] = useState<string | null>(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadFavoriteWords = async () => {
      setLoading(true);
      try {

        const words = await getFavoriteWords();
        
        if (words.length === 0) {
          setFavoriteWords([]);
          setError('У вас еще нет избранных слов.');
        } else {

          const dictionaryData = getAllSlangWords();
          

          const favoriteWordsWithMeanings: FavoriteWord[] = words.map(word => ({
            word,
            meaning: dictionaryData[word] || 'Значение не найдено'
          }));
          
          setFavoriteWords(favoriteWordsWithMeanings);
        }
      } catch (error) {
        console.error('Ошибка при загрузке избранных слов:', error);
        setError('Не удалось загрузить избранные слова. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    loadFavoriteWords();
  }, [getFavoriteWords, userStats?.favoriteWords]);
  

  const handleRemoveFromFavorites = async (word: string) => {
    try {
      const success = await removeFavoriteWord(word);
      
      if (success) {

        setFavoriteWords(prev => prev.filter(item => item.word !== word));
        

        setAnimatedHeartWord(word);
        setTimeout(() => setAnimatedHeartWord(null), 1000);
      }
    } catch (error) {
      console.error('Ошибка при удалении слова из избранного:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20">
      {}
      <div className="relative">
        <div className="bg-gradient-to-r from-purple-600 to-pink-700 text-white py-16 px-6 sm:px-12 lg:px-16 relative overflow-hidden">
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
          <div className="relative flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Избранные слова</h1>
              <p className="text-pink-100 text-lg max-w-xl">
                Ваша личная коллекция сленговых слов
              </p>
            </div>
            <button
              onClick={() => navigate('/dictionary')}
              className="hidden sm:flex items-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              К словарю
            </button>
          </div>
        </div>
      </div>
      
      {}
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {}
        <div className="mb-6 sm:hidden">
          <button
            onClick={() => navigate('/dictionary')}
            className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-700 text-white rounded-md hover:from-purple-700 hover:to-pink-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            К словарю
          </button>
        </div>
        
        {}
        <div className="bg-white rounded-xl shadow-md p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
            </div>
          ) : error && favoriteWords.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-purple-600 mb-4">{error}</div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-purple-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <p className="text-gray-600 mb-6">
                Добавляйте слова в избранное на странице словаря, чтобы они появились здесь
              </p>
              <button
                onClick={() => navigate('/dictionary')}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-700 text-white rounded-md hover:from-purple-700 hover:to-pink-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Перейти к словарю
              </button>
            </div>
          ) : favoriteWords.length > 0 ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Всего избранных слов: {favoriteWords.length}</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {favoriteWords.map((item, index) => (
                  <div key={index} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{item.word}</h3>
                      <button 
                        onClick={() => handleRemoveFromFavorites(item.word)}
                        className={`group relative p-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400`}
                        aria-label="Удалить из избранного"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="currentColor" 
                          viewBox="0 0 24 24" 
                          strokeWidth={1.5} 
                          stroke="currentColor" 
                          className={`
                            w-6 h-6 transition-all duration-300 text-red-500 transform hover:scale-110
                            ${animatedHeartWord === item.word ? 'animate-pulse' : ''}
                          `}
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" 
                          />
                        </svg>
                      </button>
                    </div>
                    <p className="text-gray-700">{item.meaning}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Не удалось загрузить избранные слова</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoriteWords; 