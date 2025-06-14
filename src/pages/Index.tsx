
import { useState, useRef, useEffect } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SearchEngineConfig from "@/components/SearchEngineConfig";
import QuickLinksConfig from "@/components/QuickLinksConfig";
import AutoComplete from "@/components/AutoComplete";

interface SearchEngine {
  id: string;
  name: string;
  url: string;
  isDefault?: boolean;
}

interface QuickLink {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

const Index = () => {
  const [query, setQuery] = useState("");
  const [searchEngine, setSearchEngine] = useState("google");
  const [showSettings, setShowSettings] = useState(false);
  const [showQuickLinksConfig, setShowQuickLinksConfig] = useState(false);

  // 默认搜索引擎
  const [searchEngines, setSearchEngines] = useState<SearchEngine[]>([
    { id: "google", name: "Google", url: "https://www.google.com/search?q=", isDefault: true },
    { id: "bing", name: "Bing", url: "https://www.bing.com/search?q=" },
    { id: "baidu", name: "百度", url: "https://www.baidu.com/s?wd=" },
    { id: "duckduckgo", name: "DuckDuckGo", url: "https://duckduckgo.com/?q=" }
  ]);

  // 自定义快速链接
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);

  // 判断是否为URL
  const isURL = (text: string) => {
    try {
      new URL(text.startsWith('http') ? text : `http://${text}`);
      return text.includes('.') && !text.includes(' ');
    } catch {
      return false;
    }
  };

  // 处理搜索/导航
  const handleSubmit = (value: string) => {
    if (!value.trim()) return;

    if (isURL(value)) {
      const url = value.startsWith('http') ? value : `https://${value}`;
      window.open(url, '_blank');
    } else {
      const engine = searchEngines.find(e => e.id === searchEngine);
      if (engine) {
        const searchUrl = engine.url + encodeURIComponent(value);
        window.open(searchUrl, '_blank');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      {/* 设置按钮 */}
      <div className="absolute top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-200">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white">
            <DropdownMenuItem onClick={() => setShowSettings(true)}>
              搜索引擎设置
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowQuickLinksConfig(true)}>
              快速链接设置
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 主搜索区域 */}
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        {/* 搜索栏容器 */}
        <div className="flex items-center gap-3 w-full mb-8">
          <AutoComplete
            value={query}
            onChange={setQuery}
            onSubmit={handleSubmit}
            placeholder="输入网址或搜索关键词..."
            className="flex-1 text-lg py-4 px-6 rounded-full bg-gray-800 border border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
          />
          
          <Select value={searchEngine} onValueChange={setSearchEngine}>
            <SelectTrigger className="w-32 py-4 rounded-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700 focus:border-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {searchEngines.map((engine) => (
                <SelectItem key={engine.id} value={engine.id}>
                  {engine.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={() => handleSubmit(query)}
            className="px-6 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            转到
          </Button>
        </div>

        {/* 快速链接区域 */}
        {quickLinks.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {quickLinks.map((link) => (
              <Button
                key={link.id}
                variant="ghost"
                className="h-16 rounded-xl bg-gray-800/50 border border-gray-700 hover:bg-gray-700 text-white transition-colors"
                onClick={() => window.open(link.url, '_blank')}
              >
                <div className="text-center">
                  {link.icon && <div className="text-2xl mb-1">{link.icon}</div>}
                  <div className="text-sm font-medium">{link.name}</div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* 设置弹窗 */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-1 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <SearchEngineConfig 
              engines={searchEngines}
              onEnginesChange={setSearchEngines}
              onClose={() => setShowSettings(false)}
            />
          </div>
        </div>
      )}

      {/* 快速链接配置弹窗 */}
      {showQuickLinksConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-1 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <QuickLinksConfig 
              links={quickLinks}
              onLinksChange={setQuickLinks}
              onClose={() => setShowQuickLinksConfig(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
