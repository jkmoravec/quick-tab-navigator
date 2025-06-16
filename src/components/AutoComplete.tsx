import { useState, useEffect, useRef, useCallback } from "react";

interface SuggestionItem {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  type: 'history' | 'bookmark' | 'domain';
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
  const [originalValue, setOriginalValue] = useState("");
  const [isBackspacing, setIsBackspacing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // 获取本地存储的历史记录
  const getLocalHistory = useCallback((text: string): SuggestionItem[] => {
    try {
      const history = JSON.parse(localStorage.getItem('browserHistory') || '[]');
      return history
        .filter((item: any) => 
          item.title.toLowerCase().includes(text.toLowerCase()) ||
          item.url.toLowerCase().includes(text.toLowerCase())
        )
        .slice(0, 5)
        .map((item: any, index: number) => ({
          id: `history-${index}`,
          title: item.title,
          url: item.url,
          favicon: item.favicon || '🌐',
          type: 'history' as const
        }));
    } catch {
      return [];
    }
  }, []);

  // 获取本地存储的书签
  const getLocalBookmarks = useCallback((text: string): SuggestionItem[] => {
    try {
      const bookmarks = JSON.parse(localStorage.getItem('browserBookmarks') || '[]');
      return bookmarks
        .filter((item: any) => 
          item.title.toLowerCase().includes(text.toLowerCase()) ||
          item.url.toLowerCase().includes(text.toLowerCase())
        )
        .slice(0, 3)
        .map((item: any, index: number) => ({
          id: `bookmark-${index}`,
          title: item.title,
          url: item.url,
          favicon: item.favicon || '⭐',
          type: 'bookmark' as const
        }));
    } catch {
      return [];
    }
  }, []);

  // 保存访问记录到本地存储
  const saveToLocalHistory = useCallback((title: string, url: string) => {
    try {
      const history = JSON.parse(localStorage.getItem('browserHistory') || '[]');
      const newItem = {
        title,
        url,
        favicon: '🌐',
        timestamp: Date.now()
      };
      
      // 移除重复项
      const filteredHistory = history.filter((item: any) => item.url !== url);
      
      // 添加到开头，保持最多50条记录
      const updatedHistory = [newItem, ...filteredHistory].slice(0, 50);
      
      localStorage.setItem('browserHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.log('无法保存到本地历史记录');
    }
  }, []);

  const getSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const historyResults = getLocalHistory(query);
      const bookmarkResults = getLocalBookmarks(query);

      const allSuggestions = [...historyResults, ...bookmarkResults].slice(0, 8);
      setSuggestions(allSuggestions);
      setShowSuggestions(allSuggestions.length > 0);
      setSelectedIndex(-1);
      
      // 只有在不是backspace操作时才进行内联补全
      if (!isBackspacing) {
        updateInlineSuggestion(query, allSuggestions);
      }
    } catch (error) {
      console.error('获取建议失败:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [getLocalHistory, getLocalBookmarks, isBackspacing]);

  const updateInlineSuggestion = useCallback((query: string, suggestions: SuggestionItem[]) => {
    if (!suggestions.length || !inputRef.current || isBackspacing) return;

    const firstSuggestion = suggestions[0];
    const displayUrl = firstSuggestion.url.replace(/^https?:\/\//, '');
    
    if (displayUrl.toLowerCase().startsWith(query.toLowerCase()) && query.length > 0) {
      const input = inputRef.current;
      const completion = displayUrl;
      
      input.value = completion;
      input.setSelectionRange(query.length, completion.length);
      
      onChange(completion);
    }
  }, [onChange, isBackspacing]);

  const debouncedGetSuggestions = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      if (window.requestIdleCallback) {
        requestIdleCallback(() => getSuggestions(query));
      } else {
        getSuggestions(query);
      }
    }, 150);
  }, [getSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setOriginalValue(newValue);
    onChange(newValue);
    
    // 重置backspace标志
    setIsBackspacing(false);
    debouncedGetSuggestions(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 检测backspace操作
    if (e.key === 'Backspace') {
      setIsBackspacing(true);
      // 短暂延迟后重置backspace标志，避免影响后续正常输入
      setTimeout(() => setIsBackspacing(false), 300);
    }

    if (!showSuggestions) {
      if (e.key === 'Enter') {
        onSubmit(value);
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
        if (inputRef.current) {
          inputRef.current.value = originalValue;
          onChange(originalValue);
        }
        break;
      case 'Tab':
      case 'ArrowRight':
        if (inputRef.current && inputRef.current.selectionStart !== inputRef.current.selectionEnd) {
          e.preventDefault();
          const input = inputRef.current;
          input.setSelectionRange(input.value.length, input.value.length);
        }
        break;
    }
  };

  const handleSuggestionSelect = (suggestion: SuggestionItem) => {
    // 保存到本地历史记录
    if (suggestion.type === 'bookmark') {
      saveToLocalHistory(suggestion.title, suggestion.url);
    }
    
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
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        spellCheck={false}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0 ${
                index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/30 active' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                {suggestion.favicon ? (
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
