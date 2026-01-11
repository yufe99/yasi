import React, { useState, useEffect } from 'react';
import { Story, ActivationCode, MembershipType } from '../types';
import { Plus, Trash2, Key, Film, Check, Copy, Loader2, LogOut, ShieldAlert, Save } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { useNavigate } from 'react-router-dom';

interface AdminDashboardProps {
  stories: Story[];
  setStories: React.Dispatch<React.SetStateAction<Story[]>>;
  codes: ActivationCode[];
  setCodes: React.Dispatch<React.SetStateAction<ActivationCode[]>>;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ stories, setStories, codes, setCodes, onLogout }) => {
  const [tab, setTab] = useState<'stories' | 'codes' | 'security'>('stories');
  const [newTheme, setNewTheme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState<MembershipType>('monthly');
  const [adminPass, setAdminPass] = useState('');
  const [passStatus, setPassStatus] = useState('');
  const navigate = useNavigate();

  // STRICTOR FILTER: Only show stories that are NOT user generated
  const systemStories = stories.filter(s => !s.isUserGenerated);

  useEffect(() => {
    const saved = localStorage.getItem('admin_password') || 'admin123';
    setAdminPass(saved);
  }, []);

  const handleUpdatePassword = () => {
    if (adminPass.length < 6) {
      setPassStatus('密码长度至少 6 位');
      return;
    }
    localStorage.setItem('admin_password', adminPass);
    setPassStatus('密钥更新成功！');
    setTimeout(() => setPassStatus(''), 2000);
  };

  const generateAIStory = async () => {
    if (!newTheme) return;
    setIsGenerating(true);
    try {
      const newStory = await geminiService.generateStory(newTheme);
      // Explicitly set isUserGenerated to false for official stories
      setStories(prev => [{ 
        ...newStory, 
        id: 'sys-' + Date.now(), 
        dateAdded: new Date().toISOString(), 
        isUserGenerated: false 
      }, ...prev]);
      setNewTheme('');
    } catch (e) {
      alert('AI 生成失败，请检查配置');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCode = () => {
    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    setCodes(prev => [...prev, { 
      code: newCode, 
      isUsed: false, 
      expiresAt: '2025-12-31',
      type: selectedType
    }]);
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in">
      <div className="flex bg-[#F4ECE4] p-1 rounded-xl shadow-inner">
        <button onClick={() => setTab('stories')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${tab === 'stories' ? 'bg-white shadow-sm text-[#3D2B1F]' : 'text-gray-400'}`}>官方上架</button>
        <button onClick={() => setTab('codes')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${tab === 'codes' ? 'bg-white shadow-sm text-[#3D2B1F]' : 'text-gray-400'}`}>灵石码</button>
        <button onClick={() => setTab('security')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${tab === 'security' ? 'bg-white shadow-sm text-[#3D2B1F]' : 'text-gray-400'}`}>密钥安全</button>
      </div>

      {tab === 'stories' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#F4ECE4] space-y-4 shadow-sm">
            <h3 className="font-bold text-sm flex items-center text-[#3D2B1F] italic">
              <Film size={16} className="mr-2 text-[#A67B5B]" />
              发布官方沉浸式章节
            </h3>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="设定雅思剧本主题..." 
                value={newTheme}
                onChange={(e) => setNewTheme(e.target.value)}
                className="w-full text-sm px-4 py-3 bg-[#FAF7F2] border border-[#F4ECE4] rounded-xl outline-none text-[#3D2B1F] focus:bg-white focus:border-[#A67B5B] transition-all font-medium"
              />
              <button 
                onClick={generateAIStory}
                disabled={isGenerating || !newTheme}
                className="w-full bg-[#3D2B1F] text-white py-4 rounded-xl text-xs font-bold disabled:bg-gray-200 flex items-center justify-center space-x-2 shadow-lg"
              >
                {isGenerating ? <><Loader2 size={14} className="animate-spin" /><span>构思中...</span></> : <span>同步上架到官方书架</span>}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">官方章节库 ({systemStories.length})</h4>
            {systemStories.map(s => (
              <div key={s.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#F4ECE4] shadow-sm">
                <div className="flex items-center space-x-3">
                  <img src={s.coverImage} className="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <p className="text-sm font-bold text-[#3D2B1F]">{s.title}</p>
                    <p className="text-[10px] text-gray-400">{s.vocabulary.length} 核心词 • {s.genre}</p>
                  </div>
                </div>
                <button onClick={() => setStories(prev => prev.filter(st => st.id !== s.id))} className="text-gray-300 hover:text-red-500 transition-colors p-2">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {systemStories.length === 0 && <p className="text-center py-8 text-xs text-gray-300">暂无官方剧集</p>}
          </div>
        </div>
      )}

      {tab === 'codes' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#F4ECE4] space-y-4 shadow-sm">
             <h3 className="font-bold text-sm text-[#3D2B1F]">修行灵石码生成</h3>
             <div className="flex bg-[#F4ECE4] p-1 rounded-xl">
                <button onClick={() => setSelectedType('monthly')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg ${selectedType === 'monthly' ? 'bg-[#3D2B1F] text-white' : 'text-gray-400'}`}>月度码</button>
                <button onClick={() => setSelectedType('annual')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg ${selectedType === 'annual' ? 'bg-[#3D2B1F] text-white' : 'text-gray-400'}`}>年度码</button>
             </div>
             <button onClick={generateCode} className="w-full py-4 bg-[#A67B5B] text-white rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg">
                <Plus size={18} />
                <span>生成灵石代码</span>
              </button>
          </div>

          <div className="bg-white rounded-3xl border border-[#F4ECE4] overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-[#FAF7F2] text-[10px] uppercase font-bold text-[#A67B5B]">
                <tr>
                  <th className="p-4">代码</th>
                  <th className="p-4">状态</th>
                  <th className="p-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4ECE4]">
                {codes.map(c => (
                  <tr key={c.code} className="text-xs">
                    <td className="p-4 font-mono font-bold text-[#3D2B1F]">{c.code}</td>
                    <td className="p-4">
                      {c.isUsed ? <span className="text-gray-300">已失效</span> : <span className="text-green-500 font-bold">待激活</span>}
                    </td>
                    <td className="p-4 text-right">
                       <button onClick={() => navigator.clipboard.writeText(c.code)} className="text-gray-400 hover:text-[#A67B5B] transition-colors"><Copy size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <div className="bg-white p-8 rounded-[2.5rem] border border-[#F4ECE4] shadow-sm space-y-6">
             <div className="flex items-center space-x-3 text-[#A67B5B]">
                <ShieldAlert size={24} />
                <h3 className="font-bold text-lg">掌门密钥管理</h3>
             </div>
             <div className="space-y-3">
                <input 
                  type="text" 
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#F4ECE4] rounded-2xl py-4 px-5 text-sm font-bold text-[#3D2B1F] focus:bg-white focus:border-[#A67B5B] outline-none transition-all"
                />
                <button onClick={handleUpdatePassword} className="w-full bg-[#3D2B1F] text-white py-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2">
                  <Save size={16} />
                  <span>保存新密钥</span>
                </button>
                {passStatus && <p className="text-center text-[10px] font-bold text-[#A67B5B] mt-2">{passStatus}</p>}
             </div>
             <div className="pt-6 border-t border-[#F4ECE4]">
                <button onClick={onLogout} className="w-full bg-red-50 text-red-500 py-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 hover:bg-red-100 transition-colors">
                  <LogOut size={16} />
                  <span>退出系统</span>
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;