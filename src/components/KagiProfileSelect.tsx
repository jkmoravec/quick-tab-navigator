
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KagiProfile {
  id: string;
  name: string;
}

interface KagiProfileSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const KagiProfileSelect = ({ value, onChange }: KagiProfileSelectProps) => {
  const [profiles, setProfiles] = useState<KagiProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // 默认的Kagi配置文件（作为后备选项）
  const defaultProfiles: KagiProfile[] = [
    { id: "gpt-4o", name: "GPT-4o" },
    { id: "gpt-4o-mini", name: "GPT-4o mini" },
    { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet" },
    { id: "claude-3-haiku", name: "Claude 3 Haiku" },
    { id: "gemini-pro", name: "Gemini Pro" },
    { id: "mistral-large", name: "Mistral Large" }
  ];

  // 模拟获取Kagi配置文件的函数
  const fetchKagiProfiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 在实际实现中，这里会通过chrome extension API或其他方式获取用户的Kagi配置文件
      // 目前我们使用模拟数据
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟网络延迟
      
      // 模拟成功获取配置文件
      const mockProfiles: KagiProfile[] = [
        { id: "gpt-4o", name: "GPT-4o (Ultimate)" },
        { id: "gpt-4o-mini", name: "GPT-4o mini" },
        { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet (Ultimate)" },
        { id: "claude-3-haiku", name: "Claude 3 Haiku" },
        { id: "custom-assistant-1", name: "我的自定义助手" }
      ];
      
      setProfiles(mockProfiles);
      
      if (mockProfiles.length > 0 && !value) {
        onChange(mockProfiles[0].id);
      }
      
      toast({
        title: "配置文件已更新",
        description: `已获取到 ${mockProfiles.length} 个可用的Kagi配置文件`,
      });
      
    } catch (err) {
      console.error('获取Kagi配置文件失败:', err);
      setError('获取配置文件失败');
      setProfiles(defaultProfiles);
      
      toast({
        title: "获取配置文件失败",
        description: "使用默认配置文件列表，请检查是否已登录Kagi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取配置文件
  useEffect(() => {
    fetchKagiProfiles();
  }, []);

  const currentProfiles = profiles.length > 0 ? profiles : defaultProfiles;

  return (
    <div className="flex items-center gap-2">
      <Select 
        value={value} 
        onValueChange={onChange}
        disabled={loading}
      >
        <SelectTrigger className="w-48 h-12 rounded-full bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 focus:border-blue-500">
          <SelectValue placeholder={loading ? "加载中..." : "选择AI模型"} />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800">
          {currentProfiles.map((profile) => (
            <SelectItem key={profile.id} value={profile.id} className="text-gray-900 dark:text-white">
              {profile.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={fetchKagiProfiles}
        disabled={loading}
        className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
        title="刷新配置文件"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      </Button>
      
      {error && (
        <AlertCircle className="h-4 w-4 text-orange-500" title={error} />
      )}
    </div>
  );
};

export default KagiProfileSelect;
