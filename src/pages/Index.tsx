
import { useState, useRef, useEffect } from "react";
import { Search, Globe, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Index = () => {
  const [query, setQuery] = useState("");
  const [searchEngine, setSearchEngine] = useState("google");
  const inputRef = useRef<HTMLInputElement>(null);

  const searchEngines = {
    google: { name: "Google", url: "https://www.google.com/search?q=" },
    bing: { name: "Bing", url: "https://www.bing.com/search?q=" },
    baidu: { name: "百度", url: "https://www.baidu.com/s?wd=" },
    duckduckgo: { name: "DuckDuckGo", url: "https://duckduckgo.com/?q=" }
  };

  // 自动聚焦地址栏
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 判断是否为URL
  const isURL = (text: string) => {
    try {
      new URL(text.startsWith('http') ? text : `http://${text}`);
      return text.includes('.') && !text.includes(' ');
    } catch {
      return false;
    }
  };

  // 处理回车键
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 处理搜索/导航
  const handleSearch = () => {
    if (!query.trim()) return;

    if (isURL(query)) {
      // 如果是URL，直接导航
      const url = query.startsWith('http') ? query : `https://${query}`;
      window.open(url, '_blank');
    } else {
      // 如果是关键词，使用选定的搜索引擎
      const searchUrl = searchEngines[searchEngine as keyof typeof searchEngines].url + encodeURIComponent(query);
      window.open(searchUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      {/* 顶部设置按钮 */}
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-800">
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* 主内容区域 */}
      <div className="w-full max-w-2xl mx-auto">
        {/* Logo/标题区域 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Globe className="h-12 w-12 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">简洁地址栏</h1>
          </div>
          <p className="text-gray-600 text-lg">智能识别URL和关键词，快速导航到目标页面</p>
        </div>

        {/* 地址栏区域 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入网址或搜索关键词..."
                className="text-lg py-6 px-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 transition-colors"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <Select value={searchEngine} onValueChange={setSearchEngine}>
              <SelectTrigger className="w-32 py-6 rounded-xl border-2 border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(searchEngines).map(([key, engine]) => (
                  <SelectItem key={key} value={key}>
                    {engine.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleSearch}
              className="px-8 py-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            >
              前往
            </Button>
          </div>
          
          {/* 提示文字 */}
          <div className="text-sm text-gray-500 text-center">
            {query && (
              isURL(query) 
                ? `将导航到: ${query.startsWith('http') ? query : 'https://' + query}`
                : `将在 ${searchEngines[searchEngine as keyof typeof searchEngines].name} 中搜索: ${query}`
            )}
          </div>
        </div>

        {/* Quick Links 预留区域 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">快速链接</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "GitHub", url: "https://github.com", icon: "💻" },
              { name: "Gmail", url: "https://gmail.com", icon: "📧" },
              { name: "YouTube", url: "https://youtube.com", icon: "📺" },
              { name: "StackOverflow", url: "https://stackoverflow.com", icon: "📚" }
            ].map((link) => (
              <Button
                key={link.name}
                variant="outline"
                className="h-16 rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                onClick={() => window.open(link.url, '_blank')}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{link.icon}</div>
                  <div className="text-sm font-medium">{link.name}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* 快捷键提示 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-gray-600">
          按 <kbd className="bg-gray-200 px-2 py-1 rounded text-xs font-mono">Ctrl+M</kbd> 聚焦地址栏
        </div>
      </div>
    </div>
  );
};

export default Index;
