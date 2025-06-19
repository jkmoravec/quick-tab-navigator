
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, X, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

interface SortableLinkItemProps {
  link: QuickLink;
  onRemove: (id: string) => void;
}

function SortableLinkItem({ link, onRemove }: SortableLinkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-3 border rounded-lg bg-white dark:bg-gray-800"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <GripVertical className="h-5 w-5" />
      </div>
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
        onClick={() => onRemove(link.id)}
        className="text-red-600 hover:text-red-800"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

const QuickLinksConfig = ({ links, onLinksChange, onClose }: QuickLinksConfigProps) => {
  const [newLink, setNewLink] = useState({ name: "", url: "", icon: "" });
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = links.findIndex(link => link.id === active.id);
      const newIndex = links.findIndex(link => link.id === over?.id);
      
      onLinksChange(arrayMove(links, oldIndex, newIndex));
    }
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={links.map(l => l.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {links.map((link) => (
                  <SortableLinkItem
                    key={link.id}
                    link={link}
                    onRemove={removeLink}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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
          {links.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              💡 提示：拖拽左侧图标可调整快速链接顺序
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickLinksConfig;
