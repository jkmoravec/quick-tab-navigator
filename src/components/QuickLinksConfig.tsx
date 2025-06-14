
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, X } from "lucide-react";

interface QuickLink {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

interface QuickLinksConfigProps {
  links: QuickLink[];
  onLinksChange: (links: QuickLink[]) => void;
  onClose: () => void;
}

const QuickLinksConfig = ({ links, onLinksChange, onClose }: QuickLinksConfigProps) => {
  const [newLink, setNewLink] = useState({ name: "", url: "", icon: "" });

  const addLink = () => {
    if (newLink.name && newLink.url) {
      const id = newLink.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
      onLinksChange([...links, { ...newLink, id }]);
      setNewLink({ name: "", url: "", icon: "" });
    }
  };

  const removeLink = (id: string) => {
    onLinksChange(links.filter(link => link.id !== id));
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>快速链接配置</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 现有快速链接列表 */}
        {links.length > 0 && (
          <div className="space-y-3">
            {links.map((link) => (
              <div key={link.id} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {link.icon && <span className="text-lg">{link.icon}</span>}
                    <div className="font-medium">{link.name}</div>
                  </div>
                  <div className="text-sm text-gray-500">{link.url}</div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeLink(link.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* 添加新快速链接 */}
        <div className={links.length > 0 ? "border-t pt-6" : ""}>
          <h3 className="font-medium mb-4">添加新快速链接</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="linkName">名称</Label>
              <Input
                id="linkName"
                value={newLink.name}
                onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                placeholder="链接名称"
              />
            </div>
            <div>
              <Label htmlFor="linkUrl">网址</Label>
              <Input
                id="linkUrl"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="linkIcon">图标 (可选)</Label>
              <Input
                id="linkIcon"
                value={newLink.icon}
                onChange={(e) => setNewLink({ ...newLink, icon: e.target.value })}
                placeholder="😀"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addLink} className="w-full">
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

export default QuickLinksConfig;
