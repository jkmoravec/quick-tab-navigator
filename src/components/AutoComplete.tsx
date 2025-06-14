
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
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // 模拟 Chrome API 调用（实际项目中需要替换为真实的 Chrome API）
  const searchHistory = useCallback(async (text: string): Promise<SuggestionItem[]> => {
    // 模拟历史记录数据
    const mockHistory = [
      { title: "ChatGPT", url: "https://chatgpt.com", favicon: "🤖" },
      { title: "GitHub", url: "https://github.com", favicon: "👨‍💻" },
      { title: "Stack Overflow", url: "https://stackoverflow.com", favicon: "📚" },
      { title: "YouTube", url: "https://youtube.com", favicon: "📺" },
      { title: "Gmail", url: "https://gmail.com", favicon: "📧" }
    ];

    return mockHistory
      .filter(item => 
        item.title.toLowerCase().includes(text.toLowerCase()) ||
        item.url.toLowerCase().includes(text.toLowerCase())
      )
      .slice(0, 5)
      .map((item, index) => ({
        id: `history-${index}`,
        title: item.title,
        url: item.url,
        favicon: item.favicon,
        type: 'history' as const
      }));
  }, []);

  const searchBookmarks = useCallback(async (text: string): Promise<SuggestionItem[]> => {
    // 模拟书签数据
    const mockBookmarks = [
      { title: "React Documentation", url: "https://react.dev", favicon: "⚛️" },
      { title: "MDN Web Docs", url: "https://developer.mozilla.org", favicon: "📖" },
      { title: "TypeScript Handbook", url: "https://typescriptlang.org", favicon: "🔷" }
    ];

    return mockBookmarks
      .filter(item => 
        item.title.toLowerCase().includes(text.toLowerCase()) ||
        item.url.toLowerCase().includes(text.toLowerCase())
      )
      .slice(0, 3)
      .map((item, index) => ({
        id: `bookmark-${index}`,
        title: item.title,
        url: item.url,
        favicon: item.favicon,
        type: 'bookmark' as const
      }));
  }, []);

  const getSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const [historyResults, bookmarkResults] = await Promise.all([
        searchHistory(query),
        searchBookmarks(query)
      ]);

      const allSuggestions = [...historyResults, ...bookmarkResults].slice(0, 8);
      setSuggestions(allSuggestions);
      setShowSuggestions(allSuggestions.length > 0);
      setSelectedIndex(-1);
      
      // 内联自动补全逻辑
      updateInlineSuggestion(query, allSuggestions);
    } catch (error) {
      console.error('获取建议失败:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchHistory, searchBookmarks]);

  const updateInlineSuggestion = useCallback((query: string, suggestions: SuggestionItem[]) => {
    if (!suggestions.length || !inputRef.current) return;

    const firstSuggestion = suggestions[0];
    const displayUrl = firstSuggestion.url.replace(/^https?:\/\//, '');
    
    // 检查是否为前缀匹配
    if (displayUrl.toLowerCase().startsWith(query.toLowerCase()) && query.length > 0) {
      const input = inputRef.current;
      const completion = displayUrl;
      
      // 设置输入框值并选中补全部分
      input.value = completion;
      input.setSelectionRange(query.length, completion.length);
      
      // 更新父组件的值但不触发onChange，避免循环
      onChange(completion);
    }
  }, [onChange]);

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
    debouncedGetSuggestions(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
        // 恢复原始输入
        if (inputRef.current) {
          inputRef.current.value = originalValue;
          onChange(originalValue);
        }
        break;
      case 'Tab':
      case 'ArrowRight':
        // 接受内联补全
        if (inputRef.current && inputRef.current.selectionStart !== inputRef.current.selectionEnd) {
          e.preventDefault();
          const input = inputRef.current;
          input.setSelectionRange(input.value.length, input.value.length);
        }
        break;
    }
  };

  const handleSuggestionSelect = (suggestion: SuggestionItem) => {
    onChange(suggestion.url);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    onSubmit(suggestion.url);
  };

  const handleSuggestionClick = (suggestion: SuggestionItem) => {
    handleSuggestionSelect(suggestion);
  };

  // 点击外部关闭建议
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 清理定时器
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
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-blue-50 active' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                {suggestion.favicon ? (
                  <span className="text-lg">{suggestion.favicon}</span>
                ) : (
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {suggestion.title}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {suggestion.url}
                </div>
              </div>
              <div className="flex-shrink-0">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  suggestion.type === 'history' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
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
