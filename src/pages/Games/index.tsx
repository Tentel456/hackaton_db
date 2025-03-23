import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, BookOpen, Zap, ArrowRight, HelpCircle, ThumbsUp, ThumbsDown } from 'lucide-react';


type GameType = 'quiz' | 'cards' | 'howWouldYouSay' | null;


const slangExamples = [
  { slang: 'краш', meaning: 'объект обожания, влюбленности', example: 'У меня краш на главного героя этого сериала.' },
  { slang: 'рофлить', meaning: 'смеяться, шутить', example: 'Хватит рофлить, у нас серьезный разговор.' },
  { slang: 'кринж', meaning: 'что-то неловкое, стыдное', example: 'Это выступление было таким кринжем.' },
  { slang: 'чиллить', meaning: 'расслабляться, отдыхать', example: 'Сегодня буду весь день дома чиллить.' },
  { slang: 'зашквар', meaning: 'что-то неприемлемое, позорное', example: 'Носить такую одежду - это зашквар.' },
  { slang: 'агриться', meaning: 'злиться, раздражаться', example: 'Не надо агриться из-за такой мелочи.' },
  { slang: 'токсик', meaning: 'неприятный, негативный человек', example: 'Он такой токсик, постоянно всех осуждает.' },
  { slang: 'хейтить', meaning: 'выражать неприязнь, критиковать', example: 'Зачем хейтить артиста, если тебе не нравится его музыка?' },
  { slang: 'флексить', meaning: 'хвастаться, показывать превосходство', example: 'Он любит флексить своими новыми кроссовками.' },
  { slang: 'вайб', meaning: 'атмосфера, настроение', example: 'В этом кафе хороший вайб.' }
];


const quizQuestions = [
  {
    question: 'Что означает слово "краш"?',
    options: [
      'объект обожания, влюбленности',
      'что-то смешное',
      'усталость, истощение',
      'модная вещь'
    ],
    correctAnswer: 0
  },
  {
    question: 'Что означает фраза "чиллить весь день"?',
    options: [
      'работать весь день',
      'гулять весь день',
      'расслабляться, отдыхать весь день',
      'учиться весь день'
    ],
    correctAnswer: 2
  },
  {
    question: 'Что такое "кринж"?',
    options: [
      'модный тренд',
      'что-то неловкое, стыдное',
      'крутая вещица',
      'неприятный человек'
    ],
    correctAnswer: 1
  },
  {
    question: 'Что значит "флексить"?',
    options: [
      'заниматься спортом',
      'лениться',
      'хвастаться, показывать превосходство',
      'экономить деньги'
    ],
    correctAnswer: 2
  },
  {
    question: 'Что означает фраза "Не надо агриться"?',
    options: [
      'Не надо спешить',
      'Не надо обманывать',
      'Не надо расстраиваться',
      'Не надо злиться, раздражаться'
    ],
    correctAnswer: 3
  }
];


const howWouldYouSayExamples = [
  {
    standard: 'Мне очень нравится этот актёр',
    slang: 'У меня краш на этого актёра'
  },
  {
    standard: 'Это выступление было очень неловким',
    slang: 'Это выступление было таким кринжем'
  },
  {
    standard: 'Сегодня я планирую просто отдыхать дома',
    slang: 'Сегодня буду весь день дома чиллить'
  },
  {
    standard: 'Не злись из-за такой мелочи',
    slang: 'Не агрись из-за такой мелочи'
  },
  {
    standard: 'В этом кафе приятная атмосфера',
    slang: 'В этом кафе хороший вайб'
  }
];

