declare module '../../../server/data/slangDictionary' {
  export const slangDictionary: {
    [key: string]: string;
  };

  export function getAllSlangWords(): {
    [key: string]: string;
  };

  export function isSlangWord(word: string): boolean;

  export function getExplanation(word: string): string | null;

  export function searchWord(word: string): {
    exact: { word: string; definition: string } | null;
    similar: Array<{ word: string; definition: string }>;
  };

  export function findSuggestions(query: string): string[];

  export function translateText(text: string, mode?: 'replace' | 'annotate'): string;

  const slangDictionaryModule: {
    slangDictionary: { [key: string]: string };
    getAllSlangWords: typeof getAllSlangWords;
    findSuggestions: typeof findSuggestions;
    isSlangWord: typeof isSlangWord;
    getExplanation: typeof getExplanation;
    translateText: typeof translateText;
    searchWord: typeof searchWord;
  };

  export default slangDictionaryModule;
} 