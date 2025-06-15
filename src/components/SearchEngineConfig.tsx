
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, X, Bot } from "lucide-react";

interface SearchEngine {
  id: string;
  name: string;
  url: string;
  isDefault?: boolean;
  isAI?: boolean;
}

interface SearchEngineConfigProps {
  engines: SearchEngine[];
  onEnginesChange: (engines: SearchEngine[]) => void;
  onClose: () => void;
}

const SearchEngineConfig = ({ engines, onEnginesChange, onClose }: SearchEngineConfigProps) => {
  const [newEngine, setNewEngine] = useState({ name: "", url: "" });

  const addEngine = () => {
    if (newEngine.name && newEngine.url) {
      const id = newEngine.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
      onEnginesChange([...engines, { ...newEngine, id }]);
      setNewEngine({ name: "", url: "" });
    }
  };

  const removeEngine = (id: string) => {
    // 防止删除Kagi Assistant
    if (id === 'kagi-assistant') {
      return;
    }
    onEnginesChange(engines.filter(engine => engine.id !== id));
  };

  const setDefault = (id: string) => {
    onEnginesChange(engines.map(engine => ({ 
      ...engine, 
      isDefault: engine.id === id 
    })));
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>搜索引擎配置</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 现有搜索引擎列表 */}
        <div className="space-y-3">
          {engines.map((engine) => (
            <div key={engine.id} className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{engine.name}</span>
                  {engine.isAI && (
                    <span className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                      <Bot className="h-3 w-3" />
                      AI
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {engine.isAI ? "AI助手搜索" : engine.url}
                </div>
              </div>
              <div className="flex gap-2">
                {engine.isDefault ? (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    默认
                  </span>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDefault(engine.id)}
                  >
                    设为默认
                  </Button>
                )}
                {engine.id !== 'kagi-assistant' && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeEngine(engine.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 添加新搜索引擎 */}
        <div className="border-t pt-6">
          <h3 className="font-medium mb-4">添加新搜索引擎</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="name">名称</Label>
              <Input
                id="name"
                value={newEngine.name}
                onChange={(e) => setNewEngine({ ...newEngine, name: e.target.value })}
                placeholder="搜索引擎名称"
              />
            </div>
            <div>
              <Label htmlFor="url">搜索URL</Label>
              <Input
                id="url"
                value={newEngine.url}
                onChange={(e) => setNewEngine({ ...newEngine, url: e.target.value })}
                placeholder="https://example.com/search?q="
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addEngine} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                添加
              </Button>
            </div>
          </div>
        </div>

        {/* Kagi Assistant 说明 */}
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                关于 Kagi Assistant
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Kagi Assistant 是集成的AI助手，支持多种模型（GPT-4o、Claude等）。使用前请确保已登录 Kagi 账户并有可用的配额。
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchEngineConfig;
