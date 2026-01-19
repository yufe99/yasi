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
  RefreshCw
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
  
  const [newWord, setNewWord] = useState<Partial<VocabularyBankEntry>>({
    word: '', translation: '', level: 'Band8', definition: '', example: ''
  });

  const systemStories = stories.filter(s => !s.isUserGenerated);

  // --- 数据管理逻辑 ---
  const exportAllData = () => {
    const data = {
      vocabularyBank,
      stories: systemStories,
      version: "2.1",
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
        alert('数据导入成功！词库与官方剧集已同步更新。');
      } catch (err) {
        alert('无效的 JSON 文件，请检查格式。');
      }
    };
    reader.readAsText(file);
  };

  const testConnection = async () => {
    setConnectionStatus('testing');
    setDiagLog(["正在探测接口...", `当前代理地址: ${process.env.API_BASE_URL || '直连模式'}`]);
    try {
      const result = await geminiService.generateTTS("Connection test", 'standard');
      if (result) {
        setConnectionStatus('success');
        setDiagLog(prev => [...prev, "✓ 语音引擎连通成功", "✓ Gemini API 响应正常"]);
      }
    } catch (e: any) {
      setConnectionStatus('failed');
      setDiagLog(prev => [...prev, "✗ 连接失败", `详细错误: ${e.message}`]);
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
      alert('生成失败，请确认 API Key 及代理状态。');
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

      {tab === 'data' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="bg-white p-8 rounded-[2.5rem] border border-[#F4ECE4] shadow-sm text-center">
            <div className="inline-flex p-4 rounded-full bg-[#FAF7F2] mb-4">
              <Database className="w-8 h-8 text-[#A67B5B]" />
            </div>
            <h3 className="serif-font text-xl font-bold text-[#3D2B1F] mb-2">本地数据中心</h3>
            <p className="text-[11px] text-gray-400 mb-8">管理应用内的所有官方词库条目与剧集内容。</p>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={exportAllData}
                className="flex flex-col items-center justify-center p-6 bg-[#FAF7F2] border border-[#F4ECE4] rounded-[2rem] hover:bg-white hover:shadow-md transition-all group"
              >
                <Download className="w-6 h-6 mb-2 text-[#A67B5B] group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold text-[#3D2B1F]">导出备份 (.json)</span>
              </button>
              
              <label className="flex flex-col items-center justify-center p-6 bg-[#FAF7F2] border border-[#F4ECE4] rounded-[2rem] hover:bg-white hover:shadow-md transition-all group cursor-pointer">
                <Upload className="w-6 h-6 mb-2 text-[#A67B5B] group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold text-[#3D2B1F]">导入/恢复数据</span>
                <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
              </label>
            </div>

            <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start space-x-3 text-left">
              <AlertTriangle className="text-amber-500 shrink-0 w-4 h-4 mt-0.5" />
              <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                当前数据仅存储于本地浏览器。若需迁移，请先导出备份文件。
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === 'status' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="bg-white p-8 rounded-[2.5rem] border border-[#F4ECE4] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Globe className={`w-5 h-5 ${connectionStatus === 'success' ? 'text-green-500' : 'text-[#A67B5B]'}`} />
                <h3 className="serif-font text-lg font-bold text-[#3D2B1F]">后端通信状态</h3>
              </div>
              <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${connectionStatus === 'success' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                {connectionStatus === 'success' ? 'ONLINE' : 'PENDING'}
              </div>
            </div>

            <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#F4ECE4] mb-6 min-h-[120px]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">诊断输出</span>
                <button onClick={testConnection} className="text-[#A67B5B] hover:rotate-180 transition-transform"><RefreshCw size={14}/></button>
              </div>
              <div className="space-y-2">
                {diagLog.map((log, i) => (
                  <p key={i} className="text-[10px] font-mono text-gray-500 leading-relaxed">{log}</p>
                ))}
              </div>
            </div>

            <div className="space-y-3">
               <div className="flex justify-between items-center px-4 py-3 bg-white border border-[#F4ECE4] rounded-xl text-[11px]">
                 <span className="text-gray-400 font-bold">代理地址 (Base URL)</span>
                 <span className="font-mono text-[#3D2B1F]">{process.env.API_BASE_URL || '未配置 (默认直连)'}</span>
               </div>
               <div className="flex justify-between items-center px-4 py-3 bg-white border border-[#F4ECE4] rounded-xl text-[11px]">
                 <span className="text-gray-400 font-bold">API KEY 状态</span>
                 <span className="text-green-500 font-bold">已挂载</span>
               </div>
            </div>
          </div>
          
          <button onClick={onLogout} className="w-full py-4 text-red-500 font-bold text-xs bg-red-50 rounded-2xl flex items-center justify-center space-x-2">
            <LogOut size={16}/><span>关闭管理大殿</span>
          </button>
        </div>
      )}

      {tab === 'stories' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-[#F4ECE4] shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Film size={18} className="text-[#A67B5B]" />
              <h3 className="font-bold text-sm text-[#3D2B1F]">官方章节编辑器</h3>
            </div>
            <div className="space-y-3">
              <input 
                type="text" placeholder="剧本主题：如 伦敦金融城的午夜交易..." value={newTheme}
                onChange={(e) => setNewTheme(e.target.value)}
                className="w-full text-sm px-5 py-4 bg-[#FAF7F2] border border-[#F4ECE4] rounded-2xl outline-none"
              />
              <button onClick={generateAIStory} disabled={isGenerating || !newTheme} className="w-full bg-[#3D2B1F] text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-all">
                {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <span>同步上架至书架</span>}
              </button>
            </div>
          </div>
          <div className="grid gap-3">
             {systemStories.map(s => (
               <div key={s.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#F4ECE4] group hover:border-[#A67B5B]/30 transition-all">
                  <div className="flex items-center space-x-4">
                    <img src={s.coverImage} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                    <div>
                      <span className="text-xs font-bold text-[#3D2B1F] block">{s.title}</span>
                      <span className="text-[9px] text-[#A67B5B] uppercase font-bold tracking-wider">{s.genre}</span>
                    </div>
                  </div>
                  <button onClick={() => setStories(prev => prev.filter(x => x.id !== s.id))} className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
               </div>
             ))}
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

           <div className="bg-white rounded-[2.5rem] border border-[#F4ECE4] overflow-hidden shadow-sm">
              <div className="p-5 border-b border-[#F4ECE4] flex justify-between items-center bg-[#FAF7F2]/50">
                 <span className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-widest">词库总览 ({vocabularyBank.length})</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto divide-y divide-[#F4ECE4]">
                 {vocabularyBank.map(v => (
                    <div key={v.id} className="p-5 flex items-center justify-between group hover:bg-[#FAF7F2]/30 transition-colors">
                       <div>
                          <p className="text-sm font-bold text-[#3D2B1F]">{v.word} <span className="text-[9px] bg-[#F4ECE4] text-[#A67B5B] px-1 rounded ml-1">{v.level}</span></p>
                          <p className="text-[10px] text-gray-400 mt-1">{v.translation}</p>
                       </div>
                       <button onClick={() => setVocabularyBank(prev => prev.filter(x => x.id !== v.id))} className="text-gray-200 group-hover:text-red-300 transition-colors"><Trash2 size={14}/></button>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;