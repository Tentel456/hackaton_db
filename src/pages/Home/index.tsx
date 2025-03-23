import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Mic, 
  Globe2, 
  Shield, 
  Sliders, 
  MessageSquare, 
  ChevronRight, 
  ChevronDown, 
  Github,
  ArrowRight
} from 'lucide-react';

const Home: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  const [showFaq, setShowFaq] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const faqs = [
    {
      question: "Что такое молодежный сленг?",
      answer: "Молодежный сленг - это особый набор слов и выражений, используемых преимущественно молодым поколением, который отличается от стандартного языка и постоянно обновляется."
    },
    {
      question: "Как работает распознавание речи?",
      answer: "Приложение использует Web Speech API для преобразования голоса в текст, затем анализирует текст и находит сленговые выражения с помощью постоянно обновляемой базы данных."
    },
    {
      question: "Нужно ли мне создавать аккаунт?",
      answer: "Да, создание аккаунта необходимо для использования всех функций приложения, включая сохранение истории переводов и персонализированные настройки."
    },
    {
      question: "Поддерживаются ли другие языки?",
      answer: "В настоящий момент приложение специализируется на русском молодежном сленге, но мы планируем добавить поддержку других языков в будущем."
    }
  ];

  return (
    <div className="relative overflow-hidden">
      {}
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 gradient-animate -z-10"></div>
      
      {}
      <div className="fixed inset-0 overflow-hidden -z-5">
        <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-3xl"></div>
        <div className="absolute top-[40%] -left-[5%] w-[30%] h-[30%] rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-3xl"></div>
        <div className="absolute -bottom-[10%] right-[30%] w-[35%] h-[35%] rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl"></div>
      </div>

      {}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="flex flex-shrink-0 items-center text-gradient-primary text-xl font-bold">
                Slangario
              </span>
            </div>

            {}
            <div className="flex items-center md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white p-2 rounded-md hover:bg-white/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {}
            <div className="hidden md:flex items-center space-x-4">
              {currentUser ? (
                <>
                  <Link 
                    to="/speech" 
                    className="text-white hover:text-pink-100 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Распознавание
                  </Link>
                  <Link 
                    to="/translate" 
                    className="text-white hover:text-pink-100 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Перевод
                  </Link>
                  <Link 
                    to="/profile" 
                    className="text-white hover:text-pink-100 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Профиль
                  </Link>
                  <button 
                    onClick={() => logout()} 
                    className="ml-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-all"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-white hover:text-pink-100 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Войти
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-all"
                  >
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        {}
        {isMenuOpen && (
          <div className="md:hidden bg-white/10 backdrop-blur-md border-b border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {currentUser ? (
                <>
                  <Link 
                    to="/speech" 
                    className="text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Распознавание
                  </Link>
                  <Link 
                    to="/translate" 
                    className="text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Перевод
                  </Link>
                  <Link 
                    to="/profile" 
                    className="text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Профиль
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }} 
                    className="w-full text-left text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Войти
                  </Link>
                  <Link 
                    to="/register" 
                    className="text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {}
      <main className="pt-16 pb-24">
        {}
        <section className="relative pt-16 pb-20 md:pt-20 md:pb-28 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              {}
              <div className="flex flex-col space-y-8 max-w-xl">
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold text-white leading-tight">
                    Сленг больше <span className="text-gradient-primary">не проблема</span> для понимания
                  </h1>
                  <p className="text-lg md:text-xl text-white/80 mt-6">
                    Мгновенно распознавайте современный молодежный сленг и получайте понятный перевод с помощью технологий искусственного интеллекта.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  {currentUser ? (
                    <Link 
                      to="/speech" 
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-full hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                    >
                      Начать распознавание
                      <ArrowRight size={18} />
                    </Link>
                  ) : (
                    <>
                      <Link 
                        to="/register" 
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-full hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                      >
                        Начать бесплатно
                        <ArrowRight size={18} />
                      </Link>
                      <Link 
                        to="/login" 
                        className="flex items-center justify-center px-6 py-3 bg-white/10 backdrop-blur text-white font-medium rounded-full hover:bg-white/20 transition-all"
                      >
                        У меня уже есть аккаунт
                      </Link>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-4 pt-6">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br ${
                        i === 0 ? 'from-blue-400 to-blue-600' :
                        i === 1 ? 'from-pink-400 to-purple-600' :
                        i === 2 ? 'from-green-400 to-teal-600' :
                        'from-orange-400 to-red-600'
                      }`}></div>
                    ))}
                  </div>
                  <div className="text-white">
                    <div className="font-semibold">3 пользователя (да-да)</div>
                    <div className="text-white/70 text-sm">уже пользуются приложением)</div>
                  </div>
                </div>
              </div>

              {}
              <div className="hidden lg:flex justify-center items-center">
                <div className="relative w-full max-w-md">
                  {}
                  <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-3xl shadow-lg p-8 border border-white/20 hover-scale">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl">
                        <Mic className="text-white" size={24} />
                      </div>
                      <h3 className="text-xl font-semibold text-white">Распознавание сленга</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-3 bg-white/5 rounded-xl">
                        <p className="text-white/90 italic">"На чиле я крашнулся в эту девчонку, но забил, потому что зашквар."</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full">сленг</span>
                          <span className="text-white font-medium">на чиле</span>
                          <span className="text-white/70">— в расслабленном состоянии</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full">сленг</span>
                          <span className="text-white font-medium">крашнулся</span>
                          <span className="text-white/70">— влюбился</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full">сленг</span>
                          <span className="text-white font-medium">забил</span>
                          <span className="text-white/70">— перестал обращать внимание</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full">сленг</span>
                          <span className="text-white font-medium">зашквар</span>
                          <span className="text-white/70">— неприемлемая ситуация</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl -z-10"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {}
        <section className="py-16 px-4" id="features">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Все, что вам нужно для понимания <span className="text-gradient-primary">современного сленга</span>
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Наше приложение использует передовые технологии для мгновенного распознавания и перевода молодежного сленга
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <Mic className="text-white" size={24} />,
                  title: "Распознавание речи",
                  description: "Преобразуйте речь в текст всего за секунды с помощью встроенных технологий распознавания",
                  gradient: "from-pink-400 to-purple-600"
                },
                {
                  icon: <Globe2 className="text-white" size={24} />,
                  title: "Современный словарь",
                  description: "Постоянно обновляемая база сленговых выражений, отражающая самые последние тенденции",
                  gradient: "from-cyan-400 to-blue-600"
                },
                {
                  icon: <Shield className="text-white" size={24} />,
                  title: "Надежная защита",
                  description: "Ваши данные в безопасности благодаря современным методам шифрования и аутентификации",
                  gradient: "from-green-400 to-teal-600"
                },
                {
                  icon: <Sliders className="text-white" size={24} />,
                  title: "Гибкие настройки",
                  description: "Настраивайте приложение под ваши предпочтения и выбирайте удобный для вас режим работы",
                  gradient: "from-orange-400 to-red-600"
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="glass-effect p-6 rounded-2xl hover-scale backdrop-blur-sm bg-white/10 text-white border border-white/20"
                  style={{
                    transform: `translateY(${scrollY > 300 ? 0 : 50}px)`,
                    opacity: scrollY > 300 ? 1 : 0,
                    transition: `transform 0.6s ease ${index * 0.1}s, opacity 0.6s ease ${index * 0.1}s`
                  }}
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                  <p className="text-white/80">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {}
        <section className="py-16 px-4" id="how-it-works">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Как работает <span className="text-gradient-primary">Slangario</span>
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Простой процесс в три шага для понимания сленга
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Запишите или введите текст",
                  description: "Используйте микрофон для записи речи или введите текст вручную в приложении",
                  icon: <Mic className="text-white" size={40} />
                },
                {
                  step: "02",
                  title: "Мгновенный анализ",
                  description: "Наш алгоритм автоматически обнаруживает сленговые выражения в тексте",
                  icon: <MessageSquare className="text-white" size={40} />
                },
                {
                  step: "03",
                  title: "Получите перевод",
                  description: "Сленговые слова выделяются и сопровождаются понятным объяснением",
                  icon: <Globe2 className="text-white" size={40} />
                }
              ].map((step, index) => (
                <div 
                  key={index}
                  className="relative glass-effect p-8 rounded-2xl hover-scale backdrop-blur-sm bg-white/10 text-white border border-white/20"
                  style={{
                    transform: `translateY(${scrollY > 800 ? 0 : 50}px)`,
                    opacity: scrollY > 800 ? 1 : 0,
                    transition: `transform 0.6s ease ${index * 0.1}s, opacity 0.6s ease ${index * 0.1}s`
                  }}
                >
                  <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center font-bold text-white">
                    {step.step}
                  </div>
                  <div className="text-center mb-6">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white text-center">{step.title}</h3>
                  <p className="text-white/80 text-center">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {}
        <section className="py-16 px-4" id="faq">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Часто задаваемые <span className="text-gradient-primary">вопросы</span>
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Ответы на наиболее распространенные вопросы о нашем приложении
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index}
                  className="glass-effect rounded-xl backdrop-blur-sm bg-white/10 border border-white/20 overflow-hidden"
                >
                  <button 
                    className="w-full p-6 text-left flex justify-between items-center focus:outline-none"
                    onClick={() => setShowFaq(showFaq === index ? null : index)}
                  >
                    <h3 className="text-lg font-medium text-white">{faq.question}</h3>
                    <div className={`transition-transform duration-300 ${showFaq === index ? 'rotate-180' : ''}`}>
                      <ChevronDown className="text-white" size={20} />
                    </div>
                  </button>
                  <div 
                    className={`overflow-hidden transition-all duration-300 ${
                      showFaq === index ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="p-6 pt-0 text-white/80 border-t border-white/10">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto glass-effect p-12 rounded-3xl backdrop-blur-lg bg-white/10 border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-gradient-to-r from-pink-500/30 to-purple-600/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Готовы начать понимать современный сленг?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Присоединяйтесь к тысячам пользователей, которые уже используют наше приложение для понимания молодежного сленга
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {currentUser ? (
                  <Link 
                    to="/speech" 
                    className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-full hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    Начать использовать
                    <ArrowRight size={18} />
                  </Link>
                ) : (
                  <>
                    <Link 
                      to="/register" 
                      className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-full hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      Зарегистрироваться бесплатно
                      <ArrowRight size={18} />
                    </Link>
                    <Link 
                      to="/login" 
                      className="px-8 py-4 bg-white/10 backdrop-blur text-white font-medium rounded-full hover:bg-white/20 transition-all flex items-center justify-center"
                    >
                      У меня уже есть аккаунт
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {}
      <footer className="bg-white/5 backdrop-blur-md border-t border-white/10 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gradient-primary">Slangario</h3>
              <p className="text-white/70">
                Мгновенное распознавание и перевод молодежного сленга с помощью искусственного интеллекта
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Навигация</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-white/70 hover:text-white transition-colors">Возможности</a></li>
                <li><a href="#how-it-works" className="text-white/70 hover:text-white transition-colors">Как это работает</a></li>
                <li><a href="#faq" className="text-white/70 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Аккаунт</h3>
              <ul className="space-y-2">
                {currentUser ? (
                  <>
                    <li><Link to="/profile" className="text-white/70 hover:text-white transition-colors">Мой профиль</Link></li>
                    <li><Link to="/speech" className="text-white/70 hover:text-white transition-colors">Распознавание речи</Link></li>
                    <li><Link to="/translate" className="text-white/70 hover:text-white transition-colors">Перевод сленга</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link to="/login" className="text-white/70 hover:text-white transition-colors">Войти</Link></li>
                    <li><Link to="/register" className="text-white/70 hover:text-white transition-colors">Зарегистрироваться</Link></li>
                  </>
                )}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Контакты</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <a 
                    href="https://github.com/Tentel456/hackaton_db" 
                    className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github size={16} />
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/50">
              &copy; 2025 Slangario. Все права защищены. (типо официально)
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a 
                href="#" 
                className="text-white/50 hover:text-white transition-colors"
              >
                Политика конфиденциальности
              </a>
              <a 
                href="#" 
                className="text-white/50 hover:text-white transition-colors"
              >
                Условия использования
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 