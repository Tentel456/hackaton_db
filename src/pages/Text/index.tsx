import React, { useState, useEffect } from 'react';
import { FileText, Copy, Check, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';


type SlangEntry = {
  slang: string;
  normal: string;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'expression';
  cases?: { [key: string]: string }; 
  conjugations?: { [key: string]: string };
};

const slangDictionary: SlangEntry[] = [
  {
    slang: 'краш',
    normal: 'объект обожания',
    partOfSpeech: 'noun',
    cases: {
      nominative: 'объект обожания', 
      genitive: 'объекта обожания',
      dative: 'объекту обожания', 
      accusative: 'объект обожания', 
      instrumental: 'объектом обожания', 
      prepositional: 'об объекте обожания' 
    }
  },
  {
    slang: 'чиллить',
    normal: 'отдыхать',
    partOfSpeech: 'verb',
    conjugations: {
      present1: 'отдыхаю', 
      present2: 'отдыхаешь', 
      present3: 'отдыхает', 
      present4: 'отдыхаем', 
      present5: 'отдыхаете',
      present6: 'отдыхают', 
      past_m: 'отдыхал', 
      past_f: 'отдыхала', 
      past_n: 'отдыхало', 
      past_pl: 'отдыхали' 
    }
  },
  {
    slang: 'кринж',
    normal: 'стыд',
    partOfSpeech: 'noun',
    cases: {
      nominative: 'стыд', 
      genitive: 'стыда', 
      dative: 'стыду', 
      accusative: 'стыд', 
      instrumental: 'стыдом', 
      prepositional: 'о стыде' 
    }
  },
  {
    slang: 'рофлить',
    normal: 'шутить',
    partOfSpeech: 'verb',
    conjugations: {
      present1: 'шучу',
      present2: 'шутишь',
      present3: 'шутит',
      present4: 'шутим',
      present5: 'шутите',
      present6: 'шутят',
      past_m: 'шутил',
      past_f: 'шутила',
      past_n: 'шутило',
      past_pl: 'шутили'
    }
  },
  {
    slang: 'зашквар',
    normal: 'неприемлемое явление',
    partOfSpeech: 'noun',
    cases: {
      nominative: 'неприемлемое явление',
      genitive: 'неприемлемого явления',
      dative: 'неприемлемому явлению',
      accusative: 'неприемлемое явление',
      instrumental: 'неприемлемым явлением',
      prepositional: 'о неприемлемом явлении'
    }
  },
  {
    slang: 'агриться',
    normal: 'злиться',
    partOfSpeech: 'verb',
    conjugations: {
      present1: 'злюсь',
      present2: 'злишься',
      present3: 'злится',
      present4: 'злимся',
      present5: 'злитесь',
      present6: 'злятся',
      past_m: 'злился',
      past_f: 'злилась',
      past_n: 'злилось',
      past_pl: 'злились'
    }
  },
  {
    slang: 'вайб',
    normal: 'атмосфера',
    partOfSpeech: 'noun',
    cases: {
      nominative: 'атмосфера',
      genitive: 'атмосферы',
      dative: 'атмосфере',
      accusative: 'атмосферу',
      instrumental: 'атмосферой',
      prepositional: 'об атмосфере'
    }
  },
  {
    slang: 'хейтить',
    normal: 'критиковать',
    partOfSpeech: 'verb',
    conjugations: {
      present1: 'критикую',
      present2: 'критикуешь',
      present3: 'критикует',
      present4: 'критикуем',
      present5: 'критикуете',
      present6: 'критикуют',
      past_m: 'критиковал',
      past_f: 'критиковала',
      past_n: 'критиковало',
      past_pl: 'критиковали'
    }
  },
  {
    slang: 'токсик',
    normal: 'неприятный человек',
    partOfSpeech: 'noun',
    cases: {
      nominative: 'неприятный человек',
      genitive: 'неприятного человека',
      dative: 'неприятному человеку',
      accusative: 'неприятного человека',
      instrumental: 'неприятным человеком',
      prepositional: 'о неприятном человеке'
    }
  },
  {
    slang: 'флексить',
    normal: 'хвастаться',
    partOfSpeech: 'verb',
    conjugations: {
      present1: 'хвастаюсь',
      present2: 'хвастаешься',
      present3: 'хвастается',
      present4: 'хвастаемся',
      present5: 'хвастаетесь',
      present6: 'хвастаются',
      past_m: 'хвастался',
      past_f: 'хвасталась',
      past_n: 'хвасталось',
      past_pl: 'хвастались'
    }
  }
];


const analyzeWordContext = (
  word: string,
  prevWord: string | null,
  nextWord: string | null,
  slangEntry: SlangEntry
): string => {

  if (!slangEntry) return word;

  const { partOfSpeech, cases, conjugations } = slangEntry;


  if (partOfSpeech === 'noun' && cases) {
    if (prevWord) {
      switch (prevWord.toLowerCase()) {
        case 'о':
        case 'об':
        case 'при':
        case 'в':
          return cases.prepositional || slangEntry.normal;
        case 'к':
        case 'по':
          return cases.dative || slangEntry.normal;
        case 'за':
        case 'с':
        case 'со':
        case 'под':
        case 'над':
          return cases.instrumental || slangEntry.normal;
        case 'из':
        case 'от':
        case 'до':
        case 'у':
        case 'для':
        case 'без':
          return cases.genitive || slangEntry.normal;
        case 'через':
        case 'про':
        case 'на':
          return cases.accusative || slangEntry.normal;
        default:
          return cases.nominative || slangEntry.normal;
      }
    }
    return cases.nominative || slangEntry.normal;
  }


  if (partOfSpeech === 'verb' && conjugations) {
    if (prevWord) {
      switch (prevWord.toLowerCase()) {
        case 'я':
          return conjugations.present1 || slangEntry.normal;
        case 'ты':
          return conjugations.present2 || slangEntry.normal;
        case 'он':
        case 'она':
        case 'оно':
          return conjugations.present3 || slangEntry.normal;
        case 'мы':
          return conjugations.present4 || slangEntry.normal;
        case 'вы':
          return conjugations.present5 || slangEntry.normal;
        case 'они':
          return conjugations.present6 || slangEntry.normal;
        default:

          if (nextWord) {
            if (['я', 'ты', 'он', 'она', 'оно', 'мы', 'вы', 'они'].includes(nextWord.toLowerCase())) {

              switch (nextWord.toLowerCase()) {
                case 'я': return conjugations.present1;
                case 'ты': return conjugations.present2;
                case 'он': 
                case 'она': 
                case 'оно': return conjugations.present3;
                case 'мы': return conjugations.present4;
                case 'вы': return conjugations.present5;
                case 'они': return conjugations.present6;
              }
            }
          }

          return conjugations.present4 || slangEntry.normal;
      }
    }

    return conjugations.present4 || slangEntry.normal;
  }

  return slangEntry.normal;
};


const transformText = (text: string, dictionary: SlangEntry[] = slangDictionary): { transformed: string, hasSlang: boolean } => {
  if (!text) return { transformed: '', hasSlang: false };
  

  let result = text;
  let hasFoundSlang = false;
  

  const sortedDictionary = [...dictionary].sort((a, b) => b.slang.length - a.slang.length);
  

  const words = result.split(/(\s+)/);
  

  let resultWords = [];
  

  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    

    if (!word.trim() || /^[\s,.!?;:()]+$/.test(word)) {
      resultWords.push(word);
      continue;
    }
    

    let found = false;
    let lowerWord = word.toLowerCase();
    

    let prevWord = null;
    for (let j = i - 1; j >= 0; j--) {
      if (words[j].trim() && !/^[\s,.!?;:()]+$/.test(words[j])) {
        prevWord = words[j];
        break;
      }
    }
    
    let nextWord = null;
    for (let j = i + 1; j < words.length; j++) {
      if (words[j].trim() && !/^[\s,.!?;:()]+$/.test(words[j])) {
        nextWord = words[j];
        break;
      }
    }
    

    for (const entry of sortedDictionary) {

      if (lowerWord === entry.slang.toLowerCase() || lowerWord.startsWith(entry.slang.toLowerCase())) {

        const replacement = getContextualReplacement(word, prevWord, nextWord, entry);
        

        let finalReplacement = replacement;
        if (word[0] === word[0].toUpperCase()) {
          finalReplacement = replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }
        

        if (lowerWord.length > entry.slang.length) {
          finalReplacement += word.substring(entry.slang.length);
        }
        
        resultWords.push(finalReplacement);
        found = true;
        hasFoundSlang = true;
        break;
      }
    }
    

    if (!found) {
      resultWords.push(word);
    }
  }
  

  return { 
    transformed: resultWords.join(''),
    hasSlang: hasFoundSlang
  };
};


