import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  Timestamp, 
  serverTimestamp,
  deleteField,
  enableNetwork,
  disableNetwork,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { v4 as uuidv4 } from 'uuid';
import { sha256 } from 'js-sha256';


interface ActivityItem {
  type: 'recognition' | 'translation';
  text: string;
  result?: string;
  timestamp: number; 
}


interface ApiKey {
  id: string;
  key: string;
  createdAt: Date;
  expiresAt: Date;
  lastUsed?: Date;
  description: string;
  rateLimit: {
    daily: number;
    monthly: number;
  }
}


interface UserStats {
  recognitions: number;
  translations: number;
 
  recentActivity: ActivityItem[];

  favoriteWords?: string[];

  needsSync?: boolean;
}


const LOCAL_STATS_KEY = 'app_user_stats';


interface AuthContextType {
  currentUser: User | null;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  userStats: UserStats | null;
  incrementRecognitions: (text: string, result?: string) => Promise<void>;
  incrementTranslations: (text: string, result?: string) => Promise<void>;
  loadUserStats: () => Promise<void>;
  isOnline: boolean;
  checkNetworkStatus: () => Promise<boolean>;
  loadApiKeys: () => Promise<ApiKey[]>;
  generateApiKey: (description: string) => Promise<ApiKey | null>;
  deleteApiKey: (keyId: string) => Promise<boolean>;
  addFavoriteWord: (word: string) => Promise<boolean>;
  removeFavoriteWord: (word: string) => Promise<boolean>;
  getFavoriteWords: () => Promise<string[]>;
  isFavoriteWord: (word: string) => boolean;
}


const defaultStats: UserStats = {
  recognitions: 0,
  translations: 0,
  recentActivity: [],
  favoriteWords: []
};


const AuthContext = createContext<AuthContextType | null>(null);


