import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Copy, X, Check, MessageSquare, AlertCircle, Book, Bug } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';


declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}


interface SlangDictionary {
  [key: string]: string;
}


interface SlangWord {
  word: string;
  explanation: string;
}

const API_URL = 'http://localhost:3001/api';

const SpeechToText: React.FC = () => {
  const { incrementRecognitions } = useAuth();
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
  const [isStatUpdated, setIsStatUpdated] = useState(false);
  const [isUploadedFile, setIsUploadedFile] = useState(false);
  const [processedText, setProcessedText] = useState('');
  

  const recognitionRef = useRef<any>(null);

  const previousSessionTextRef = useRef<string>('');


  useEffect(() => {
    const checkServerAndLoadDictionary = async () => {
      try {
        setServerStatus('checking');
        setIsLoadingDictionary(true);
        

        let statusResponse;
        try {
          statusResponse = await axios.get(`${API_URL}/status`);
          console.log('Сервер доступен через эндпоинт /api/status:', statusResponse.data);
        } catch (e) {
          console.log('Эндпоинт /api/status недоступен, пробуем /api/health');
          statusResponse = await axios.get(`${API_URL}/health`);
          console.log('Сервер доступен через эндпоинт /api/health:', statusResponse.data);
        }
        

        if (statusResponse.data.status === 'online' || statusResponse.data.status === 'ok') {
          setServerStatus('online');
          

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


  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setErrorMessage('Ваш браузер не поддерживает функцию распознавания речи');
      return;
    }


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


  const findSlangWords = (inputText: string) => {
    if (!inputText || Object.keys(slangDictionary).length === 0 || serverStatus !== 'online') return;
    

    const words = inputText.toLowerCase().match(/[\wа-яё]+/gi) || [];
    const uniqueWords = [...new Set(words)];
    const foundSlangWords: SlangWord[] = [];
    
    if (showDebug) {
      console.log('Поиск сленговых слов в тексте:', inputText);
      console.log('Разбитые слова:', uniqueWords);
    }
    

    uniqueWords.forEach(word => {

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
    

    const uniqueFoundWords = foundSlangWords
      .filter((value, index, self) => index === self.findIndex((t) => t.word === value.word))
      .sort((a, b) => b.word.length - a.word.length);
    
    if (showDebug) {
      console.log('Найденные сленговые слова после обработки:', uniqueFoundWords);
    }
    
    setSlangWords(uniqueFoundWords);
  };


  useEffect(() => {
    findSlangWords(text);
  }, [text, slangDictionary, serverStatus]);


  useEffect(() => {
    if (microphoneStatus !== 'granted') return;


    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    

    recognition.continuous = true; 
    recognition.interimResults = true; 
    recognition.lang = language; 
    

    recognition.onstart = () => {
      console.log('Распознавание началось');
      setLastEvent('onstart');
      setIsListening(true);
    };
    

    recognition.onresult = (event: any) => {
      setLastEvent('onresult');
      console.log('Событие распознавания:', event);
      

      let interim = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {

          setText(prev => {

            const newText = prev ? 
              (prev.endsWith(' ') ? prev + transcript : prev + ' ' + transcript) : 
              transcript;
            

            findSlangWords(newText);
            
            return newText;
          });
          console.log('Финальный текст:', transcript);
        } else {

          interim += transcript;
        }
      }
      
      if (interim) {
        setTempText(interim);
        console.log('Промежуточный текст:', interim);
      }
    };
    

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
    

    recognition.onend = () => {
      console.log('Распознавание завершено');
      setLastEvent('onend');
      

      if (isListening && !errorMessage) {
        console.log('Перезапуск распознавания...');
        recognition.start();
      } else {
        setIsListening(false);
        setTempText('');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Ошибка при остановке распознавания:', error);
        }
      }
    };
  }, [microphoneStatus, language, isListening, errorMessage]);


  const handleRecognitionResult = (event: any) => {
    const transcript = Array.from(event.results)
      .map((result: any) => result[0])
      .map((result: any) => result.transcript)
      .join('');
    
    setTempText(transcript);
    

    if (event.results[0].isFinal) {
      setText((prevText) => {
        const newText = prevText + ' ' + transcript;
        

        if (transcript.trim() && !isStatUpdated) {

          incrementRecognitions(transcript).catch(error => {
            console.error('Ошибка при обновлении статистики распознаваний:', error);
          });
          

          setIsStatUpdated(true);
        }
        
        return newText;
      });
      setTempText('');
    }
  };


  const startListening = () => {
    setErrorMessage('');
    setIsStatUpdated(false); 
    
    if (!recognitionRef.current) {
      initializeRecognition();
    }
    
    if (recognitionRef.current) {

      previousSessionTextRef.current = text;
      

      try {
        recognitionRef.current.start();
      setIsListening(true);
        setLastEvent('start');
      } catch (e: any) {
        console.error('Ошибка при запуске распознавания:', e);
        setErrorMessage(`Ошибка при запуске: ${e.message}`);
      }
    }
  };

 
  const cancelRecording = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch (error) {
      console.error('Ошибка при остановке распознавания:', error);
    }
    

    setText(previousSessionTextRef.current);
    setTempText('');
    setIsListening(false);
  };


  const stopAndSave = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch (error) {
      console.error('Ошибка при остановке распознавания:', error);
    }
    

    if (tempText) {
      setText(prev => {
        const newText = prev ? 
          (prev.endsWith(' ') ? prev + tempText : prev + ' ' + tempText) : 
          tempText;
        

        findSlangWords(newText);
        
        return newText;
      });
    }
    
    setTempText('');
    setIsListening(false);
  };

  // Очистить текст
  const clearText = () => {
    setText('');
    setTempText('');
    setSlangWords([]);
  };


  const copyText = () => {
    if (text) {
      navigator.clipboard.writeText(text);
    }
  };


  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };


  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };


  const addTestSlangWord = () => {
    const testWord = "краш";
    const testText = text ? text + " Я вкрашилась в него." : "Я вкрашилась в него.";
    setText(testText);
    

    if (Object.keys(slangDictionary).length === 0) {
      setSlangDictionary({
        ...slangDictionary,
        "краш": "Объект обожания, влюбленности"
      });
    }
  };


  const searchWordInDictionary = async (word: string) => {
    if (!word.trim()) return;
    
    const cleanWord = word.trim().toLowerCase();
    

    if (slangDictionary[cleanWord]) {
      return {
        word: cleanWord,
        explanation: slangDictionary[cleanWord]
      };
    }
    

    try {
      if (serverStatus !== 'online') {
        console.log('Сервер недоступен для поиска');
        return null;
      }
      
      const response = await axios.get(`${API_URL}/search`, {
        params: { word: cleanWord }
      });
      
      if (response.data && response.data.found) {
        return {
          word: cleanWord,
          explanation: response.data.explanation
        };
      }
    } catch (error) {
      console.error('Ошибка при поиске слова:', error);
    }
    
    return null;
  };


  const handleTestWordSearch = async () => {
    const testWord = prompt('Введите слово для поиска в словаре:');
    if (testWord) {
      const result = await searchWordInDictionary(testWord);
      if (result) {
        alert(`Найдено: ${result.word} - ${result.explanation}`);
      } else {
        alert(`Слово "${testWord}" не найдено в словаре сленга`);
      }
    }
  };


  const addSpecificSlangWord = (word: string) => {
    if (slangDictionary[word]) {
      setSlangWords([
        ...slangWords.filter(item => item.word !== word),
        {
          word,
          explanation: slangDictionary[word]
        }
      ]);
    }
  };


  const renderTestResult = () => {
    if (!showDebug) return null;
    
    return (
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Отладочная информация:</h3>
        <ul className="space-y-2 text-sm">
          <li><strong>Микрофон:</strong> {microphoneStatus}</li>
          <li><strong>Запись:</strong> {isListening ? 'Активна' : 'Неактивна'}</li>
          <li><strong>Последнее событие:</strong> {lastEvent}</li>
          <li><strong>Язык:</strong> {language}</li>
          <li><strong>Статус сервера:</strong> {serverStatus}</li>
          <li><strong>Словарь сленга:</strong> {Object.keys(slangDictionary).length} слов</li>
          <li><strong>Найдено сленговых слов:</strong> {slangWords.length}</li>
          <li>
            <button 
              onClick={addTestSlangWord}
              className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
            >
              Добавить тестовое слово
            </button>
            <button 
              onClick={handleTestWordSearch}
              className="px-2 py-1 bg-green-500 text-white text-xs rounded ml-2"
            >
              Поиск слова
            </button>
          </li>
        </ul>
      </div>
    );
  };


  const initializeRecognition = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setErrorMessage('Распознавание речи не поддерживается в вашем браузере');
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      
      recognition.onstart = () => {
        setIsListening(true);
        setLastEvent('onstart');
      };
      
      recognition.onend = () => {
        setIsListening(false);
        setLastEvent('onend');
      };
      
      recognition.onresult = handleRecognitionResult;
      
      recognition.onerror = (event: any) => {
        setLastEvent(`error: ${event.error}`);
        
        if (event.error === 'not-allowed') {
          setMicrophoneStatus('denied');
          setErrorMessage('Доступ к микрофону не разрешен');
        } else {
          setErrorMessage(`Ошибка распознавания: ${event.error}`);
        }
        
        setIsListening(false);
      };
      
      recognition.onaudiostart = () => {
        setMicrophoneStatus('granted');
        setLastEvent('audiostart');
      };
      
      recognitionRef.current = recognition;
      
    } catch (error: any) {
      console.error('Ошибка при инициализации распознавания речи:', error);
      setErrorMessage(`Не удалось инициализировать распознавание: ${error.message}`);
    }
  };

  const onTextProcessed = useCallback(async (text: string) => {

    if (text.trim() && !isUploadedFile) {
      setProcessedText(text);
      

      incrementRecognitions(text).catch(error => {
        console.error('Ошибка при обновлении статистики распознаваний:', error);

      });
      

      findSlangWords(text);
    }
  }, [isUploadedFile, findSlangWords, incrementRecognitions]);


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          const text = evt.target.result.toString();
          setText(text);
          setIsUploadedFile(true);
          findSlangWords(text);
        }
      };
      reader.readAsText(file);
    }
  };


  const handleFinalTranscript = () => {
    if (text.trim() && !isUploadedFile) {
      onTextProcessed(text);
    }
  };


  useEffect(() => {
    if (!isUploadedFile && text.trim()) {
      handleFinalTranscript();
    }
  }, [isUploadedFile, text, onTextProcessed]);


  useEffect(() => {
    if (!text.trim()) {
      setIsUploadedFile(false);
    }
  }, [text]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 pb-28">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10">
    <div className="pb-20">
      <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 mb-6 rounded-full bg-white/20 backdrop-blur">
          <Mic className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
              Распознавание речи
        </h1>
        <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Произнесите фразу, и мы распознаем молодежный сленг
            </p>
          </div>
            
          {errorMessage && (
            <div className="mb-4 bg-white/10 backdrop-blur border-l-4 border-red-400 text-white p-4 rounded relative max-w-4xl mx-auto">
              <div className="flex items-center">
                <AlertCircle className="mr-2" size={20} />
                <span>{errorMessage}</span>
              </div>
            </div>
          )}
            
          {}
          <div className="w-full glass-effect p-6 rounded-3xl shadow-lg backdrop-blur-sm bg-white/10 text-white max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Распознавание речи</h2>
              
            {}
          <textarea
            value={text}
              onChange={handleTextChange}
              className="w-full h-48 p-4 bg-white/20 backdrop-blur border-0 rounded-2xl focus:ring-2 focus:ring-white/50 focus:border-transparent resize-none text-white placeholder-white/50"
              placeholder="Нажмите на кнопку микрофона, чтобы начать запись"
            />
              
            {}
            {slangWords.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Book size={18} className="text-white/80" />
                  <h3 className="text-md font-medium text-white">Сленговые слова в тексте:</h3>
                </div>
                <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                  <ul className="space-y-2">
                    {slangWords.map((item, index) => (
                      <li key={index} className="flex flex-col">
                        <span className="font-medium text-white">{item.word}</span>
                        <span className="text-white/80 text-sm">{item.explanation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
              
            {isLoadingDictionary && (
              <div className="text-center text-white/70 py-2">
                Загрузка словаря сленга...
              </div>
            )}
              
            {serverStatus === 'offline' && (
              <div className="text-center text-red-300 py-2 bg-red-900/20 rounded-lg">
                Невозможно загрузить базу сленгов. Проверьте соединение с сервером.
              </div>
            )}
        </div>
        
        {}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="space-y-4 bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <label className="text-lg font-medium text-white">Настройки распознавания</label>
            
            <div className="space-y-4">
              <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">Язык распознавания</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                      className="w-full p-2 bg-white/20 backdrop-blur border-0 rounded-lg focus:ring-2 focus:ring-white/50 text-white"
                  disabled={isListening}
                >
                  <option value="ru-RU">Русский</option>
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                </select>
              </div>
            </div>
          </div>
          
              <div className="space-y-4 flex flex-col justify-center bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                {!isListening ? (

            <div className="flex justify-center">
                    <button
                      className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${
                        microphoneStatus === 'granted' 
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600' 
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                      onClick={startListening}
                      disabled={microphoneStatus !== 'granted'}
                    >
                      <Mic className="text-white" size={28} />
                    </button>
                  </div>
                ) : (

                  <div className="flex justify-center gap-5">
                    <button
                      className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg hover:from-red-600 hover:to-red-700 transition-all"
                      onClick={cancelRecording}
                      title="Отменить запись"
                    >
                      <X className="text-white" size={24} />
                    </button>
                      
                    <button
                      className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg hover:from-green-600 hover:to-green-700 transition-all"
                      onClick={stopAndSave}
                      title="Сохранить и завершить"
                    >
                      <Check className="text-white" size={24} />
                    </button>
                  </div>
                )}
                  
                <p className="text-center text-white/80">
                  {isListening 
                    ? "Говорите - распознанные слова добавляются в текст" 
                    : microphoneStatus === 'granted'
                      ? "Нажмите на кнопку микрофона для начала записи"
                      : "Предоставьте доступ к микрофону для начала работы"}
                </p>
          </div>
        </div>

        {}
        <div className="mt-6 flex justify-center">
          <button 
                className="flex items-center gap-2 px-6 py-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition-all duration-200 text-white"
            onClick={copyText}
            disabled={!text}
          >
            <Copy size={16} />
            <span>Скопировать текст</span>
          </button>
      </div>
      
      {}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 max-w-4xl mx-auto">
              <div className="glass-effect p-6 rounded-2xl hover-scale backdrop-blur-sm bg-white/10 text-white">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Mic className="text-white" size={24} />
          </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Точное распознавание</h3>
                <p className="text-white/80">Наша технология обеспечивает высокую точность распознавания речи на русском языке</p>
              </div>
              
              <div className="glass-effect p-6 rounded-2xl hover-scale backdrop-blur-sm bg-white/10 text-white">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Book className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Понимание сленга</h3>
                <p className="text-white/80">Автоматическое определение сленговых слов с их подробным объяснением из базы данных</p>
              </div>
        </div>
        
            {renderTestResult()}
        </div>
      </div>
    </div>
  );
};

export default SpeechToText; 