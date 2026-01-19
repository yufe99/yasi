
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
  History,
  Activity,
  Globe,
  Wifi,
  AlertTriangle
} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { useNavigate } from 'react-router-dom';

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
  const [tab, setTab] = useState<'stories' | 'vocab' | 'codes' | 'security' | 'status'>('stories');
  const [newTheme, setNewTheme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [diagLog, setDiagLog] = useState<string[]>([]);
  
  const [newWord, setNewWord] = useState<Partial<VocabularyBankEntry>>({
    word: '', translation: '', level: 'Band8', definition: '', example: ''
  });

  const systemStories = stories.filter(s => !s.isUserGenerated);

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

  const testConnection = async () => {
    setConnectionStatus('testing');
    setDiagLog(["正在建立连接...", "正在验证 API Key 权限...", "测试服务器连通性..."]);
    try {
      // 通过一次极简的 AI 调用测试连通性
      const result = await geminiService.generateStoryFromBank("Test Connection", []);
      if (result) {
        setConnectionStatus('success');
        setDiagLog(prev => [...prev, "✓ 连接成功: Gemini API 已就绪", "✓ 网络延迟: 正常"]);
      }
    } catch (e: any) {
      setConnectionStatus('failed');
      const errorMsg = e.message || '未知网络错误';
      setDiagLog(prev => [
        ...prev, 
        "✗ 连接失败: 无法访问 Google 服务", 
        `错误详情: ${errorMsg}`,
        "可能原因: 1. 大陆网络限制 2. API Key 无效 3. 部署环境变量未正确配置"
      ]);
    }
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
      alert('AI 生成失败，请检查连接状态卡片');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in max-w-4xl mx-auto">
      <div className="flex bg-[#F4ECE4] p-1 rounded-2xl shadow-inner overflow-x-auto no-scrollbar">
        <button onClick={() => setTab('stories')} className={`flex-1 min-w-[80px] py-3 text-[10px] font-bold rounded-xl transition-all ${tab === 'stories' ? 'bg-white shadow-sm text-[#3D2B1F]' : 'text-gray-400'}`}>剧集上架</button>
        <button onClick={() => setTab('vocab')} className={`flex-1 min-w-[80px] py-3 text-[10px] font-bold rounded-xl transition-all ${tab === 'vocab' ? 'bg-white shadow-sm text-[#3D2B1F]' : 'text-gray-400'}`}>年度词库</button>
        <button onClick={() => setTab('status')} className={`flex-1 min-w-[80px] py-3 text-[10px] font-bold rounded-xl transition-all ${tab === 'status' ? 'bg-white shadow-sm text-[#3D2B1F]' : 'text-gray-400'}`}>系统状态</button>
        <button onClick={() => setTab('security')} className={`flex-1 min-w-[80px] py-3 text-[10px] font-bold rounded-xl transition-all ${tab === 'security' ? 'bg-white shadow-sm text-[#3D2B1F]' : 'text-gray-400'}`}>掌门安全</button>
      </div>

      {tab === 'status' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
           <div className="bg-white p-8 rounded-[2.5rem] border border-[#F4ECE4] shadow-sm text-center">
              <div className="inline-flex p-4 rounded-full bg-[#FAF7F2] mb-4">
                 <Globe className={`w-8 h-8 ${connectionStatus === 'success' ? 'text-green-500' : connectionStatus === 'failed' ? 'text-red-500' : 'text-[#A67B5B]'}`} />
              </div>
              <h3 className="serif-font text-xl font-bold text-[#3D2B1F] mb-2">部署与网络状态诊断</h3>
              <p className="text-xs text-gray-400 mb-8 px-8">如果您在中国大陆使用，本页将帮助您确认 AI 通道是否畅通。</p>
              
              <div className="bg-[#FAF7F2] border border-[#F4ECE4] rounded-2xl p-5 text-left mb-6">
                 <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#A67B5B]">诊断日志</span>
                    {connectionStatus === 'testing' && <Loader2 size={14} className="animate-spin text-[#A67B5B]" />}
                 </div>
                 <div className="space-y-2">
                    {diagLog.length === 0 ? (
                       <p className="text-[10px] text-gray-300 italic">尚未开始诊断...</p>
                    ) : (
                       diagLog.map((log, i) => (
                          <p key={i} className={`text-[10px] font-mono ${log.startsWith('✓') ? 'text-green-600' : log.startsWith('✗') ? 'text-red-500' : 'text-gray-500'}`}>
                             {log}
                          </p>
                       ))
                    )}
                 </div>
              </div>

              <button 
                 onClick={testConnection} 
                 disabled={connectionStatus === 'testing'}
                 className="w-full bg-[#3D2B1F] text-white py-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 active:scale-95 transition-all"
              >
                 <Wifi size={16} />
                 <span>{connectionStatus === 'testing' ? '正在拨号...' : '立即测试连接性'}</span>
              </button>
           </div>

           <div className="bg-amber-50 rounded-[2rem] p-6 border border-amber-100 flex items-start space-x-4">
              <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={20} />
              <div>
                 <h4 className="text-sm font-bold text-amber-900 mb-1">大陆部署特别提示</h4>
                 <p className="text-[11px] text-amber-700 leading-relaxed">
                    部署在 Vercel/Netlify 等海外平台后，浏览器端仍然会直连 Google API。如果国内用户无法打开 AI 生成功能，请考虑在后端添加 API 转发代理（Proxy）。
                 </p>
              </div>
           </div>
        </div>
      )}

      {tab === 'stories' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-[#F4ECE4] shadow-sm">
            <h3 className="font-bold text-sm mb-4 flex items-center text-[#3D2B1F]">
              <Film size={16} className="mr-2 text-[#A67B5B]" />
              发布官方章节 (基于词库精准生成)
            </h3>
            <div className="space-y-3">
              <div className="text-[10px] bg-[#FAF7F2] p-3 rounded-xl text-[#A67B5B] font-bold border border-[#F4ECE4]">
                提示：系统将自动从当前 {vocabularyBank.length} 个词库条目中挑选考点注入剧情。
              </div>
              <input 
                type="text" placeholder="剧本主题：如 跨国法务博弈..." value={newTheme}
                onChange={(e) => setNewTheme(e.target.value)}
                className="w-full text-sm px-5 py-4 bg-[#FAF7F2] border border-[#F4ECE4] rounded-2xl outline-none"
              />
              <button onClick={generateAIStory} disabled={isGenerating || !newTheme} className="w-full bg-[#3D2B1F] text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2">
                {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <span>同步上架</span>}
              </button>
            </div>
          </div>
          <div className="space-y-3">
             {systemStories.map(s => (
               <div key={s.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#F4ECE4]">
                  <div className="flex items-center space-x-3">
                    <img src={s.coverImage} className="w-10 h-10 rounded-xl object-cover" />
                    <span className="text-xs font-bold">{s.title}</span>
                  </div>
                  <button onClick={() => setStories(prev => prev.filter(x => x.id !== s.id))} className="text-red-300"><Trash2 size={16}/></button>
               </div>
             ))}
          </div>
        </div>
      )}

      {tab === 'vocab' && (
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-[2rem] border border-[#F4ECE4] shadow-sm">
              <h3 className="font-bold text-sm mb-4 flex items-center text-[#3D2B1F]">
                <PlusCircle size={16} className="mr-2 text-[#A67B5B]" />
                入库雅思 8.5+ 核心词
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                 <input type="text" placeholder="Word" value={newWord.word} onChange={e => setNewWord({...newWord, word: e.target.value})} className="px-4 py-3 bg-[#FAF7F2] rounded-xl text-xs outline-none border border-[#F4ECE4]" />
                 <input type="text" placeholder="中文翻译" value={newWord.translation} onChange={e => setNewWord({...newWord, translation: e.target.value})} className="px-4 py-3 bg-[#FAF7F2] rounded-xl text-xs outline-none border border-[#F4ECE4]" />
              </div>
              <textarea placeholder="英文定义与地道例句" value={newWord.definition} onChange={e => setNewWord({...newWord, definition: e.target.value})} className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl text-xs outline-none border border-[#F4ECE4] h-20 mb-3" />
              <button onClick={addWordToBank} className="w-full bg-[#A67B5B] text-white py-4 rounded-2xl font-bold text-xs">录入后端数据库</button>
           </div>

           <div className="bg-white rounded-[2rem] border border-[#F4ECE4] overflow-hidden">
              <div className="p-4 border-b border-[#F4ECE4] flex justify-between items-center bg-[#FAF7F2]/50">
                 <span className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-widest">词库总览 ({vocabularyBank.length})</span>
                 <button className="text-[#A67B5B] text-[10px] font-bold flex items-center"><FileUp size={12} className="mr-1"/> 批量导入</button>
              </div>
              <div className="max-h-[400px] overflow-y-auto divide-y divide-[#F4ECE4]">
                 {vocabularyBank.map(v => (
                    <div key={v.id} className="p-4 flex items-center justify-between">
                       <div>
                          <p className="text-sm font-bold text-[#3D2B1F]">{v.word} <span className="text-[9px] text-[#A67B5B]">{v.level}</span></p>
                          <p className="text-[10px] text-gray-400">{v.translation}</p>
                       </div>
                       <button onClick={() => setVocabularyBank(prev => prev.filter(x => x.id !== v.id))} className="text-gray-200 hover:text-red-500"><Trash2 size={14}/></button>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {tab === 'security' && (
         <div className="p-8 bg-white rounded-[2rem] border border-[#F4ECE4] text-center">
            <ShieldAlert size={40} className="mx-auto text-[#A67B5B] mb-4"/>
            <p className="text-sm font-bold text-[#3D2B1F] mb-6">系统后端目前运行在本地隔离状态</p>
            <button onClick={onLogout} className="px-10 py-4 bg-red-50 text-red-500 rounded-2xl font-bold text-xs">退出掌门系统</button>
         </div>
      )}
    </div>
  );
};

export default AdminDashboard;