export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  
  return context;
};


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingSync, setPendingSync] = useState<boolean>(false);
  

  const saveStatsToLocalStorage = (stats: UserStats | null, userId: string) => {
    if (!stats) return;
    
    try {
      const localStats = {
        ...stats,
        needsSync: true,
        lastUpdated: Date.now()
      };
      localStorage.setItem(`${LOCAL_STATS_KEY}_${userId}`, JSON.stringify(localStats));
      console.log('Статистика сохранена локально');
    } catch (error) {
      console.error('Ошибка при сохранении статистики локально:', error);
    }
  };
  

  const loadStatsFromLocalStorage = (userId: string): UserStats | null => {
    try {
      const localStatsJson = localStorage.getItem(`${LOCAL_STATS_KEY}_${userId}`);
      if (localStatsJson) {
        const localStats = JSON.parse(localStatsJson);
        console.log('Статистика загружена из локального хранилища');
        return localStats;
      }
    } catch (error) {
      console.error('Ошибка при загрузке статистики из локального хранилища:', error);
    }
    return null;
  };
  

  useEffect(() => {
    const handleOnline = () => {
      console.log('Сеть доступна, восстанавливаем соединение с Firestore');
      setIsOnline(true);
      enableNetwork(db)
        .then(() => {
          
          if (currentUser && userStats?.needsSync) {
            setPendingSync(true);
            syncStatsWithServer();
          }
        })
        .catch(console.error);
    };
    
    const handleOffline = () => {
      console.log('Сеть недоступна, переходим в офлайн-режим');
      setIsOnline(false);
      disableNetwork(db).catch(console.error);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentUser, userStats]);
  

  const syncStatsWithServer = async () => {
    if (!currentUser || !userStats) return;
    
    console.log('Начинаем синхронизацию с сервером...');
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const serverData = userDoc.data();
        const serverStats = serverData.stats || { recognitions: 0, translations: 0, recentActivity: [], favoriteWords: [] };
        

        const newRecognitions = Math.max(serverStats.recognitions || 0, userStats.recognitions);
        const newTranslations = Math.max(serverStats.translations || 0, userStats.translations);
        

        const combinedActivities = [...userStats.recentActivity];
        if (serverStats.recentActivity && Array.isArray(serverStats.recentActivity)) {
          for (const serverActivity of serverStats.recentActivity) {

            const exists = combinedActivities.some(
              localAct => localAct.timestamp === serverActivity.timestamp && 
                          localAct.type === serverActivity.type &&
                          localAct.text === serverActivity.text
            );
            
            if (!exists) {
              combinedActivities.push(serverActivity);
            }
          }
        }
        

        const sortedActivities = combinedActivities
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 20);
        

        await updateDoc(userRef, {
          'stats.recognitions': newRecognitions,
          'stats.translations': newTranslations,
          'stats.recentActivity': sortedActivities,
          'stats.favoriteWords': serverStats.favoriteWords,
          lastSynced: serverTimestamp()
        });
        

        const syncedStats = {
          recognitions: newRecognitions,
          translations: newTranslations,
          recentActivity: sortedActivities,
          favoriteWords: serverStats.favoriteWords
        };
        
        setUserStats(syncedStats);
        

        localStorage.setItem(`${LOCAL_STATS_KEY}_${currentUser.uid}`, JSON.stringify({
          ...syncedStats,
          lastUpdated: Date.now()
        }));
        
        console.log('Синхронизация успешно завершена');
      } else {

        await setDoc(userRef, {
          email: currentUser.email,
          stats: {
            recognitions: userStats.recognitions,
            translations: userStats.translations,
            recentActivity: userStats.recentActivity,
            favoriteWords: userStats.favoriteWords
          },
          createdAt: serverTimestamp(),
          lastSynced: serverTimestamp()
        });
        

        localStorage.setItem(`${LOCAL_STATS_KEY}_${currentUser.uid}`, JSON.stringify({
          ...userStats,
          needsSync: false,
          lastUpdated: Date.now()
        }));
        
        console.log('Создан новый документ на сервере с локальными данными');
      }
      
      setPendingSync(false);
    } catch (error) {
      console.error('Ошибка при синхронизации с сервером:', error);
      setPendingSync(false);
    }
  };
  

  const checkNetworkStatus = async (): Promise<boolean> => {

    const networkStatus = navigator.onLine;
    setIsOnline(networkStatus);
    

    if (!networkStatus) {
      return false;
    }
    

    try {
      await getDoc(doc(db, 'system', 'status'));
      return true;
    } catch (error) {
      console.warn('Не удалось подключиться к Firestore:', error);
      return false;
    }
  };


  const initUserStats = async (userId: string) => {
    try {

      const localStats = loadStatsFromLocalStorage(userId);
      
      if (localStats) {
        setUserStats(localStats);
        console.log('Статистика загружена из локального хранилища');
        

        if (localStats.needsSync && isOnline) {
          syncStatsWithServer();
        }
        return;
      }
      

      if (!isOnline) {
        setUserStats(defaultStats);
        saveStatsToLocalStorage(defaultStats, userId);
        console.warn('Инициализирована пустая статистика в офлайн-режиме');
        return;
      }
      

      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.stats) {
          const serverStats = {
            recognitions: data.stats.recognitions || 0,
            translations: data.stats.translations || 0,
            recentActivity: data.stats.recentActivity || [],
            favoriteWords: data.stats.favoriteWords || []
          };
          
          setUserStats(serverStats);

          localStorage.setItem(`${LOCAL_STATS_KEY}_${userId}`, JSON.stringify({
            ...serverStats,
            lastUpdated: Date.now()
          }));
        } else {

          const newStats = defaultStats;
          await updateDoc(userRef, {
            stats: newStats
          });
          
          setUserStats(newStats);
          localStorage.setItem(`${LOCAL_STATS_KEY}_${userId}`, JSON.stringify({
            ...newStats,
            lastUpdated: Date.now()
          }));
        }
      } else {

        await setDoc(userRef, {
          email: currentUser?.email,
          createdAt: serverTimestamp(),
          stats: defaultStats
        });
        
        setUserStats(defaultStats);
        localStorage.setItem(`${LOCAL_STATS_KEY}_${userId}`, JSON.stringify({
          ...defaultStats,
          lastUpdated: Date.now()
        }));
      }
    } catch (error) {
      console.error('Ошибка при инициализации статистики:', error);
      

      setUserStats(defaultStats);
      saveStatsToLocalStorage(defaultStats, userId);
    }
  };


  const loadUserStats = async () => {
    if (!currentUser) return;
    
    try {

      const localStats = loadStatsFromLocalStorage(currentUser.uid);
      
      if (localStats) {
        setUserStats(localStats);
        console.log('Статистика загружена из локального хранилища');
        

        if (isOnline && localStats.needsSync) {
          syncStatsWithServer();
        }
        return;
      }
      

      if (!isOnline) {
        console.warn('Загрузка статистики с сервера невозможна: нет подключения к сети');
        setUserStats(defaultStats);
        saveStatsToLocalStorage(defaultStats, currentUser.uid);
        return;
      }
      

      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();

        if (data.stats) {
          const serverStats = {
            recognitions: data.stats.recognitions || 0,
            translations: data.stats.translations || 0,
            recentActivity: data.stats.recentActivity || [],
            favoriteWords: data.stats.favoriteWords || []
          };
          
          setUserStats(serverStats);

          localStorage.setItem(`${LOCAL_STATS_KEY}_${currentUser.uid}`, JSON.stringify({
            ...serverStats,
            lastUpdated: Date.now()
          }));
        } else {


          const oldStats = {
            recognitions: data.recognitionsCount || 0,
            translations: data.translationsCount || 0,
            recentActivity: [],
            favoriteWords: []
          };
          

          await updateDoc(userRef, {
            stats: oldStats
          });
          
          setUserStats(oldStats);

          localStorage.setItem(`${LOCAL_STATS_KEY}_${currentUser.uid}`, JSON.stringify({
            ...oldStats,
            lastUpdated: Date.now()
          }));
        }
      } else {

        await initUserStats(currentUser.uid);
      }
    } catch (error) {
      console.error('Ошибка при загрузке статистики:', error);
      

      const localStats = loadStatsFromLocalStorage(currentUser.uid);
      if (localStats) {
        setUserStats(localStats);
      } else {

        setUserStats(defaultStats);
        saveStatsToLocalStorage(defaultStats, currentUser.uid);
      }
      

      if (error instanceof Error && error.message.includes('offline')) {
        setIsOnline(false);
      }
    }
  };


  const incrementRecognitions = async (text: string, result?: string) => {
    if (!currentUser) return;
    
 
    const activityItem: ActivityItem = {
      type: 'recognition',
      text,
      result,
      timestamp: Date.now()
    };
    

    setUserStats(prevStats => {
      const currentRecognitions = prevStats?.recognitions || 0;
      const currentActivity = prevStats?.recentActivity || [];
      
      const updatedStats = {
        recognitions: currentRecognitions + 1,
        translations: prevStats?.translations || 0,
        recentActivity: [activityItem, ...currentActivity].slice(0, 20),
        favoriteWords: prevStats?.favoriteWords || [],
        needsSync: true
      };
      

      saveStatsToLocalStorage(updatedStats, currentUser.uid);
      
      return updatedStats;
    });
    

    if (!isOnline) {
      console.warn('Статистика распознаваний обновлена только локально из-за отсутствия сети');
      return;
    }

    try {

      const userDocRef = doc(db, 'users', currentUser.uid);
      

      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {

        const data = docSnap.data();
        const currentStats = data.stats || { recognitions: 0, translations: 0, recentActivity: [], favoriteWords: [] };
        const newRecognitions = (currentStats.recognitions || 0) + 1;
        

        const recentActivity = currentStats.recentActivity || [];
        

        const updatedActivity = [activityItem, ...recentActivity].slice(0, 20);
        
        await updateDoc(userDocRef, {
          'stats.recognitions': newRecognitions,
          'stats.recentActivity': updatedActivity,
          'stats.favoriteWords': currentStats.favoriteWords,
          lastUpdated: serverTimestamp()
        });
        

        setUserStats(prevStats => {
          if (!prevStats) return prevStats;
          
          const updatedStats = {
            ...prevStats,
            needsSync: false
          };
          

          localStorage.setItem(`${LOCAL_STATS_KEY}_${currentUser.uid}`, JSON.stringify({
            ...updatedStats,
            lastUpdated: Date.now()
          }));
          
          return updatedStats;
        });
      } else {

        await setDoc(userDocRef, {
          email: currentUser.email,
          stats: {
            recognitions: 1,
            translations: 0,
            recentActivity: [activityItem],
            favoriteWords: []
          },
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        });
        

        setUserStats(prevStats => {
          if (!prevStats) return prevStats;
          
          const updatedStats = {
            ...prevStats,
            needsSync: false
          };
          

          localStorage.setItem(`${LOCAL_STATS_KEY}_${currentUser.uid}`, JSON.stringify({
            ...updatedStats,
            lastUpdated: Date.now()
          }));
          
          return updatedStats;
        });
      }
    } catch (error) {
      console.error('Ошибка при обновлении статистики распознаваний:', error);

      if (error instanceof Error && error.message.includes('offline')) {
        setIsOnline(false);
      }
    }
  };


  const incrementTranslations = async (text: string, result?: string) => {
    if (!currentUser) return;
    

    const activityItem: ActivityItem = {
      type: 'translation',
      text,
      result,
      timestamp: Date.now()
    };
    
 
    setUserStats(prevStats => {
      const currentTranslations = prevStats?.translations || 0;
      const currentActivity = prevStats?.recentActivity || [];
      
      const updatedStats = {
        recognitions: prevStats?.recognitions || 0,
        translations: currentTranslations + 1,
        recentActivity: [activityItem, ...currentActivity].slice(0, 20),
        favoriteWords: prevStats?.favoriteWords || [],
        needsSync: true
      };
      

      saveStatsToLocalStorage(updatedStats, currentUser.uid);
      
      return updatedStats;
    });
    
 
    if (!isOnline) {
      console.warn('Статистика переводов обновлена только локально из-за отсутствия сети');
      return;
    }

    try {

      const userDocRef = doc(db, 'users', currentUser.uid);
      

      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {

        const data = docSnap.data();
        const currentStats = data.stats || { recognitions: 0, translations: 0, recentActivity: [], favoriteWords: [] };
        const newTranslations = (currentStats.translations || 0) + 1;
        

        const recentActivity = currentStats.recentActivity || [];
        

        const updatedActivity = [activityItem, ...recentActivity].slice(0, 20);
        
        await updateDoc(userDocRef, {
          'stats.translations': newTranslations,
          'stats.recentActivity': updatedActivity,
          'stats.favoriteWords': currentStats.favoriteWords,
          lastUpdated: serverTimestamp()
        });
        

        setUserStats(prevStats => {
          if (!prevStats) return prevStats;
          
          const updatedStats = {
            ...prevStats,
            needsSync: false
          };
          

          localStorage.setItem(`${LOCAL_STATS_KEY}_${currentUser.uid}`, JSON.stringify({
            ...updatedStats,
            lastUpdated: Date.now()
          }));
          
          return updatedStats;
        });
      } else {

        await setDoc(userDocRef, {
          email: currentUser.email,
          stats: {
            recognitions: 0,
            translations: 1,
            recentActivity: [activityItem],
            favoriteWords: []
          },
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        });
        

        setUserStats(prevStats => {
          if (!prevStats) return prevStats;
          
          const updatedStats = {
            ...prevStats,
            needsSync: false
          };
          

          localStorage.setItem(`${LOCAL_STATS_KEY}_${currentUser.uid}`, JSON.stringify({
            ...updatedStats,
            lastUpdated: Date.now()
          }));
          
          return updatedStats;
        });
      }
    } catch (error) {
      console.error('Ошибка при обновлении статистики переводов:', error);

      if (error instanceof Error && error.message.includes('offline')) {
        setIsOnline(false);
      }
    }
  };


  const register = async (email: string, password: string) => {
    try {
      setError(null);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      await initUserStats(user.uid);
    } catch (error: any) {
      console.error('Ошибка регистрации:', error);
      setError(error.message || 'Ошибка при регистрации');
      throw error;
    }
  };


  const login = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Ошибка входа:', error);
      setError(error.message || 'Ошибка при входе');
      throw error;
    }
  };


  const logout = async () => {
    try {
      setError(null);

      if (isOnline && userStats?.needsSync && currentUser) {
        try {
          await syncStatsWithServer();
        } catch (error) {
          console.warn('Не удалось синхронизировать данные перед выходом:', error);
        }
      }
      
      await signOut(auth);

      setUserStats(null);
    } catch (error: any) {
      console.error('Ошибка выхода:', error);
      setError(error.message || 'Ошибка при выходе');
      throw error;
    }
  };


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      

      if (user) {
        loadUserStats();
      }
    });


    return unsubscribe;
  }, []);




  const loadApiKeys = async (): Promise<ApiKey[]> => {
    if (!currentUser || !isOnline) return [];
    
    try {

      const apiKeysRef = collection(db, 'api_keys');
      const q = query(apiKeysRef, where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const keys: ApiKey[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        keys.push({
          id: doc.id,
          key: data.key,
          createdAt: data.createdAt.toDate(),
          expiresAt: data.expiresAt.toDate(),
          lastUsed: data.lastUsed ? data.lastUsed.toDate() : undefined,
          description: data.description,
          rateLimit: data.rateLimit
        });
      });
      
      return keys;
    } catch (error) {
      console.error('Ошибка при загрузке API ключей:', error);
      return [];
    }
  };
  

  const generateApiKey = async (description: string): Promise<ApiKey | null> => {
    if (!currentUser || !isOnline) return null;
    
    try {

      const existingKeys = await loadApiKeys();
      if (existingKeys.length >= 5) {
        throw new Error('Достигнут лимит API ключей (максимум 5)');
      }
      

      const randomPart = uuidv4();
      const timestamp = Date.now().toString();
      const userHash = sha256(currentUser.uid).substring(0, 10);
      

      const keyString = `sk_live_${userHash}_${randomPart}`;
      

      const createdAt = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90);
      

      const rateLimit = {
        daily: 100,
        monthly: 3000
      };
      

      const apiKeyData = {
        userId: currentUser.uid,
        key: keyString,
        createdAt: Timestamp.fromDate(createdAt),
        expiresAt: Timestamp.fromDate(expiresAt),
        description: description.trim(),
        rateLimit: rateLimit,
        active: true
      };
      
      const apiKeysRef = collection(db, 'api_keys');
      const docRef = await addDoc(apiKeysRef, apiKeyData);
      

      return {
        id: docRef.id,
        key: keyString,
        createdAt,
        expiresAt,
        description: description.trim(),
        rateLimit
      };
    } catch (error) {
      console.error('Ошибка при генерации API ключа:', error);
      throw error;
    }
  };
  

  const deleteApiKey = async (keyId: string): Promise<boolean> => {
    if (!currentUser || !isOnline) return false;
    
    try {

      const keyRef = doc(db, 'api_keys', keyId);
      const keyDoc = await getDoc(keyRef);
      

      if (!keyDoc.exists()) {
        throw new Error('API ключ не найден');
      }
      
      const keyData = keyDoc.data();
      if (keyData.userId !== currentUser.uid) {
        throw new Error('У вас нет прав для удаления этого ключа');
      }
      

      await deleteDoc(keyRef);
      return true;
    } catch (error) {
      console.error('Ошибка при удалении API ключа:', error);
      throw error;
    }
  };


  const addFavoriteWord = async (word: string): Promise<boolean> => {
    if (!currentUser || !word) return false;
    
    try {

      if (!userStats) await loadUserStats();
      

      if (userStats?.favoriteWords?.includes(word)) return true;
      

      const favoriteWords = userStats?.favoriteWords || [];
      const updatedFavoriteWords = [...favoriteWords, word];
      

      const updatedStats: UserStats = {
        recognitions: userStats?.recognitions || 0,
        translations: userStats?.translations || 0,
        recentActivity: userStats?.recentActivity || [],
        favoriteWords: updatedFavoriteWords,
        needsSync: !isOnline
      };
      
      setUserStats(updatedStats);
      

      localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(updatedStats));
      

      if (isOnline && currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, {
          "stats.favoriteWords": updatedFavoriteWords
        });
      }
      
      return true;
    } catch (error) {
      console.error("Ошибка при добавлении слова в избранное:", error);
      return false;
    }
  };


  const removeFavoriteWord = async (word: string): Promise<boolean> => {
    if (!currentUser || !word) return false;
    
    try {

      if (!userStats) await loadUserStats();
      

      if (!userStats?.favoriteWords || !userStats.favoriteWords.includes(word)) return false;
      

      const updatedFavoriteWords = userStats.favoriteWords.filter(w => w !== word);
      

      const updatedStats: UserStats = {
        recognitions: userStats.recognitions,
        translations: userStats.translations,
        recentActivity: userStats.recentActivity,
        favoriteWords: updatedFavoriteWords,
        needsSync: !isOnline
      };
      
      setUserStats(updatedStats);
      

      localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(updatedStats));
      

      if (isOnline && currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, {
          "stats.favoriteWords": updatedFavoriteWords
        });
      }
      
      return true;
    } catch (error) {
      console.error("Ошибка при удалении слова из избранного:", error);
      return false;
    }
  };


  const getFavoriteWords = async (): Promise<string[]> => {
    if (!currentUser) return [];
    
    try {

      if (!userStats) await loadUserStats();
      
      return userStats?.favoriteWords || [];
    } catch (error) {
      console.error("Ошибка при получении избранных слов:", error);
      return [];
    }
  };


  const isFavoriteWord = (word: string): boolean => {
    if (!userStats?.favoriteWords || !word) return false;
    return userStats.favoriteWords.includes(word);
  };


  const value = {
    currentUser,
    register,
    login,
    logout,
    loading,
    error,
    userStats,
    incrementRecognitions,
    incrementTranslations,
    loadUserStats,
    isOnline,
    checkNetworkStatus,
    loadApiKeys,
    generateApiKey,
    deleteApiKey,
    addFavoriteWord,
    removeFavoriteWord,
    getFavoriteWords,
    isFavoriteWord
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 