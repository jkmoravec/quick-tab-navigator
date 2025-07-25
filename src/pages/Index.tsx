import { useState, useRef, useEffect } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import SettingsModal from "@/components/SettingsModal";
import { SearchEngine, defaultSearchEngines, mergeBuiltinEngines } from "@/lib/defaultSearchEngines";

interface QuickLink {
  id: string;
  name: string;
  url: string;
  icon?: string;
  enabled?: boolean;
}

const Index = () => {
  const [query, setQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showQuickLinksConfig, setShowQuickLinksConfig] = useState(false);

  // 从 localStorage 加载搜索引擎配置，并使用方案B自动补齐
  const [searchEngines, setSearchEngines] = useState<SearchEngine[]>(() => {
    try {
      const saved = localStorage.getItem('searchEngines');
      if (saved) {
        const parsed = JSON.parse(saved);
        // 方案B：自动补齐所有内置引擎
        return mergeBuiltinEngines(parsed);
      }
      return defaultSearchEngines;
    } catch {
      return defaultSearchEngines;
    }
  });

  // 从 localStorage 加载快速链接配置
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>(() => {
    try {
      const saved = localStorage.getItem('quickLinks');
      if (saved) {
        const parsed = JSON.parse(saved);
        // 确保所有链接都有 enabled 字段，默认为 true
        return parsed.map((link: QuickLink) => ({
          ...link,
          enabled: link.enabled !== undefined ? link.enabled : true
        }));
      }
      return [];
    } catch {
      return [];
    }
  });

  // 从 localStorage 加载当前选中的搜索引擎
  const [searchEngine, setSearchEngine] = useState(() => {
    try {
      const saved = localStorage.getItem('currentSearchEngine');
      if (saved) {
        return saved;
      }
      const defaultEngine = searchEngines.find(e => e.isDefault);
      return defaultEngine ? defaultEngine.id : "google";
    } catch {
      const defaultEngine = searchEngines.find(e => e.isDefault);
      return defaultEngine ? defaultEngine.id : "google";
    }
  });

  // 保存搜索引擎配置到 localStorage
  useEffect(() => {
    localStorage.setItem('searchEngines', JSON.stringify(searchEngines));
  }, [searchEngines]);

  // 保存快速链接配置到 localStorage
  useEffect(() => {
    localStorage.setItem('quickLinks', JSON.stringify(quickLinks));
  }, [quickLinks]);

  // 保存当前选中的搜索引擎到 localStorage
  useEffect(() => {
    localStorage.setItem('currentSearchEngine', searchEngine);
  }, [searchEngine]);

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
  const handleKagiSearch = (query: string) => {
    const params = new URLSearchParams({
      q: query,
      internet: 'true'
    });

    const url = `https://kagi.com/assistant?${params.toString()}`;
    window.location.href = url;
  };

  // 处理搜索/导航
  const handleSubmit = (value: string) => {
    if (!value.trim()) return;

    console.log('Submitting search with engine:', searchEngine, 'value:', value);

    if (isURL(value)) {
      const url = value.startsWith('http') ? value : `https://${value}`;
      window.location.href = url;
    } else {
      const engine = searchEngines.find(e => e.id === searchEngine);
      if (engine) {
        if (engine.id === 'kagi-assistant') {
          handleKagiSearch(value);
        } else {
          const searchUrl = engine.url + encodeURIComponent(value);
          window.location.href = searchUrl;
        }
      }
    }
  };

  // 修复搜索引擎切换 - 移除问题的useEffect
  const handleSearchEngineChange = (engineId: string) => {
    console.log('Changing search engine to:', engineId);
    setSearchEngine(engineId);
  };

  const isKagiSelected = searchEngine === 'kagi-assistant';

  useEffect(() => {
    const def = searchEngines.find(e => e.isDefault);
    if (def && def.id !== searchEngine) setSearchEngine(def.id);
  }, [searchEngines]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 transition-colors">
      {/* 设置和主题切换按钮 */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-600 dark:text-muted-foreground hover:text-gray-800 dark:hover:text-foreground">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white dark:bg-card border-gray-200 dark:border-border z-50">
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
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
        {/* 大搜索栏 */}
        <div className="w-full mb-8">
          <div className="relative">
            <AutoComplete
              value={query}
              onChange={setQuery}
              onSubmit={handleSubmit}
              placeholder={isKagiSelected ? "向 Kagi Assistant 提问..." : "输入网址或搜索关键词..."}
              className="w-full h-16 text-xl px-8 pr-32 rounded-full bg-white dark:bg-card border-2 border-gray-300 dark:border-border text-gray-900 dark:text-foreground placeholder:text-gray-500 dark:placeholder:text-muted-foreground focus:border-blue-500 dark:focus:border-ring focus:outline-none transition-all duration-300 shadow-xl hover:shadow-2xl focus:shadow-2xl"
            />

            {/* 搜索按钮在输入框内 */}
            <Button
              onClick={() => handleSubmit(query)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-10 px-6 rounded-full bg-blue-600 dark:bg-foreground hover:bg-blue-700 dark:hover:bg-foreground/90 text-white dark:text-background font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              {isKagiSelected ? "提问" : "搜索"}
            </Button>
          </div>

          {/* 搜索引擎选择 - 使用原生按钮确保点击工作 */}
          <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
            {searchEngines.filter(e => e.enabled !== false).map((engine) => (
              <button
                key={engine.id}
                type="button"
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer select-none border-0 outline-none focus:outline-none ${searchEngine === engine.id
                  ? "bg-blue-600 dark:bg-accent text-white dark:text-accent-foreground shadow-sm"
                  : "text-gray-600 dark:text-muted-foreground hover:bg-gray-100 dark:hover:bg-accent hover:text-gray-800 dark:hover:text-accent-foreground bg-transparent"
                  }`}
                onClick={() => handleSearchEngineChange(engine.id)}
                onMouseDown={(e) => e.preventDefault()}
              >
                {engine.name}
                {engine.isAI && (
                  <span className="ml-1 text-xs bg-blue-500 dark:bg-muted text-white dark:text-muted-foreground px-1.5 py-0.5 rounded">AI</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 快速链接区域 - Notion 画廊风格 */}
        {quickLinks.filter(l => l.enabled === true).length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
            {quickLinks.filter(l => l.enabled === true).map((link) => (
              <div
                key={link.id}
                className="group relative overflow-hidden rounded-xl bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-accent border border-gray-200 dark:border-border hover:border-gray-300 dark:hover:border-border/80 transition-all duration-200 cursor-pointer hover:shadow-lg transform hover:-translate-y-0.5"
                onClick={() => window.location.href = link.url}
              >
                <div className="p-4">
                  {/* 图标容器 */}
                  <div className="w-12 h-12 rounded-lg bg-white dark:bg-muted shadow-sm group-hover:shadow-md transition-all duration-200 flex items-center justify-center mb-3 overflow-hidden">
                    {link.icon ? (
                      <div className="text-2xl group-hover:scale-110 transition-transform duration-200">
                        {link.icon}
                      </div>
                    ) : (
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(link.url)}&sz=64`}
                        alt={link.name}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    )}
                  </div>

                  {/* 标题 */}
                  <h3 className="text-sm font-medium text-gray-800 dark:text-foreground truncate">
                    {link.name}
                  </h3>

                  {/* 可选：添加描述或 URL 预览 */}
                  <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1 truncate">
                    {(() => {
                      try {
                        return new URL(link.url).hostname;
                      } catch {
                        return link.url;
                      }
                    })()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 设置弹窗 */}
      <SettingsModal
        title="搜索引擎配置"
        open={showSettings}
        onOpenChange={setShowSettings}
      >
        <SearchEngineConfig
          engines={searchEngines}
          onEnginesChange={setSearchEngines}
        />
      </SettingsModal>

      {/* 快速链接配置弹窗 */}
      <SettingsModal
        title="快速链接配置"
        open={showQuickLinksConfig}
        onOpenChange={setShowQuickLinksConfig}
      >
        <QuickLinksConfig
          links={quickLinks}
          onLinksChange={setQuickLinks}
        />
      </SettingsModal>
    </div>
  );
};

export default Index;
