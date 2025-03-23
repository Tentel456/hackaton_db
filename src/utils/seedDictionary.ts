import { collection, doc, setDoc, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../firebase/config';


interface SlangWord {
  word: string;
  meaning: string;
  example?: string;
  category?: string;
}


const initialDictionary: SlangWord[] = [
  {
    word: 'Агриться',
    meaning: 'Злиться, раздражаться, выражать агрессию',
    example: 'Не агрись из-за такого пустяка!',
    category: 'Геймерский сленг'
  },
  {
    word: 'Бан',
    meaning: 'Временное или постоянное блокирование доступа к ресурсу',
    example: 'За нарушение правил он получил бан на форуме',
    category: 'Интернет'
  },
  {
    word: 'Вайб',
    meaning: 'Атмосфера, настроение, энергетика',
    example: 'Здесь такой приятный вайб',
    category: 'Общение'
  },
  {
    word: 'Го',
    meaning: 'Призыв к действию (от англ. go - идти)',
    example: 'Го в кино вечером!',
    category: 'Общение'
  },
  {
    word: 'Душнила',
    meaning: 'Человек, который слишком серьёзен, зануден или раздражает придирками',
    example: 'Не будь душнилой, это же просто шутка!',
    category: 'Общение'
  },
  {
    word: 'Зашквар',
    meaning: 'Что-то неприемлемое, позорное или неуместное',
    example: 'Носить такую одежду сейчас – полный зашквар',
    category: 'Общение'
  },
  {
    word: 'Изи',
    meaning: 'Легко, просто (от англ. easy)',
    example: 'Этот тест был изи для меня',
    category: 'Общение'
  },
  {
    word: 'Краш',
    meaning: 'Объект обожания, романтической симпатии',
    example: 'Она мой краш уже год',
    category: 'Отношения'
  },
  {
    word: 'Кринж',
    meaning: 'Что-то крайне неловкое, вызывающее смущение или стыд (от англ. cringe)',
    example: 'Его танец был настоящим кринжем',
    category: 'Эмоции'
  },
  {
    word: 'Лойс',
    meaning: 'Лайк, положительная оценка (от англ. like)',
    example: 'Поставь лойс, если согласен',
    category: 'Социальные сети'
  },
  {
    word: 'Рофл',
    meaning: 'Шутка, нечто смешное (от англ. ROFL - Rolling On Floor Laughing)',
    example: 'Это был просто рофл, не воспринимай всерьёз',
    category: 'Юмор'
  },
  {
    word: 'Токсик',
    meaning: 'Агрессивный, неприятный в общении человек',
    example: 'Он такой токсик в командных играх',
    category: 'Общение'
  },
  {
    word: 'Флексить',
    meaning: 'Хвастаться, демонстрировать своё превосходство или достижения',
    example: 'Он флексит своей новой машиной',
    category: 'Поведение'
  },
  {
    word: 'Хайп',
    meaning: 'Ажиотаж, повышенное внимание к чему-либо (от англ. hype)',
    example: 'Вокруг этого фильма подняли такой хайп',
    category: 'Медиа'
  },
  {
    word: 'Чекать',
    meaning: 'Смотреть, проверять (от англ. check)',
    example: 'Чекни свои сообщения, я тебе написал',
    category: 'Общение'
  },
  {
    word: 'Шеймить',
    meaning: 'Публично осуждать, стыдить кого-то (от англ. shame)',
    example: 'Не нужно шеймить людей за их предпочтения',
    category: 'Социальное взаимодействие'
  },
  {
    word: 'Эщкере',
    meaning: 'Выражение восторга или призыва к действию (искажённое "Let\'s get it")',
    example: 'Эщкере на концерт!',
    category: 'Выражения'
  },
  {
    word: 'Юзать',
    meaning: 'Использовать (от англ. use)',
    example: 'Я не юзаю эту программу',
    category: 'Технологии'
  },
  {
    word: 'Я в моменте',
    meaning: 'Состояние полного присутствия и наслаждения текущим моментом',
    example: 'Не отвлекай, я в моменте',
    category: 'Состояния'
  },
  {
    word: 'Вкатиться',
    meaning: 'Начать заниматься чем-то, войти в тему',
    example: 'Хочу вкатиться в программирование',
    category: 'Хобби'
  }
];


export const seedDictionary = async (): Promise<boolean> => {
  try {
    // Проверяем, не заполнена ли уже коллекция
    const dictionaryRef = collection(db, 'slang_dictionary');
    const existingWords = await getDocs(query(dictionaryRef, limit(1)));
    
    if (!existingWords.empty) {
      console.log('Словарь уже содержит данные. Пропускаем заполнение.');
      return false;
    }
    

    for (const word of initialDictionary) {

      const wordId = word.word
        .toLowerCase()
        .replace(/[^а-яёa-z0-9]/gi, '')
        .trim();
      
      await setDoc(doc(dictionaryRef, wordId), {
        ...word,
        createdAt: new Date()
      });
    }
    
    console.log('Словарь успешно заполнен начальными данными');
    return true;
  } catch (error) {
    console.error('Ошибка при заполнении словаря:', error);
    return false;
  }
};


export const checkAndSeedDictionary = async (): Promise<void> => {
  try {

    const dictionaryRef = collection(db, 'slang_dictionary');
    const existingWords = await getDocs(query(dictionaryRef, limit(1)));
    
    if (existingWords.empty) {
      console.log('Словарь пуст. Заполняем начальными данными...');
      await seedDictionary();
    } else {
      console.log('Словарь уже содержит данные.');
    }
  } catch (error) {
    console.error('Ошибка при проверке словаря:', error);
  }
}; 