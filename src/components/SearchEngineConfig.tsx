
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, X } from "lucide-react";

interface SearchEngine {
  id: string;
  name: string;
  url: string;
  isDefault?: boolean;
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
                <div className="font-medium">{engine.name}</div>
                <div className="text-sm text-gray-500">{engine.url}</div>
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
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeEngine(engine.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
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
      </CardContent>
    </Card>
  );
};

export default SearchEngineConfig;
