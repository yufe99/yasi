import React, { useState, useEffect } from 'react';
import { Story, ActivationCode, MembershipType, VocabularyBankEntry } from '../types';
import { 
  Plus, 
  Trash2, 
  Key, 
  Film, 
  Check, 
  Copy, 
  Loader2, 
  LogOut, 
  ShieldAlert, 
  Save, 
  BookOpen, 
  Search,
  PlusCircle,
  FileUp,
  Download,
  Upload,
  Database,
  Globe,
  Wifi,
  AlertTriangle,
  RefreshCw,
  Link2,
  Settings2
} from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface AdminDashboardProps {
  stories: Story[];
  setStories: React.Dispatch<React.SetStateAction<Story[]>>;
  codes: ActivationCode[];
  setCodes: React.Dispatch<React.SetStateAction<ActivationCode[]>>;
  vocabularyBank: VocabularyBankEntry[];
  setVocabularyBank: React.Dispatch<React.SetStateAction<VocabularyBankEntry[]>>;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  stories, setStories, codes, setCodes, vocabularyBank, setVocabularyBank, onLogout 
}) => {
  const [tab, setTab] = useState<'stories' | 'vocab' | 'data' | 'status'>('stories');
  const [newTheme, setNewTheme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [diagLog, setDiagLog] = useState<string[]>([]);
  const [proxyInput, setProxyInput] = useState(() => localStorage.getItem('lexitale_api_proxy') || '');
  
  const [newWord, setNewWord] = useState<Partial<VocabularyBankEntry>>({
    word: '', translation: '', level: 'Band8', definition: '', example: ''
  });

  const systemStories = stories.filter(s => !s.isUserGenerated);

  const saveProxy = () => {
    if (proxyInput) {
      localStorage.setItem('lexitale_api_proxy', proxyInput.trim());
    } else {
      localStorage.removeItem('lexitale_api_proxy');
    }
    alert('中枢地址已更新，系统将重载网络层配置。');
    testConnection();
  };

  const exportAllData = () => {
    const data = {
      vocabularyBank,
      stories: systemStories,
      version: "2.2",
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `yasi-backup-${new Date().toLocaleDateString()}.json`;
    link.click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.vocabularyBank) setVocabularyBank(json.vocabularyBank);
        if (json.stories) setStories(prev => [...prev.filter(s => s.isUserGenerated), ...json.stories]);
        alert('数据导入成功！');
      } catch (err) {
        alert('导入失败。');
      }
    };
    reader.readAsText(file);
  };

  const testConnection = async () => {
    setConnectionStatus('testing');
    const activeUrl = localStorage.getItem('lexitale_api_proxy') || process.env.API_BASE_URL || 'Direct (Google Official)';
    setDiagLog(["探测中枢接口...", `当前有效基址: ${activeUrl}`]);
    
    try {
      const start = Date.now();
      const result = await geminiService.generateTTS("Test", 'standard');
      const latency = Date.now() - start;
      
      if (result) {
        setConnectionStatus('success');
        setDiagLog(prev => [...prev, `✓ 连通性校验通过 (${latency}ms)`, "✓ 语音引擎已就绪", "✓ Gemini 3 Flash 响应正常"]);
      } else {
        throw new Error("Empty response from AI engine");
      }
    } catch (e: any) {
      setConnectionStatus('failed');
      setDiagLog(prev => [
        ...prev, 
        "✗ 连接失败 (Connection Failed)", 
        `提示: 请确认是否已开启 VPN 或配置了有效的中转代理地址。`,
        `异常信息: ${e.message}`
      ]);
    }
  };

  const addWordToBank = () => {
    if (!newWord.word || !newWord.translation) return;
    const entry: VocabularyBankEntry = {
      ...newWord as VocabularyBankEntry,
      id: 'vb-' + Date.now(),
      lastUpdated: new Date().toISOString(),
      tags: ['Manual'],
      phonetic: newWord.phonetic || '/.../'
    };
    setVocabularyBank(prev => [entry, ...prev]);
    setNewWord({ word: '', translation: '', level: 'Band8', definition: '', example: '' });
  };

  const generateAIStory = async () => {
    if (!newTheme) return;
    setIsGenerating(true);
    try {
      const shuffled = [...vocabularyBank].sort(() => 0.5 - Math.random());
      const selectedVocab = shuffled.slice(0, 10);
      const newStoryData = await geminiService.generateStoryFromBank(newTheme, selectedVocab);
      setStories(prev => [{ 
        ...newStoryData, 
        id: 'sys-' + Date.now(), 
        dateAdded: new Date().toISOString(), 
        isUserGenerated: false 
      }, ...prev]);
      setNewTheme('');
    } catch (e) {
      alert('生成失败。中国用户请确认已配置代理地址。');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in max-w-4xl mx-auto">
      {/* 顶部标签页 */}
      <div className="flex bg-[#F4ECE4] p-1 rounded-2xl shadow-inner overflow-x-auto no-scrollbar">
        <button onClick={() => setTab('stories')} className={`flex-1 min-w-[80px] py-3 text-[10px] font-bold rounded-xl transition-all ${tab === 'stories' ? 'bg-white shadow-sm text-[#3D2B1F]' : 'text-gray-400'}`}>剧集发布</button>
        <button onClick={() => setTab('vocab')} className={`flex-1 min-w-[80px] py-3 text-[10px] font-bold rounded-xl transition-all ${tab === 'vocab' ? 'bg-white shadow-sm text-[#3D2B1F]' : 'text-gray-400'}`}>核心词库</button>
        <button onClick={() => setTab('data')} className={`flex-1 min-w-[80px] py-3 text-[10px] font-bold rounded-xl transition-all ${tab === 'data' ? 'bg-white shadow-sm text-[#3D2B1F]' : 'text-gray-400'}`}>数据管理</button>
        <button onClick={() => setTab('status')} className={`flex-1 min-w-[80px] py-3 text-[10px] font-bold rounded-xl transition-all ${tab === 'status' ? 'bg-white shadow-sm text-[#3D2B1F]' : 'text-gray-400'}`}>环境监控</button>
      </div>

      {tab === 'status' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="bg-white p-8 rounded-[2.5rem] border border-[#F4ECE4] shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <Settings2 className="w-5 h-5 text-[#A67B5B]" />
                <h3 className="serif-font text-lg font-bold text-[#3D2B1F]">网络连接中枢</h3>
              </div>
              <div className="flex items-center space-x-2">
                 <div className={`w-2 h-2 rounded-full ${connectionStatus === 'success' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse' : connectionStatus === 'failed' ? 'bg-red-500' : 'bg-amber-500'}`} />
                 <span className="text-[9px] font-black uppercase tracking-widest">{connectionStatus.toUpperCase()}</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
               <div className="flex flex-col space-y-2">
                 <label className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-widest ml-1">API 代理基址 (中国地区必填)</label>
                 <div className="flex space-x-2">
                    <div className="relative flex-grow">
                      <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                      <input 
                        type="text" 
                        placeholder="https://your-proxy-domain.com" 
                        value={proxyInput}
                        onChange={(e) => setProxyInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-4 bg-[#FAF7F2] border border-[#F4ECE4] rounded-2xl text-xs outline-none focus:ring-2 focus:ring-[#A67B5B]/10 transition-all font-mono"
                      />
                    </div>
                    <button onClick={saveProxy} className="px-6 bg-[#3D2B1F] text-white rounded-2xl font-bold text-[10px] uppercase shadow-md active:scale-95 transition-all">保存</button>
                 </div>
                 <p className="text-[9px] text-gray-400 mt-1 leading-relaxed px-1">
                   提示：中国用户推荐使用 Vercel 或 Cloudflare 搭建的 Gemini 代理。留空则尝试直连 Google 官方。
                 </p>
               </div>
            </div>

            <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#F4ECE4] mb-6 min-h-[140px]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">连通性诊断日志</span>
                <button onClick={testConnection} className="text-[#A67B5B] hover:rotate-180 transition-transform"><RefreshCw size={14}/></button>
              </div>
              <div className="space-y-2">
                {diagLog.map((log, i) => (
                  <p key={i} className={`text-[10px] font-mono leading-relaxed ${log.includes('✓') ? 'text-green-600' : log.includes('✗') ? 'text-red-500' : 'text-gray-500'}`}>{log}</p>
                ))}
              </div>
            </div>
          </div>
          
          <button onClick={onLogout} className="w-full py-4 text-red-500 font-bold text-xs bg-red-50 rounded-2xl flex items-center justify-center space-x-2">
            <LogOut size={16}/><span>关闭管理大殿</span>
          </button>
        </div>
      )}

      {/* 其余 Tab 内容保持不变 */}
      {tab === 'data' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="bg-white p-8 rounded-[2.5rem] border border-[#F4ECE4] shadow-sm text-center">
            <div className="inline-flex p-4 rounded-full bg-[#FAF7F2] mb-4">
              <Database className="w-8 h-8 text-[#A67B5B]" />
            </div>
            <h3 className="serif-font text-xl font-bold text-[#3D2B1F] mb-2">本地数据中心</h3>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button onClick={exportAllData} className="flex flex-col items-center justify-center p-6 bg-[#FAF7F2] border border-[#F4ECE4] rounded-[2rem] hover:bg-white hover:shadow-md transition-all">
                <Download className="w-6 h-6 mb-2 text-[#A67B5B]" />
                <span className="text-[11px] font-bold text-[#3D2B1F]">导出备份</span>
              </button>
              <label className="flex flex-col items-center justify-center p-6 bg-[#FAF7F2] border border-[#F4ECE4] rounded-[2rem] hover:bg-white hover:shadow-md transition-all cursor-pointer">
                <Upload className="w-6 h-6 mb-2 text-[#A67B5B]" />
                <span className="text-[11px] font-bold text-[#3D2B1F]">导入恢复</span>
                <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      )}

      {tab === 'stories' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-[#F4ECE4] shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Film size={18} className="text-[#A67B5B]" />
              <h3 className="font-bold text-sm text-[#3D2B1F]">官方章节发布</h3>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="剧本主题..." value={newTheme} onChange={(e) => setNewTheme(e.target.value)} className="w-full text-sm px-5 py-4 bg-[#FAF7F2] border border-[#F4ECE4] rounded-2xl outline-none" />
              <button onClick={generateAIStory} disabled={isGenerating || !newTheme} className="w-full bg-[#3D2B1F] text-white py-4 rounded-2xl font-bold flex items-center shadow-lg active:scale-95 transition-all justify-center">
                {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <span>同步上架至书架</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'vocab' && (
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-[2.5rem] border border-[#F4ECE4] shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <PlusCircle size={18} className="text-[#A67B5B]" />
                <h3 className="font-bold text-sm text-[#3D2B1F]">录入雅思核心词</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                 <input type="text" placeholder="Word" value={newWord.word} onChange={e => setNewWord({...newWord, word: e.target.value})} className="px-4 py-3 bg-[#FAF7F2] rounded-xl text-xs outline-none border border-[#F4ECE4]" />
                 <input type="text" placeholder="中文翻译" value={newWord.translation} onChange={e => setNewWord({...newWord, translation: e.target.value})} className="px-4 py-3 bg-[#FAF7F2] rounded-xl text-xs outline-none border border-[#F4ECE4]" />
              </div>
              <textarea placeholder="英文定义与地道例句" value={newWord.definition} onChange={e => setNewWord({...newWord, definition: e.target.value})} className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl text-xs outline-none border border-[#F4ECE4] h-20 mb-3" />
              <button onClick={addWordToBank} className="w-full bg-[#A67B5B] text-white py-4 rounded-2xl font-bold text-xs shadow-md">保存至核心库</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;