import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

import slangDictionaryModule from '../../../server/data/slangDictionary';


const { getAllSlangWords } = slangDictionaryModule;


interface SlangWord {
  id: string;
  word: string;
  meaning: string;
  example?: string;
  category?: string;
}

const Dictionary: React.FC = () => {
  const [slangWords, setSlangWords] = useState<SlangWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLetters, setActiveLetters] = useState<string[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const { isOnline, addFavoriteWord, removeFavoriteWord, isFavoriteWord, userStats } = useAuth();
  

  const [favoriteWords, setFavoriteWords] = useState<string[]>([]);

  const [animatedHeartWord, setAnimatedHeartWord] = useState<string | null>(null);
  

  const alphabet = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('');
  

  useEffect(() => {
    if (userStats?.favoriteWords) {
      setFavoriteWords(userStats.favoriteWords);
    }
  }, [userStats?.favoriteWords]);
  
  useEffect(() => {
    const fetchSlangWords = async () => {
      setLoading(true);
      try {

        const dictionaryData = getAllSlangWords();
        
        if (!dictionaryData || Object.keys(dictionaryData).length === 0) {
          setSlangWords([]);
          setActiveLetters([]);
          setError('Словарь пуст или не удалось загрузить данные.');
        } else {
          const formattedWords: SlangWord[] = [];
          const letters = new Set<string>();
          

          Object.entries(dictionaryData).forEach(([word, meaning]) => {
            const slangWord: SlangWord = {
              id: word.toLowerCase().replace(/[^а-яёa-z0-9]/gi, ''),
              word: word,
              meaning: meaning as string,

              example: undefined,
              category: undefined
            };
            
            formattedWords.push(slangWord);
            

            if (word && word.length > 0) {
              const firstLetter = word.charAt(0).toUpperCase();
              letters.add(firstLetter);
            }
          });
          

          formattedWords.sort((a, b) => a.word.localeCompare(b.word, 'ru'));
          
          setSlangWords(formattedWords);
          setActiveLetters(Array.from(letters).sort((a, b) => a.localeCompare(b, 'ru')));
          

          if (letters.size > 0) {
            setSelectedLetter(Array.from(letters).sort((a, b) => a.localeCompare(b, 'ru'))[0]);
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке словаря:', error);
        setError('Не удалось загрузить словарь. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSlangWords();
  }, []);
  

  const handleFavoriteClick = async (word: string) => {
    if (isFavoriteWord(word)) {
      const success = await removeFavoriteWord(word);
      if (success) {
        setFavoriteWords(prev => prev.filter(w => w !== word));

        setAnimatedHeartWord(word);
        setTimeout(() => setAnimatedHeartWord(null), 1000);
      }
    } else {
      const success = await addFavoriteWord(word);
      if (success) {
        setFavoriteWords(prev => [...prev, word]);

        setAnimatedHeartWord(word);
        setTimeout(() => setAnimatedHeartWord(null), 1000);
      }
    }
  };
  

  const filteredWords = selectedLetter 
    ? slangWords.filter(word => word.word.toUpperCase().startsWith(selectedLetter))
    : slangWords;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20">
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
          <div className="relative">
            <h1 className="text-4xl font-bold mb-2">Словарь сленга</h1>
            <p className="text-blue-100 text-lg max-w-xl">
              Изучайте современный молодежный сленг в алфавитном порядке
            </p>
          </div>
        </div>
      </div>
      
      {}
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 overflow-x-auto">
          <div className="flex flex-wrap justify-center gap-2">
            {alphabet.map((letter) => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                disabled={!activeLetters.includes(letter)}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                  ${selectedLetter === letter ? 'bg-blue-600 text-white' : ''}
                  ${activeLetters.includes(letter) 
                    ? 'hover:bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                `}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
        
        {}
        <div className="bg-white rounded-xl shadow-md p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">{error}</div>
              {!isOnline && (
                <p className="text-gray-600">
                  Подключитесь к интернету, чтобы получить доступ к словарю сленга.
                </p>
              )}
            </div>
          ) : filteredWords.length > 0 ? (
            <div className="space-y-6">
              {selectedLetter && (
                <div className="pb-2 mb-4 border-b border-gray-200">
                  <h2 className="text-3xl font-bold text-blue-800">{selectedLetter}</h2>
                </div>
              )}
              
              {filteredWords.map((word) => (
                <div key={word.id} className="border-b border-gray-100 pb-4 mb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{word.word}</h3>
                    <button 
                      onClick={() => handleFavoriteClick(word.word)}
                      className={`group relative p-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400`}
                      aria-label={isFavoriteWord(word.word) ? "Удалить из избранного" : "Добавить в избранное"}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill={isFavoriteWord(word.word) ? "currentColor" : "none"} 
                        viewBox="0 0 24 24" 
                        strokeWidth={1.5} 
                        stroke="currentColor" 
                        className={`
                          w-6 h-6 transition-all duration-300
                          ${isFavoriteWord(word.word) 
                            ? 'text-red-500 transform hover:scale-110' 
                            : 'text-gray-400 hover:text-red-400 transform hover:scale-110'}
                          ${animatedHeartWord === word.word ? 'animate-pulse' : ''}
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
                  <p className="text-gray-700 mb-2">{word.meaning}</p>
                  {word.example && (
                    <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400 text-gray-700 text-sm">
                      <span className="font-medium text-blue-700">Пример: </span>
                      {word.example}
                    </div>
                  )}
                  {word.category && (
                    <div className="mt-2">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {word.category}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">
                {selectedLetter 
                  ? `Нет сленговых слов, начинающихся на букву "${selectedLetter}"` 
                  : 'Словарь пуст'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dictionary; 