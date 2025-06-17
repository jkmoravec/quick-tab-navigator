import { useState, useEffect, useRef, useCallback } from "react";

interface SuggestionItem {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  type: 'history' | 'bookmark';
}

interface AutoCompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const AutoComplete = ({ value, onChange, onSubmit, placeholder, className }: AutoCompleteProps) => {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // 检查是否在Chrome扩展环境中
  const isExtension = typeof chrome !== 'undefined' && chrome.history;

  // 获取Chrome浏览器历史记录
  const getChromeHistory = useCallback(async (text: string): Promise<SuggestionItem[]> => {
    if (!isExtension) return [];
    
    try {
      const results = await chrome.history.search({
        text: text,
        maxResults: 8
      });
      
      return results.map((item, index) => ({
        id: `history-${index}`,
        title: item.title || item.url || '',
        url: item.url || '',
        favicon: `chrome://favicon/${item.url}`,
        type: 'history' as const
      }));
    } catch (error) {
      console.error('Failed to get Chrome history:', error);
      return [];
    }
  }, [isExtension]);

  // 获取Chrome书签
  const getChromeBookmarks = useCallback(async (text: string): Promise<SuggestionItem[]> => {
    if (!isExtension) return [];
    
    try {
      const bookmarkTree = await chrome.bookmarks.getTree();
      const allBookmarks: any[] = [];
      
      const extractBookmarks = (nodes: any[]) => {
        nodes.forEach(node => {
          if (node.url) {
            allBookmarks.push(node);
          } else if (node.children) {
            extractBookmarks(node.children);
          }
        });
      };
      
      extractBookmarks(bookmarkTree);
      
      const filtered = allBookmarks
        .filter(bookmark => 
          bookmark.title?.toLowerCase().includes(text.toLowerCase()) ||
          bookmark.url?.toLowerCase().includes(text.toLowerCase())
        )
        .slice(0, 5);
      
      return filtered.map((bookmark, index) => ({
        id: `bookmark-${index}`,
        title: bookmark.title || bookmark.url,
        url: bookmark.url,
        favicon: `chrome://favicon/${bookmark.url}`,
        type: 'bookmark' as const
      }));
    } catch (error) {
      console.error('Failed to get Chrome bookmarks:', error);
      return [];
    }
  }, [isExtension]);

  // 获取本地存储的历史记录（fallback）
  const getLocalHistory = useCallback((text: string): SuggestionItem[] => {
    try {
      const history = JSON.parse(localStorage.getItem('browserHistory') || '[]');
      return history
        .filter((item: any) => 
          item.title?.toLowerCase().includes(text.toLowerCase()) ||
          item.url?.toLowerCase().includes(text.toLowerCase())
        )
        .slice(0, 8)
        .map((item: any, index: number) => ({
          id: `history-${index}`,
          title: item.title || item.url,
          url: item.url,
          favicon: item.favicon || '🌐',
          type: 'history' as const
        }));
    } catch {
      return [];
    }
  }, []);

  // 保存访问记录到Chrome历史（会自动保存）和本地存储
  const saveToHistory = useCallback((title: string, url: string) => {
    if (isExtension) {
      // Chrome扩展会自动保存到历史记录，无需手动操作
      chrome.history.addUrl({ url });
    } else {
      // Fallback到localStorage
      try {
        const history = JSON.parse(localStorage.getItem('browserHistory') || '[]');
        const newItem = {
          title,
          url,
          favicon: '🌐',
          timestamp: Date.now()
        };
        
        const filteredHistory = history.filter((item: any) => item.url !== url);
        const updatedHistory = [newItem, ...filteredHistory].slice(0, 50);
        
        localStorage.setItem('browserHistory', JSON.stringify(updatedHistory));
      } catch (error) {
        console.log('无法保存到本地历史记录');
      }
    }
  }, [isExtension]);

  // 内联补全功能
  const applyInlineCompletion = useCallback((query: string, suggestions: SuggestionItem[]) => {
    if (!suggestions.length || !inputRef.current || isComposing || !query.trim()) return;

    const firstSuggestion = suggestions[0];
    let completionText = firstSuggestion.url.replace(/^https?:\/\//, '').replace(/^www\./, '');
    
    if (completionText.includes('/')) {
      completionText = completionText.split('/')[0];
    }
    
    if (completionText.toLowerCase().startsWith(query.toLowerCase())) {
      const input = inputRef.current;
      const currentValue = input.value;
      
      if (currentValue === query) {
        input.value = completionText;
        input.setSelectionRange(query.length, completionText.length);
        onChange(completionText);
      }
    }
  }, [onChange, isComposing]);

  const getSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      let historyResults: SuggestionItem[] = [];
      let bookmarkResults: SuggestionItem[] = [];
      
      if (isExtension) {
        // 使用Chrome API
        historyResults = await getChromeHistory(query);
        bookmarkResults = await getChromeBookmarks(query);
      } else {
        // 使用localStorage fallback
        historyResults = getLocalHistory(query);
      }
      
      const allSuggestions = [...historyResults, ...bookmarkResults].slice(0, 8);
      
      setSuggestions(allSuggestions);
      setShowSuggestions(allSuggestions.length > 0);
      setSelectedIndex(-1);
      
      // 应用内联补全
      applyInlineCompletion(query, allSuggestions);
    } catch (error) {
      console.error('获取建议失败:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [isExtension, getChromeHistory, getChromeBookmarks, getLocalHistory, applyInlineCompletion]);

  const debouncedGetSuggestions = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      getSuggestions(query);
    }, 150);
  }, [getSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (!isComposing) {
      debouncedGetSuggestions(newValue);
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false);
    const newValue = e.currentTarget.value;
    onChange(newValue);
    debouncedGetSuggestions(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isComposing) return;

    if (!showSuggestions) {
      if (e.key === 'Enter') {
        onSubmit(value);
      } else if (e.key === 'Tab' || e.key === 'ArrowRight') {
        const input = inputRef.current;
        if (input && input.selectionStart !== input.selectionEnd) {
          e.preventDefault();
          input.setSelectionRange(input.value.length, input.value.length);
        }
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else {
          onSubmit(value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSuggestions([]);
        setSelectedIndex(-1);
        break;
      case 'Tab':
      case 'ArrowRight':
        const input = inputRef.current;
        if (input && input.selectionStart !== input.selectionEnd) {
          e.preventDefault();
          input.setSelectionRange(input.value.length, input.value.length);
        }
        break;
    }
  };

  const handleSuggestionSelect = (suggestion: SuggestionItem) => {
    saveToHistory(suggestion.title, suggestion.url);
    
    onChange(suggestion.url);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    onSubmit(suggestion.url);
  };

  const handleSuggestionClick = (suggestion: SuggestionItem) => {
    handleSuggestionSelect(suggestion);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        spellCheck={false}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors ${
                index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/30' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                {suggestion.favicon && suggestion.favicon.startsWith('chrome://') ? (
                  <img src={suggestion.favicon} alt="" className="w-4 h-4" onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }} />
                ) : suggestion.favicon ? (
                  <span className="text-lg">{suggestion.favicon}</span>
                ) : (
                  <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-white truncate">
                  {suggestion.title}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {suggestion.url}
                </div>
              </div>
              <div className="flex-shrink-0">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  suggestion.type === 'history' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                    : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                }`}>
                  {suggestion.type === 'history' ? '历史' : '书签'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutoComplete;