const getContextualReplacement = (
  word: string,
  prevWord: string | null,
  nextWord: string | null,
  entry: SlangEntry
): string => {

  if (entry.partOfSpeech === 'noun' && entry.cases) {

    let caseForm = 'nominative'; 
    
    if (prevWord) {
      const lowerPrev = prevWord.toLowerCase();
      

      if (['о', 'об', 'при', 'в', 'на'].includes(lowerPrev)) {
        caseForm = 'prepositional';
      } 

      else if (['к', 'по', 'благодаря', 'согласно'].includes(lowerPrev)) {
        caseForm = 'dative';
      } 

      else if (['с', 'со', 'за', 'под', 'над', 'перед', 'между'].includes(lowerPrev)) {
        caseForm = 'instrumental';
      } 

      else if (['из', 'от', 'до', 'у', 'для', 'без', 'около', 'вокруг', 'после', 'вместо'].includes(lowerPrev)) {
        caseForm = 'genitive';
      } 

      else if (['через', 'про', 'в', 'на', 'за', 'под', 'о', 'об'].includes(lowerPrev)) {

        if (lowerPrev === 'в' || lowerPrev === 'на') {

          caseForm = 'accusative';
        } else {
          caseForm = 'accusative';
        }
      }
    }
    

    if (word.toLowerCase().endsWith('ом') || word.toLowerCase().endsWith('ем') || 
        word.toLowerCase().endsWith('ой') || word.toLowerCase().endsWith('ей')) {
      caseForm = 'instrumental';
    } else if (word.toLowerCase().endsWith('е')) {
      caseForm = 'prepositional';
    } else if (word.toLowerCase().endsWith('а') || word.toLowerCase().endsWith('я') ||
               word.toLowerCase().endsWith('ы') || word.toLowerCase().endsWith('ей') || 
               word.toLowerCase().endsWith('ов')) {
      caseForm = 'genitive';
    } else if (word.toLowerCase().endsWith('у') || word.toLowerCase().endsWith('ю')) {
      caseForm = 'accusative';
    }
    

    return entry.cases[caseForm] || entry.normal;
  }
  

  if (entry.partOfSpeech === 'verb' && entry.conjugations) {

    let conjugationForm = 'present4'; 
    

    let isPast = false;
    if (word.toLowerCase().endsWith('л') || word.toLowerCase().endsWith('ла') || 
        word.toLowerCase().endsWith('ло') || word.toLowerCase().endsWith('ли')) {
      isPast = true;
    }
    

    if (prevWord) {
      const lowerPrev = prevWord.toLowerCase();
      
      if (lowerPrev === 'я') {
        conjugationForm = isPast ? (word.toLowerCase().endsWith('ла') ? 'past_f' : 'past_m') : 'present1';
      } else if (lowerPrev === 'ты') {
        conjugationForm = isPast ? (word.toLowerCase().endsWith('ла') ? 'past_f' : 'past_m') : 'present2';
      } else if (['он'].includes(lowerPrev)) {
        conjugationForm = isPast ? 'past_m' : 'present3';
      } else if (['она'].includes(lowerPrev)) {
        conjugationForm = isPast ? 'past_f' : 'present3';
      } else if (['оно'].includes(lowerPrev)) {
        conjugationForm = isPast ? 'past_n' : 'present3';
      } else if (lowerPrev === 'мы') {
        conjugationForm = isPast ? 'past_pl' : 'present4';
      } else if (lowerPrev === 'вы') {
        conjugationForm = isPast ? 'past_pl' : 'present5';
      } else if (['они'].includes(lowerPrev)) {
        conjugationForm = isPast ? 'past_pl' : 'present6';
      }
    } else if (nextWord) {

      const lowerNext = nextWord.toLowerCase();
      
      if (lowerNext === 'я') {
        conjugationForm = isPast ? (word.toLowerCase().endsWith('ла') ? 'past_f' : 'past_m') : 'present1';
      } else if (lowerNext === 'ты') {
        conjugationForm = isPast ? (word.toLowerCase().endsWith('ла') ? 'past_f' : 'past_m') : 'present2';
      } else if (['он', 'она', 'оно'].includes(lowerNext)) {
        conjugationForm = isPast ? 'past_m' : 'present3';
      } else if (lowerNext === 'мы') {
        conjugationForm = isPast ? 'past_pl' : 'present4';
      } else if (lowerNext === 'вы') {
        conjugationForm = isPast ? 'past_pl' : 'present5';
      } else if (lowerNext === 'они') {
        conjugationForm = isPast ? 'past_pl' : 'present6';
      }
    }
    

    if (isPast) {
      if (word.toLowerCase().endsWith('л')) conjugationForm = 'past_m';
      else if (word.toLowerCase().endsWith('ла')) conjugationForm = 'past_f';
      else if (word.toLowerCase().endsWith('ло')) conjugationForm = 'past_n';
      else if (word.toLowerCase().endsWith('ли')) conjugationForm = 'past_pl';
    } else {

      if (word.toLowerCase().endsWith('ю') || word.toLowerCase().endsWith('у')) {
        conjugationForm = 'present1';
      } else if (word.toLowerCase().endsWith('шь') || word.toLowerCase().endsWith('ешь')) {
        conjugationForm = 'present2';
      } else if (word.toLowerCase().endsWith('ет') || word.toLowerCase().endsWith('ит')) {
        conjugationForm = 'present3';
      } else if (word.toLowerCase().endsWith('ем') || word.toLowerCase().endsWith('им')) {
        conjugationForm = 'present4';
      } else if (word.toLowerCase().endsWith('ете') || word.toLowerCase().endsWith('ите')) {
        conjugationForm = 'present5';
      } else if (word.toLowerCase().endsWith('ют') || word.toLowerCase().endsWith('ут') || 
                 word.toLowerCase().endsWith('ят') || word.toLowerCase().endsWith('ат')) {
        conjugationForm = 'present6';
      }
    }
    

    return entry.conjugations[conjugationForm] || entry.normal;
  }
  

  return entry.normal;
};


