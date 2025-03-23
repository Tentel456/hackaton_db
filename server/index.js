import express from 'express';
import cors from 'cors';
import { 
  slangDictionary,
  getAllSlangWords, 
  translateText, 
  findSuggestions, 
  isSlangWord, 
  getExplanation, 
  searchWord 
} from './data/slangDictionary.js';

const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors());
app.use(express.json());


app.get('/api/status', (req, res) => {
  res.json({ status: 'online', message: 'Сервер работает корректно' });
});


app.get('/api/health', (req, res) => {
  res.json({ status: 'online', message: 'Сервер работает корректно' });
});


app.get('/api/dictionary', (req, res) => {
  try {
    const dictionary = getAllSlangWords();
    res.json(dictionary);
  } catch (error) {
    console.error('Ошибка при получении словаря:', error);
    res.status(500).json({ 
      error: 'Произошла ошибка при получении словаря сленгов' 
    });
  }
});


app.post('/api/translate', (req, res) => {
  const { text, mode = 'replace' } = req.body;
  
  if (!text) {
    return res.status(400).json({ 
      error: 'Отсутствует текст для перевода' 
    });
  }
  
  try {
    console.log(`Запрос на перевод: "${text}" в режиме "${mode}"`);
    
    const translated = translateText(text, mode);
    console.log(`Результат перевода: "${translated}"`);
    
    res.json({ 
      original: text, 
      translated,
      mode
    });
  } catch (error) {
    console.error('Ошибка перевода:', error);
    res.status(500).json({ 
      error: 'Произошла ошибка при переводе текста' 
    });
  }
});


app.get('/api/suggestions', (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ 
      error: 'Отсутствует поисковый запрос' 
    });
  }
  
  try {
    const suggestions = findSuggestions(query);
    res.json({ suggestions });
  } catch (error) {
    console.error('Ошибка поиска:', error);
    res.status(500).json({ 
      error: 'Произошла ошибка при поиске подсказок' 
    });
  }
});


app.get('/api/search', (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Поисковый запрос не указан' });
  }
  
  const suggestions = findSuggestions(query);
  res.json(suggestions);
});


app.get('/api/check', (req, res) => {
  const { word } = req.query;
  
  if (!word) {
    return res.status(400).json({ error: 'Слово не указано' });
  }
  
  const isSlang = isSlangWord(word);
  const explanation = isSlang ? getExplanation(word) : null;
  
  res.json({ isSlang, explanation });
});


app.get('/api/word', (req, res) => {
  const { word } = req.query;
  
  if (!word) {
    return res.status(400).json({ error: 'Слово не указан' });
  }
  
  const result = searchWord(word);
  res.json(result);
});


app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Словарь сленгов (${Object.keys(slangDictionary).length} слов) загружен из файла slangDictionary.js`);
  console.log(`Доступны эндпоинты:`);
  console.log(`- GET /api/status`);
  console.log(`- GET /api/health`);
  console.log(`- GET /api/dictionary`);
  console.log(`- POST /api/translate`);
  console.log(`- GET /api/suggestions`);
  console.log(`- GET /api/search`);
  console.log(`- GET /api/check`);
  console.log(`- GET /api/word`);
}); 