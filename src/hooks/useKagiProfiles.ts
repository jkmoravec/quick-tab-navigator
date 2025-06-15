
import { useState, useEffect } from 'react';

export interface KagiProfile {
  id: string;
  name: string;
  type?: 'builtin' | 'custom';
  available?: boolean;
}

interface UseKagiProfilesReturn {
  profiles: KagiProfile[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useKagiProfiles = (): UseKagiProfilesReturn => {
  const [profiles, setProfiles] = useState<KagiProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 默认配置文件列表（作为后备）
  const defaultProfiles: KagiProfile[] = [
    { id: "gpt-4o", name: "GPT-4o", type: 'builtin', available: true },
    { id: "gpt-4o-mini", name: "GPT-4o mini", type: 'builtin', available: true },
    { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", type: 'builtin', available: false },
    { id: "claude-3-haiku", name: "Claude 3 Haiku", type: 'builtin', available: true },
    { id: "gemini-pro", name: "Gemini Pro", type: 'builtin', available: true },
    { id: "mistral-large", name: "Mistral Large", type: 'builtin', available: false }
  ];

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);

    try {
      // 在真实实现中，这里会：
      // 1. 检查是否在扩展环境中
      // 2. 发送消息给background script请求profiles
      // 3. background script打开Kagi页面并抓取可用的profiles
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 模拟从Kagi获取的配置文件
      const mockProfiles: KagiProfile[] = [
        { id: "gpt-4o", name: "GPT-4o (Ultimate)", type: 'builtin', available: true },
        { id: "gpt-4o-mini", name: "GPT-4o mini", type: 'builtin', available: true },
        { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet (Ultimate)", type: 'builtin', available: true },
        { id: "claude-3-haiku", name: "Claude 3 Haiku", type: 'builtin', available: true },
        { id: "custom-research", name: "研究助手 (自定义)", type: 'custom', available: true },
        { id: "custom-writing", name: "写作助手 (自定义)", type: 'custom', available: true }
      ];

      setProfiles(mockProfiles.filter(p => p.available));
      
    } catch (err) {
      console.error('获取Kagi配置文件失败:', err);
      setError('获取配置文件失败，使用默认列表');
      setProfiles(defaultProfiles.filter(p => p.available));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return {
    profiles,
    loading,
    error,
    refetch: fetchProfiles
  };
};