const TextPage: React.FC = () => {
  const { incrementTranslations } = useAuth();
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [displayedText, setDisplayedText] = useState<string>(''); 
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false); 
  const [copied, setCopied] = useState<boolean>(false);
  const [highlighted, setHighlighted] = useState<string[]>([]);
  const [debugging, setDebugging] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<{original: string, tokens: string[], replacements: any}[]>([]);
  const [typingSpeed, setTypingSpeed] = useState<number>(30); 
  const [slangsFound, setSlangsFound] = useState<boolean>(false);

 
  const examples = [
    "Мы чиллим с крашем уже 2 часа",
    "Я хейтил этот кринж весь вечер",
    "Они агрятся из-за этого зашквара",
    "Ты рофлишь над вайбом этого токсика",
    "Мы все флексим в этой атмосфере"
  ];

 
  useEffect(() => {
    if (outputText && outputText !== displayedText) {
      setIsTyping(true);
      setDisplayedText(''); 
      
      let i = 0;
      const typingAnimation = setInterval(() => {
        if (i < outputText.length) {
          setDisplayedText(prev => prev + outputText.charAt(i));
          i++;
        } else {
          clearInterval(typingAnimation);
          setIsTyping(false);
        }
      }, typingSpeed);
      
      return () => clearInterval(typingAnimation); 
    }
  }, [outputText, typingSpeed]);

  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };


  const loadExample = (example: string) => {
    setInputText(example);
  };


  const changeTypingSpeed = (speed: number) => {
    setTypingSpeed(speed);
  };


  const processText = () => {
    setIsProcessing(true);
    
    try {
      const { transformed, hasSlang } = transformText(inputText, slangDictionary);
      

      const foundSlangs = hasSlang ? true : false;
      setSlangsFound(foundSlangs);
      

      if (foundSlangs) {
        incrementTranslations(inputText, transformed).catch(error => {
          console.error('Ошибка при обновлении статистики переводов:', error);

        });
      }


      setDisplayedText("");
      

      setOutputText(transformed);
      setIsTyping(true);
      
    } catch (error) {
      console.error('Ошибка при обработке текста:', error);
      setOutputText('Произошла ошибка при обработке текста. Пожалуйста, попробуйте снова.');
      setIsTyping(false);
    } finally {
      setIsProcessing(false);
    }
  };


  const handleTransform = () => {
    processText();
  };


  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  const skipAnimation = () => {
    setDisplayedText(outputText);
    setIsTyping(false);
  };


  const runTests = () => {
    setDebugging(true);
    

    const results = examples.map(example => {
      return {
        original: example,
        transformed: transformText(example)
      };
    });
    
    console.table(results);
    alert(`Тестирование завершено. Результаты в консоли разработчика.`);
    
    setDebugging(false);
  };


  const toggleDebug = () => {
    setDebugging(!debugging);
  };

  return (
    <div className="min-h-screen pb-28 pt-16">
      {}
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 gradient-animate -z-10"></div>
      
      {}
      <div className="fixed inset-0 overflow-hidden -z-5">
        <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-3xl"></div>
        <div className="absolute top-[40%] -left-[5%] w-[30%] h-[30%] rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-3xl"></div>
        <div className="absolute -bottom-[10%] right-[30%] w-[35%] h-[35%] rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Преобразователь сленга</h1>
          <p className="text-white/70">Замените молодежный сленг на литературный русский язык</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Текст со сленгом</h2>
            </div>
            <textarea
              className="w-full h-48 bg-white/5 text-white border border-white/10 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Введите текст со сленговыми выражениями..."
              value={inputText}
              onChange={handleInputChange}
            ></textarea>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full hover:from-pink-600 hover:to-purple-700 transition-all flex items-center"
                onClick={handleTransform}
                disabled={isProcessing || !inputText}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="animate-spin mr-2" size={18} />
                    Обработка...
                  </>
                ) : (
                  'Преобразовать текст'
                )}
              </button>
              
              <button
                className="text-white/70 hover:text-white border border-white/20 px-3 py-2 rounded-full hover:bg-white/5 transition-all"
                onClick={() => runTests()}
              >
                Запустить тесты
              </button>

              {}
              <div className="text-white/70 border border-white/20 px-3 py-2 rounded-full flex items-center gap-2">
                <span>Скорость:</span>
                <button 
                  className={`px-2 rounded ${typingSpeed === 10 ? 'bg-pink-500 text-white' : 'bg-white/10'}`}
                  onClick={() => changeTypingSpeed(10)}
                >
                  Быстро
                </button>
                <button 
                  className={`px-2 rounded ${typingSpeed === 30 ? 'bg-pink-500 text-white' : 'bg-white/10'}`}
                  onClick={() => changeTypingSpeed(30)}
                >
                  Средне
                </button>
                <button 
                  className={`px-2 rounded ${typingSpeed === 60 ? 'bg-pink-500 text-white' : 'bg-white/10'}`}
                  onClick={() => changeTypingSpeed(60)}
                >
                  Медленно
                </button>
              </div>
            </div>
          </div>

          {}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Литературный текст</h2>
              <div className="flex items-center gap-2">
                {isTyping && (
                  <button
                    className="text-white/70 hover:text-white flex items-center"
                    onClick={skipAnimation}
                  >
                    Пропустить анимацию
                  </button>
                )}
                {outputText && (
                  <button
                    className="text-white/70 hover:text-white flex items-center"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <>
                        <Check size={16} className="mr-1" />
                        Скопировано
                      </>
                    ) : (
                      <>
                        <Copy size={16} className="mr-1" />
                        Копировать
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            {outputText ? (
              <div className="w-full h-48 bg-white/5 text-white border border-white/10 rounded-lg p-4 overflow-auto">
                {displayedText}
                {isTyping && <span className="inline-block w-2 h-4 bg-pink-500 ml-1 animate-pulse"></span>}
              </div>
            ) : (
              <div className="w-full h-48 bg-white/5 text-white/50 border border-white/10 rounded-lg p-4 flex items-center justify-center">
                Здесь появится преобразованный текст...
              </div>
            )}
          </div>
        </div>

        {}
        <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-3">Готовые примеры (нажмите для вставки):</h3>
          <div className="flex flex-wrap gap-2">
            {examples.map((example, index) => (
              <button
                key={index}
                className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm border border-white/10"
                onClick={() => loadExample(example)}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {}
        <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Как это работает</h2>
          <p className="text-white/80 mb-4">
            Данный инструмент анализирует ваш текст, находит сленговые выражения и заменяет их на литературные эквиваленты с учетом контекста и правил русского языка.
          </p>

          <h3 className="text-lg font-semibold text-white mt-6 mb-2">Примеры преобразования:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-pink-500 mb-1">Со сленгом:</p>
              <p className="text-white">У меня краш на этого актёра, но я не хочу об этом рофлить.</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-green-400 mb-1">Литературный язык:</p>
              <p className="text-white">У меня объект обожания на этого актёра, но я не хочу об этом шутить.</p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-pink-500 mb-1">Со сленгом:</p>
              <p className="text-white">Мы чиллим в этом месте из-за хорошего вайба.</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-green-400 mb-1">Литературный язык:</p>
              <p className="text-white">Мы отдыхаем в этом месте из-за хорошей атмосферы.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextPage; 