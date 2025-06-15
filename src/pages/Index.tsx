
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
import ThemeToggle from "@/components/ThemeToggle";
import KagiProfileSelect from "@/components/KagiProfileSelect";

interface SearchEngine {
  id: string;
  name: string;
  url: string;
  isDefault?: boolean;
  isAI?: boolean;
}

interface QuickLink {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

interface KagiProfile {
  id: string;
  name: string;
}

const Index = () => {
  const [query, setQuery] = useState("");
  const [searchEngine, setSearchEngine] = useState("google");
  const [selectedKagiProfile, setSelectedKagiProfile] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [showQuickLinksConfig, setShowQuickLinksConfig] = useState(false);

  // 默认搜索引擎（包含Kagi Assistant）
  const [searchEngines, setSearchEngines] = useState<SearchEngine[]>([
    { id: "google", name: "Google", url: "https://www.google.com/search?q=", isDefault: true },
    { id: "bing", name: "Bing", url: "https://www.bing.com/search?q=" },
    { id: "baidu", name: "百度", url: "https://www.baidu.com/s?wd=" },
    { id: "duckduckgo", name: "DuckDuckGo", url: "https://duckduckgo.com/?q=" },
    { id: "kagi-assistant", name: "Kagi Assistant", url: "https://kagi.com/assistant", isAI: true }
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

  // 处理Kagi Assistant搜索
  const handleKagiSearch = (query: string, profile: string) => {
    const params = new URLSearchParams({
      q: query,
      internet: 'true'
    });
    
    if (profile) {
      params.set('profile', profile);
    }
    
    const url = `https://kagi.com/assistant?${params.toString()}`;
    window.open(url, '_blank');
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
        if (engine.id === 'kagi-assistant') {
          handleKagiSearch(value, selectedKagiProfile);
        } else {
          const searchUrl = engine.url + encodeURIComponent(value);
          window.open(searchUrl, '_blank');
        }
      }
    }
  };

  const isKagiSelected = searchEngine === 'kagi-assistant';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-4 transition-colors">
      {/* 设置和主题切换按钮 */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800">
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
        {/* 搜索栏 - 水平布局，统一高度 */}
        <div className="w-full mb-8">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <AutoComplete
                value={query}
                onChange={setQuery}
                onSubmit={handleSubmit}
                placeholder={isKagiSelected ? "向 Kagi Assistant 提问..." : "输入网址或搜索关键词..."}
                className="w-full h-12 text-lg px-4 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            
            <Select value={searchEngine} onValueChange={setSearchEngine}>
              <SelectTrigger className="w-40 h-12 rounded-full bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 focus:border-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800">
                {searchEngines.map((engine) => (
                  <SelectItem key={engine.id} value={engine.id} className="text-gray-900 dark:text-white">
                    {engine.name}
                    {engine.isAI && <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded">AI</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Kagi配置文件选择器 */}
            {isKagiSelected && (
              <KagiProfileSelect
                value={selectedKagiProfile}
                onChange={setSelectedKagiProfile}
              />
            )}

            <Button 
              onClick={() => handleSubmit(query)}
              className="h-12 px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {isKagiSelected ? "提问" : "转到"}
            </Button>
          </div>
        </div>

        {/* 快速链接区域 */}
        {quickLinks.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {quickLinks.map((link) => (
              <Button
                key={link.id}
                variant="ghost"
                className="h-16 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors"
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
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
