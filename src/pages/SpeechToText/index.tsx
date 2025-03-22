import React, { useState, useEffect, useRef } from 'react';
import { Mic, Copy, X, Check, MessageSquare, AlertCircle, Book, Bug } from 'lucide-react';
import axios from 'axios';

// Интерфейс для словаря сленга
interface SlangDictionary {
  [key: string]: string;
}

// Интерфейс для найденного сленгового слова
interface SlangWord {
  word: string;
  explanation: string;
}

const API_URL = 'http://localhost:3001/api';

const SpeechToText: React.FC = () => {
  const [text, setText] = useState('');
  const [tempText, setTempText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [language, setLanguage] = useState('ru-RU');
  const [microphoneStatus, setMicrophoneStatus] = useState<'waiting' | 'granted' | 'denied'>('waiting');
  const [lastEvent, setLastEvent] = useState<string>('');
  const [slangDictionary, setSlangDictionary] = useState<SlangDictionary>({});
  const [slangWords, setSlangWords] = useState<SlangWord[]>([]);
  const [isLoadingDictionary, setIsLoadingDictionary] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [showDebug, setShowDebug] = useState(false);
  
  // Ссылка на объект распознавания речи
  const recognitionRef = useRef<any>(null);
  // Сохраняем предыдущую сессию записи для возможности отмены
  const previousSessionTextRef = useRef<string>('');

  // Проверка статуса сервера и загрузка словаря сленга
  useEffect(() => {
    const checkServerAndLoadDictionary = async () => {
      try {
        setServerStatus('checking');
        setIsLoadingDictionary(true);
        
        // Проверка статуса сервера - пробуем сначала /api/status, затем /api/health если первый не отвечает
        let statusResponse;
        try {
          statusResponse = await axios.get(`${API_URL}/status`);
          console.log('Сервер доступен через эндпоинт /api/status:', statusResponse.data);
        } catch (e) {
          console.log('Эндпоинт /api/status недоступен, пробуем /api/health');
          statusResponse = await axios.get(`${API_URL}/health`);
          console.log('Сервер доступен через эндпоинт /api/health:', statusResponse.data);
        }
        
        // Проверяем статус ответа
        if (statusResponse.data.status === 'online' || statusResponse.data.status === 'ok') {
          setServerStatus('online');
          
          // Загрузка словаря сленга
          try {
            const dictionaryResponse = await axios.get(`${API_URL}/dictionary`);
            const dictionary = dictionaryResponse.data;
            
            console.log('Загружен словарь сленгов', {
              count: Object.keys(dictionary).length,
              firstFew: Object.keys(dictionary).slice(0, 3)
            });
            
            setSlangDictionary(dictionary);
          } catch (dictionaryError) {
            console.error('Ошибка при загрузке словаря:', dictionaryError);
            if (showDebug) {
              alert('Ошибка при загрузке словаря. Проверьте консоль для деталей.');
            }
          }
        } else {
          console.error('Неожиданный статус сервера:', statusResponse.data);
          setServerStatus('offline');
        }
      } catch (error) {
        console.error('Ошибка при проверке сервера:', error);
        setServerStatus('offline');
      } finally {
        setIsLoadingDictionary(false);
      }
    };
    
    checkServerAndLoadDictionary();
  }, []);

  // Проверка поддержки распознавания речи и запрос доступа к микрофону
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setErrorMessage('Ваш браузер не поддерживает функцию распознавания речи');
      return;
    }

    // Запросим разрешение на использование микрофона
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        console.log('Доступ к микрофону предоставлен');
        setMicrophoneStatus('granted');
      })
      .catch((error) => {
        console.error('Ошибка доступа к микрофону:', error);
        setMicrophoneStatus('denied');
        setErrorMessage('Для работы распознавания речи необходим доступ к микрофону');
      });
  }, []);

  // Функция для поиска сленговых слов в тексте
  const findSlangWords = (inputText: string) => {
    if (!inputText || Object.keys(slangDictionary).length === 0 || serverStatus !== 'online') return;
    
    // Разбиваем текст на слова
    const words = inputText.toLowerCase().match(/[\wа-яё]+/gi) || [];
    const uniqueWords = [...new Set(words)];
    const foundSlangWords: SlangWord[] = [];
    
    if (showDebug) {
      console.log('Поиск сленговых слов в тексте:', inputText);
      console.log('Разбитые слова:', uniqueWords);
    }
    
    // Первый проход: ищем только точные совпадения
    uniqueWords.forEach(word => {
      // Очищаем слово от возможных знаков препинания и приводим к нижнему регистру
      const cleanWord = word.toLowerCase().trim();
      
      if (slangDictionary[cleanWord]) {
        foundSlangWords.push({
          word: cleanWord,
          explanation: slangDictionary[cleanWord]
        });
        
        if (showDebug) {
          console.log(`Найдено точное совпадение: "${cleanWord}" - ${slangDictionary[cleanWord]}`);
        }
      }
    });
    
    // Второй проход: проверяем многословные фразы
    const slangPhrases = Object.keys(slangDictionary).filter(key => key.includes(' '));
    
    slangPhrases.forEach(phrase => {
      if (inputText.toLowerCase().includes(phrase.toLowerCase())) {
        foundSlangWords.push({
          word: phrase,
          explanation: slangDictionary[phrase]
        });
        
        if (showDebug) {
          console.log(`Найдена фраза: "${phrase}" - ${slangDictionary[phrase]}`);
        }
      }
    });
    
    // Удаляем дубликаты и сортируем слова по длине (сначала самые длинные)
    const uniqueFoundWords = foundSlangWords
      .filter((value, index, self) => index === self.findIndex((t) => t.word === value.word))
      .sort((a, b) => b.word.length - a.word.length);
    
    if (showDebug) {
      console.log('Найденные сленговые слова после обработки:', uniqueFoundWords);
    }
    
    setSlangWords(uniqueFoundWords);
  };

  // Обновление найденных сленговых слов при изменении текста
  useEffect(() => {
    findSlangWords(text);
  }, [text, slangDictionary, serverStatus]);

  // Инициализация и управление распознаванием речи
  useEffect(() => {
    if (microphoneStatus !== 'granted') return;

    // Создаем экземпляр распознавания речи
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    
    // Базовые настройки
    recognition.continuous = true; // Непрерывное распознавание
    recognition.interimResults = true; // Включаем промежуточные результаты
    recognition.lang = language; // Устанавливаем язык
    
    // Событие начала распознавания
    recognition.onstart = () => {
      console.log('Распознавание началось');
      setLastEvent('onstart');
      setIsListening(true);
    };
    
    // Событие получения результата
    recognition.onresult = (event: any) => {
      setLastEvent('onresult');
      console.log('Событие распознавания:', event);
      
      // Получаем текст из результатов распознавания
      let interim = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          // Финальный результат добавляем к основному тексту
          setText(prev => {
            // Если предыдущий текст заканчивается пробелом, не добавляем дополнительный
            const newText = prev ? 
              (prev.endsWith(' ') ? prev + transcript : prev + ' ' + transcript) : 
              transcript;
            
            // Проверяем наличие сленговых слов в обновленном тексте
            findSlangWords(newText);
            
            return newText;
          });
          console.log('Финальный текст:', transcript);
        } else {
          // Промежуточный результат отображаем во временном поле
          interim += transcript;
        }
      }
      
      if (interim) {
        setTempText(interim);
        console.log('Промежуточный текст:', interim);
      }
    };
    
    // Обработка ошибок
    recognition.onerror = (event: any) => {
      console.error('Ошибка распознавания:', event);
      setLastEvent(`onerror: ${event.error}`);
      
      if (event.error === 'no-speech') {
        setErrorMessage('Речь не обнаружена. Проверьте, что микрофон работает и вы говорите достаточно громко.');
      } else if (event.error === 'audio-capture') {
        setErrorMessage('Проблема с захватом звука. Проверьте, что микрофон подключен и работает.');
      } else if (event.error === 'not-allowed') {
        setErrorMessage('Доступ к микрофону запрещен. Разрешите доступ в настройках браузера.');
        setMicrophoneStatus('denied');
      } else {
        setErrorMessage(`Произошла ошибка: ${event.error}`);
      }
      
      setIsListening(false);
    };
    
    // Событие окончания распознавания
    recognition.onend = () => {
      console.log('Распознавание завершилось');
      setLastEvent('onend');
      
      // Если всё ещё нужно слушать, перезапускаем распознавание
      if (isListening) {
        try {
          recognition.start();
          console.log('Распознавание перезапущено');
        } catch (error) {
          console.error('Ошибка при перезапуске:', error);
          setIsListening(false);
          setErrorMessage('Не удалось продолжить распознавание. Попробуйте начать заново.');
        }
      }
    };
    
    // Сохраняем объект распознавания
    recognitionRef.current = recognition;
    
    // Очистка при размонтировании
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Ошибка при остановке распознавания:', error);
        }
      }
    };
  }, [language, microphoneStatus]);

  // Запуск распознавания речи
  const startListening = () => {
    if (microphoneStatus !== 'granted') {
      setErrorMessage('Для работы распознавания необходим доступ к микрофону');
      return;
    }
    
    setErrorMessage('');
    setTempText('');
    previousSessionTextRef.current = text; // Сохраняем текущий текст для возможности отмены
    
    // Запускаем распознавание
    try {
      recognitionRef.current.start();
      console.log('Начало распознавания...');
      setLastEvent('старт запущен');
    } catch (error) {
      console.error('Ошибка при запуске распознавания:', error);
      setErrorMessage('Не удалось запустить распознавание речи. Попробуйте перезагрузить страницу.');
    }
  };

  // Отмена распознавания
  const cancelRecording = () => {
    console.log('Отмена записи');
    setIsListening(false);
    
    // Восстанавливаем текст до начала записи
    setText(previousSessionTextRef.current);
    
    // Останавливаем распознавание
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('Распознавание остановлено');
      } catch (error) {
        console.error('Ошибка при остановке распознавания:', error);
      }
    }
    
    setTempText('');
  };
  
  // Завершение распознавания с сохранением
  const stopAndSave = () => {
    console.log('Сохранение и завершение записи');
    setIsListening(false);
    
    // Останавливаем распознавание
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('Распознавание остановлено');
      } catch (error) {
        console.error('Ошибка при остановке распознавания:', error);
      }
    }
    
    // Если есть промежуточный текст, добавляем его к основному
    if (tempText.trim()) {
      setText(prev => {
        const newText = prev ? 
          (prev.endsWith(' ') ? prev + tempText : prev + ' ' + tempText) : 
          tempText;
        
        // Проверяем наличие сленговых слов в обновленном тексте
        findSlangWords(newText);
        
        return newText;
      });
    }
    
    setTempText('');
  };

  // Очистка текста
  const clearText = () => {
    setText('');
    setTempText('');
    setSlangWords([]);
  };

  // Копирование текста
  const copyText = () => {
    if (text) {
      navigator.clipboard.writeText(text);
      console.log('Текст скопирован');
    }
  };

  // Обработчик изменения текста для ручного ввода
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    findSlangWords(newText);
  };

  // Включение/выключение режима отладки
  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };

  // Добавление тестового сленгового слова в текст
  const addTestSlangWord = () => {
    if (Object.keys(slangDictionary).length > 0) {
      const randomIndex = Math.floor(Math.random() * Math.min(10, Object.keys(slangDictionary).length));
      const slangWord = Object.keys(slangDictionary)[randomIndex];
      
      setText(prev => {
        const newText = prev ? `${prev} ${slangWord}` : slangWord;
        findSlangWords(newText);
        return newText;
      });
    }
  };

  // Улучшенный поиск конкретного слова в словаре через API
  const searchWordInDictionary = async (word: string) => {
    if (!word || serverStatus !== 'online') return null;
    
    try {
      // Используем новый API эндпоинт для поиска слова
      const response = await axios.get(`${API_URL}/word`, {
        params: { word: word.trim().toLowerCase() }
      });
      
      const { exact, similar } = response.data;
      
      if (showDebug) {
        console.log('Результат API-поиска для слова', word, ':', { exact, similar });
      }
      
      return { exact, similar };
    } catch (error) {
      console.error('Ошибка при API-поиске слова:', error);
      
      // Локальный поиск в случае ошибки
      const lowerWord = word.toLowerCase().trim();
      const exactMatch = slangDictionary[lowerWord];
      
      if (exactMatch) {
        return {
          exact: { word: lowerWord, definition: exactMatch },
          similar: []
        };
      }
      
      // Ищем похожие слова
      const similarWords = Object.keys(slangDictionary)
        .filter(key => key.includes(lowerWord) || lowerWord.includes(key))
        .map(key => ({ word: key, definition: slangDictionary[key] }));
      
      return { exact: null, similar: similarWords };
    }
  };

  // Обработчик поиска тестового слова
  const handleTestWordSearch = async () => {
    if (!testWord.trim()) return;
    
    setTestResult({ loading: true });
    const result = await searchWordInDictionary(testWord);
    setTestResult(result);
    
    // Если найдено точное совпадение, можно добавить слово в текст
    if (result && result.exact) {
      console.log(`Найдено точное совпадение для слова "${testWord}": ${result.exact.definition}`);
    }
  };

  // Добавление конкретного сленгового слова в текст
  const addSpecificSlangWord = (word: string) => {
    setText(prev => {
      const newText = prev ? `${prev} ${word}` : word;
      
      // Не запускаем findSlangWords сразу, чтобы избежать задержки из-за асинхронности useEffect
      return newText;
    });
  };

  // Отображение результатов поиска тестового слова
  const renderTestResult = () => {
    if (!testResult) return null;
    
    if (testResult.loading) {
      return <div className="text-blue-500">Поиск слова...</div>;
    }
    
    if (testResult.exact) {
      return (
        <div className="mt-2 p-2 bg-white rounded text-xs">
          <div className="font-semibold">Найдено точное совпадение:</div>
          <div className="mt-1">
            <span className="font-medium">{testResult.exact.word}</span>: {testResult.exact.definition}
          </div>
          <button 
            onClick={() => addSpecificSlangWord(testResult.exact.word)}
            className="mt-1 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
          >
            Добавить в текст
          </button>
        </div>
      );
    }
    
    if (testResult.similar && testResult.similar.length > 0) {
      return (
        <div className="mt-2 p-2 bg-white rounded text-xs">
          <div className="font-semibold">Похожие слова ({testResult.similar.length}):</div>
          <ul className="mt-1 list-disc pl-4">
            {testResult.similar.slice(0, 5).map((item: any, index: number) => (
              <li key={index} className="mb-1">
                <span className="font-medium">{item.word}</span>: {item.definition}
                <button 
                  onClick={() => addSpecificSlangWord(item.word)}
                  className="ml-2 px-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                >
                  +
                </button>
              </li>
            ))}
            {testResult.similar.length > 5 && <li>...и еще {testResult.similar.length - 5}</li>}
          </ul>
        </div>
      );
    }
    
    return <div className="text-red-500">Слово не найдено в словаре</div>;
  };

  // Тестовый поиск конкретных слов
  const [testWord, setTestWord] = useState('');
  const [testResult, setTestResult] = useState<any>(null);

  return (
    <div className="pb-20">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-2 mb-6 rounded-full bg-white/20 backdrop-blur">
          <Mic className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
          Speech to Text
        </h1>
        <p className="text-lg text-white/90 max-w-2xl mx-auto">
          Превратите голос в текст с помощью технологии распознавания речи
        </p>
      </div>

      {/* Статус сервера и микрофона */}
      <div className="max-w-4xl mx-auto mb-4 flex justify-center gap-4 flex-wrap">
        <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2 ${
          microphoneStatus === 'granted' 
            ? 'bg-green-100 text-green-800' 
            : microphoneStatus === 'denied' 
              ? 'bg-red-100 text-red-800' 
              : 'bg-yellow-100 text-yellow-800'
        }`}>
          {microphoneStatus === 'granted' 
            ? 'Микрофон подключен' 
            : microphoneStatus === 'denied' 
              ? 'Доступ к микрофону запрещен' 
              : 'Ожидание доступа к микрофону'}
        </div>
        
        <div className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2 ${
          serverStatus === 'online' 
            ? 'bg-green-100 text-green-800' 
            : serverStatus === 'offline' 
              ? 'bg-red-100 text-red-800' 
              : 'bg-blue-100 text-blue-800'
        }`}>
          {serverStatus === 'online' 
            ? `База сленгов подключена (${Object.keys(slangDictionary).length} слов)` 
            : serverStatus === 'offline' 
              ? 'База сленгов недоступна' 
              : 'Проверка базы сленгов...'}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto glass-effect rounded-3xl shadow-2xl p-6 hover-scale">
        {/* Отладочная информация */}
        <div className="mb-4 text-xs text-gray-500 flex justify-between items-center">
          <div>
            <p>Последнее событие: {lastEvent || 'нет'}</p>
            <p>Статус: {isListening ? 'Запись активна' : 'Запись неактивна'}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleDebug}
              className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center gap-1"
            >
              <Bug size={14} />
              {showDebug ? 'Скрыть отладку' : 'Отладка'}
            </button>
            
            {showDebug && (
              <button 
                onClick={addTestSlangWord}
                className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200"
              >
                Тестовое слово
              </button>
            )}
          </div>
        </div>

        {/* Отладочная информация о словаре */}
        {showDebug && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4 overflow-auto max-h-80">
            <h4 className="font-medium mb-2 text-sm">Словарь сленгов ({Object.keys(slangDictionary).length} слов):</h4>
            
            {/* Тестирование конкретного слова */}
            <div className="mb-4 border-b pb-3 border-gray-200">
              <h5 className="font-medium text-sm mb-2">Поиск слова в словаре:</h5>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={testWord}
                  onChange={(e) => setTestWord(e.target.value)}
                  placeholder="Введите слово для поиска" 
                  className="flex-1 p-1 text-xs border rounded"
                />
                <button 
                  onClick={handleTestWordSearch}
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Найти
                </button>
              </div>
              
              {testResult && renderTestResult()}
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(slangDictionary).slice(0, 10).map(([word, definition], index) => (
                <div key={index} className="p-1 border-b border-gray-200">
                  <span className="font-medium">{word}</span>: {definition.slice(0, 50)}{definition.length > 50 ? '...' : ''}
                </div>
              ))}
              {Object.keys(slangDictionary).length > 10 && <div>...</div>}
            </div>
          </div>
        )}

        {/* Сообщение об ошибке */}
        {errorMessage && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center mb-6 flex items-center justify-center gap-2">
            <AlertCircle className="text-red-500" size={18} />
            <p className="text-red-600">
              {errorMessage}
            </p>
          </div>
        )}
        
        {/* Временный текст - то, что распознаётся в данный момент */}
        <div className="bg-white/60 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              {isListening 
                ? <span className="flex items-center text-red-600">
                    <span className="inline-block w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse"></span>
                    Идет запись...
                  </span> 
                : "Текущий фрагмент"}
            </label>
          </div>
          <div className={`min-h-24 rounded-lg p-3 bg-white/80 border ${isListening ? 'border-red-200 animate-pulse' : 'border-gray-200'}`}>
            {tempText || <span className="text-gray-400 italic">{isListening ? "Говорите..." : "Здесь появятся промежуточные результаты"}</span>}
          </div>
        </div>
        
        {/* Text Output */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-lg font-medium text-gray-800">Распознанный текст</label>
            <div className="flex items-center gap-2">
              <button 
                onClick={clearText}
                disabled={!text}
                className={`text-sm px-3 py-1 rounded-full flex items-center gap-1 ${
                  text ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <X size={14} />
                <span>Очистить</span>
              </button>
              <span className="text-sm text-gray-600 bg-white/50 px-3 py-1 rounded-full">
                {text.length} символов
              </span>
            </div>
          </div>
          <textarea
            value={text}
            onChange={handleTextChange}
            className="w-full h-48 p-4 bg-white/50 backdrop-blur border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-800 placeholder-gray-500"
            placeholder="Нажмите на кнопку микрофона, чтобы начать запись"
          />
          
          {/* Сленговые слова и их расшифровка */}
          {slangWords.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Book size={18} className="text-indigo-500" />
                <h3 className="text-md font-medium text-gray-800">Сленговые слова в тексте:</h3>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <ul className="space-y-2">
                  {slangWords.map((item, index) => (
                    <li key={index} className="flex flex-col">
                      <span className="font-medium text-indigo-800">{item.word}</span>
                      <span className="text-gray-600 text-sm">{item.explanation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {isLoadingDictionary && (
            <div className="text-center text-gray-500 py-2">
              Загрузка словаря сленга...
            </div>
          )}
          
          {serverStatus === 'offline' && (
            <div className="text-center text-red-500 py-2 bg-red-50 rounded-lg">
              Невозможно загрузить базу сленгов. Проверьте соединение с сервером.
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="text-lg font-medium text-gray-800">Настройки распознавания</label>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Язык распознавания</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2 bg-white/50 backdrop-blur border-0 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  disabled={isListening}
                >
                  <option value="ru-RU">Русский</option>
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 flex flex-col justify-center">
            {!isListening ? (
              // Кнопка начала записи
              <div className="flex justify-center">
                <button
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${
                    microphoneStatus === 'granted' 
                      ? 'bg-indigo-600 hover:bg-indigo-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  onClick={startListening}
                  disabled={microphoneStatus !== 'granted'}
                >
                  <Mic className="text-white" size={28} />
                </button>
              </div>
            ) : (
              // Кнопки управления во время записи
              <div className="flex justify-center gap-5">
                <button
                  className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all"
                  onClick={cancelRecording}
                  title="Отменить запись"
                >
                  <X className="text-white" size={24} />
                </button>
                
                <button
                  className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:bg-green-700 transition-all"
                  onClick={stopAndSave}
                  title="Сохранить и завершить"
                >
                  <Check className="text-white" size={24} />
                </button>
              </div>
            )}
            
            <p className="text-center text-gray-600">
              {isListening 
                ? "Говорите - распознанные слова добавляются в текст" 
                : microphoneStatus === 'granted'
                  ? "Нажмите на кнопку микрофона для начала записи"
                  : "Предоставьте доступ к микрофону для начала работы"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-center">
          <button 
            className="flex items-center gap-2 px-6 py-2 bg-white/30 backdrop-blur rounded-full hover:bg-white/40 transition-all duration-200"
            onClick={copyText}
            disabled={!text}
          >
            <Copy size={16} />
            <span>Скопировать текст</span>
          </button>
        </div>
      </div>
      
      {/* Features */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 max-w-4xl mx-auto">
        <div className="glass-effect p-6 rounded-2xl hover-scale">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Mic className="text-white" size={24} />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Точное распознавание</h3>
          <p className="text-gray-600">Наша технология обеспечивает высокую точность распознавания речи на русском языке</p>
        </div>
        
        <div className="glass-effect p-6 rounded-2xl hover-scale">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Book className="text-white" size={24} />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Понимание сленга</h3>
          <p className="text-gray-600">Автоматическое определение сленговых слов с их подробным объяснением из базы данных</p>
        </div>
      </div>
    </div>
  );
};

export default SpeechToText; 