const GamesPage: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<GameType>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentHowWouldYouSay, setCurrentHowWouldYouSay] = useState(0);
  const [userAnswered, setUserAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);


  const handleQuizAnswer = (selectedOption: number) => {
    if (selectedOption === quizQuestions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < quizQuestions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowResult(true);
    }
  };


  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
  };


  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCard((currentCard + 1) % slangExamples.length);
  };


  const handleHowWouldYouSayAnswer = (isSlang: boolean) => {
    const isAnswerCorrect = isSlang;
    setIsCorrect(isAnswerCorrect);
    setUserAnswered(true);
    

    setTimeout(() => {
      setUserAnswered(false);
      setCurrentHowWouldYouSay((currentHowWouldYouSay + 1) % howWouldYouSayExamples.length);
    }, 1500);
  };


  const resetGame = () => {
    setSelectedGame(null);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setCurrentCard(0);
    setIsFlipped(false);
    setCurrentHowWouldYouSay(0);
    setUserAnswered(false);
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
          <h1 className="text-3xl font-bold text-white mb-2">Игры со сленгом</h1>
          <p className="text-white/70">Проверьте свои знания молодежного сленга в увлекательных мини-играх</p>
        </div>

        {}
        {!selectedGame ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {}
            <div 
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all cursor-pointer hover:shadow-lg"
              onClick={() => setSelectedGame('quiz')}
            >
              <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                <Trophy className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Тест на знание сленга</h3>
              <p className="text-white/70 mb-4">Проверьте свои знания современного молодежного сленга</p>
              <button className="flex items-center text-white/80 hover:text-white">
                <span>Начать</span>
                <ArrowRight size={16} className="ml-1" />
              </button>
            </div>

            {}
            <div 
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all cursor-pointer hover:shadow-lg"
              onClick={() => setSelectedGame('cards')}
            >
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4">
                <BookOpen className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Карточки сленга</h3>
              <p className="text-white/70 mb-4">Изучайте сленг с помощью интерактивных карточек</p>
              <button className="flex items-center text-white/80 hover:text-white">
                <span>Начать</span>
                <ArrowRight size={16} className="ml-1" />
              </button>
            </div>

            {}
            <div 
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all cursor-pointer hover:shadow-lg"
              onClick={() => setSelectedGame('howWouldYouSay')}
            >
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4">
                <HelpCircle className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Как бы ты сказал?</h3>
              <p className="text-white/70 mb-4">Определите, какие фразы используют молодежный сленг</p>
              <button className="flex items-center text-white/80 hover:text-white">
                <span>Начать</span>
                <ArrowRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            {}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">
                {selectedGame === 'quiz' && 'Тест на знание сленга'}
                {selectedGame === 'cards' && 'Карточки сленга'}
                {selectedGame === 'howWouldYouSay' && 'Как бы ты сказал?'}
              </h2>
              <button 
                onClick={resetGame}
                className="text-white/70 hover:text-white text-sm"
              >
                Вернуться к списку игр
              </button>
            </div>

            {}
            {selectedGame === 'quiz' && (
              <div>
                {showResult ? (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Trophy className="text-white" size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Результаты</h3>
                    <p className="text-white/80 mb-4">
                      Вы правильно ответили на {score} из {quizQuestions.length} вопросов!
                    </p>
                    <div className="w-full bg-white/10 rounded-full h-4 mb-6">
                      <div 
                        className="bg-gradient-to-r from-pink-500 to-purple-600 h-4 rounded-full"
                        style={{ width: `${(score / quizQuestions.length) * 100}%` }}
                      ></div>
                    </div>
                    <button 
                      onClick={() => {
                        setCurrentQuestion(0);
                        setScore(0);
                        setShowResult(false);
                      }}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full hover:from-pink-600 hover:to-purple-700 transition-all"
                    >
                      Пройти тест еще раз
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-white/70">Вопрос {currentQuestion + 1} из {quizQuestions.length}</span>
                      <span className="text-white/70">Счет: {score}</span>
                    </div>
                    <div className="mb-6">
                      <h3 className="text-xl font-medium text-white mb-4">{quizQuestions[currentQuestion].question}</h3>
                      <div className="space-y-3">
                        {quizQuestions[currentQuestion].options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleQuizAnswer(index)}
                            className="w-full text-left p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-white/90 transition-colors"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {}
            {selectedGame === 'cards' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white/70">Карточка {currentCard + 1} из {slangExamples.length}</span>
                </div>
                <div 
                  className={`relative w-full h-64 perspective cursor-pointer mb-6 ${isFlipped ? 'rotate-y-180' : ''}`}
                  onClick={handleCardFlip}
                >
                  <div className={`absolute w-full h-full rounded-xl p-6 transform transition-all duration-500 backface-hidden ${isFlipped ? 'rotate-y-180 opacity-0' : ''}`}>
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 w-full h-full rounded-xl flex items-center justify-center shadow-xl">
                      <h3 className="text-3xl font-bold text-white">{slangExamples[currentCard].slang}</h3>
                    </div>
                  </div>
                  <div className={`absolute w-full h-full rounded-xl p-6 transform transition-all duration-500 backface-hidden ${isFlipped ? '' : 'rotate-y-180 opacity-0'}`}>
                    <div className="bg-white/10 backdrop-blur-md w-full h-full rounded-xl p-6 flex flex-col justify-center border border-white/20">
                      <h4 className="text-xl font-bold text-white mb-2">{slangExamples[currentCard].slang}</h4>
                      <p className="text-white/80 mb-3">{slangExamples[currentCard].meaning}</p>
                      <p className="text-white/60 italic">Пример: "{slangExamples[currentCard].example}"</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center space-x-4">
                  <button 
                    onClick={handleCardFlip}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                  >
                    {isFlipped ? 'Показать слово' : 'Показать значение'}
                  </button>
                  <button 
                    onClick={handleNextCard}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-full hover:from-green-600 hover:to-teal-700 transition-all"
                  >
                    Следующая карточка
                  </button>
                </div>
              </div>
            )}

            {}
            {selectedGame === 'howWouldYouSay' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white/70">Фраза {currentHowWouldYouSay + 1} из {howWouldYouSayExamples.length}</span>
                </div>
                <div className="mb-6">
                  <h3 className="text-xl font-medium text-white mb-6">Которая из фраз использует молодежный сленг?</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <button
                      onClick={() => handleHowWouldYouSayAnswer(false)}
                      disabled={userAnswered}
                      className={`p-5 rounded-xl border text-left transition-all ${
                        userAnswered 
                          ? isCorrect ? 'bg-white/5 border-white/10 text-white/50' : 'bg-red-500/20 border-red-500/30 text-white'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                      }`}
                    >
                      {howWouldYouSayExamples[currentHowWouldYouSay].standard}
                      {userAnswered && !isCorrect && (
                        <span className="flex items-center mt-2 text-white/80">
                          <ThumbsDown size={16} className="mr-1" /> Это стандартная фраза без сленга
                        </span>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleHowWouldYouSayAnswer(true)}
                      disabled={userAnswered}
                      className={`p-5 rounded-xl border text-left transition-all ${
                        userAnswered 
                          ? isCorrect ? 'bg-green-500/20 border-green-500/30 text-white' : 'bg-white/5 border-white/10 text-white/50'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                      }`}
                    >
                      {howWouldYouSayExamples[currentHowWouldYouSay].slang}
                      {userAnswered && isCorrect && (
                        <span className="flex items-center mt-2 text-white/80">
                          <ThumbsUp size={16} className="mr-1" /> Правильно! Это фраза со сленгом
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GamesPage; 