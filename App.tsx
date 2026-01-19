import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { INITIAL_STORIES } from './constants';
import { Story, UserProgress, UserRole, ActivationCode, VocabularyBankEntry } from './types';
import Reader from './components/Reader';
import Lexicon from './components/Lexicon';
import Auth from './components/Auth';
import AdminDashboard from './components/AdminDashboard';
import LearningPlan from './components/LearningPlan';
import { geminiService } from './services/geminiService';
import { 
  Library, 
  Layout, 
  User as UserIcon, 
  Home as HomeIcon, 
  ShieldCheck, 
  PlusSquare, 
  Sparkles, 
  X, 
  Loader2, 
  ArrowRight, 
  LogOut, 
  Database,
  Key
} from 'lucide-react';

// --- Home Component ---
const Home: React.FC<{ stories: Story[]; progress: UserProgress; onTriggerGen: () => void; onImportKey: () => void; }> = ({ stories, progress, onTriggerGen, onImportKey }) => {
  const navigate = useNavigate();
  const rootStories = stories.filter(s => !s.prevId);
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="bg-[#3D2B1F] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl border border-[#A67B5B]/20">
        <div className="relative z-10">
          <p className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-widest mb-2">后端语料已同步</p>
          <h2 className="serif-font text-3xl font-bold mb-6">已吞噬词汇：<span className="text-[#A67B5B]">{progress.masteredWords.length}</span></h2>
          <div className="flex space-x-3">
            <button onClick={onTriggerGen} className="flex-1 bg-[#A67B5B] text-white py-3 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-all">
              <PlusSquare size={16} /><span>开启定制</span>
            </button>
            <button onClick={onImportKey} className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 text-white py-3 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 active:scale-95 transition-all">
              <Key size={16} /><span>秘钥解析</span>
            </button>
          </div>
        </div>
        <Sparkles className="absolute -right-6 -bottom-6 text-white/5" size={160} />
      </div>
      <div className="space-y-6">
        <h3 className="serif-font text-xl font-bold text-[#3D2B1F]">官方/私人藏书</h3>
        <div className="space-y-6">
          {rootStories.map(story => (
             <div key={story.id} onClick={() => navigate(`/reader/${story.id}`)} className="bg-white rounded-[2rem] overflow-hidden border border-[#F4ECE4] shadow-sm flex flex-col active:scale-[0.98]">
                <div className="relative h-40 bg-[#FAF7F2]">
                   <img src={story.coverImage} className="w-full h-full object-cover" alt={story.title} />
                   <div className="absolute inset-0 bg-gradient-to-t from-[#3D2B1F]/80 to-transparent" />
                   <div className="absolute bottom-4 left-6">
                      <span className="text-[8px] font-black bg-[#A67B5B] text-white px-2 py-0.5 rounded uppercase">{story.genre}</span>
                      <h4 className="serif-font text-lg font-bold text-white mt-1">{story.title}</h4>
                   </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                   <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Episode 1</span>
                   <div className="flex items-center text-[#A67B5B] font-bold text-[9px] uppercase">
                      <span>开启修行</span><ArrowRight size={14} className="ml-1" />
                   </div>
                </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- App Content ---
const AppContent: React.FC = () => {
  const [role, setRole] = useState<UserRole>(() => (localStorage.getItem('user_role') as UserRole) || UserRole.GUEST);
  const [stories, setStories] = useState<Story[]>(() => {
    const saved = localStorage.getItem('user_stories');
    return saved ? JSON.parse(saved) : INITIAL_STORIES;
  });
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('user_progress');
    return saved ? JSON.parse(saved) : { masteredWords: [], collectedWords: [], completedStories: [], currentPlanLevel: 1, isVip: false, freeStoriesRead: 0 };
  });
  const [vocabularyBank, setVocabularyBank] = useState<VocabularyBankEntry[]>(() => {
    const saved = localStorage.getItem('vocabulary_bank');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenModal, setShowGenModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [userOutline, setUserOutline] = useState('');
  const [importKey, setImportKey] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('user_role', role);
    localStorage.setItem('user_progress', JSON.stringify(progress));
    localStorage.setItem('user_stories', JSON.stringify(stories));
    localStorage.setItem('vocabulary_bank', JSON.stringify(vocabularyBank));
  }, [role, progress, stories, vocabularyBank]);

  const handleLogout = () => {
    setRole(UserRole.GUEST);
    navigate('/auth');
  };

  const handleImportKey = () => {
    try {
      const decodedJson = decodeURIComponent(escape(atob(importKey)));
      const payload = JSON.parse(decodedJson);
      if (payload.type === 'STORY_KEY') {
        const newStory: Story = {
          ...payload.data,
          id: 'imported-' + Date.now(),
          dateAdded: new Date().toISOString(),
          isUserGenerated: true
        };
        setStories(prev => [newStory, ...prev]);
        setShowImportModal(false);
        setImportKey('');
        alert('解析成功！新剧本已收录至书架。');
        navigate(`/reader/${newStory.id}`);
      } else {
        throw new Error('Invalid key type');
      }
    } catch (e) {
      alert('秘钥解析失败：无效的代码或格式已损坏。');
    }
  };

  const handleExtendStory = async (prevStory: Story) => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const extensionData = await geminiService.extendStory(prevStory);
      const newId = 'user-ext-' + Date.now();
      const newStory: Story = { ...extensionData, id: newId, dateAdded: new Date().toISOString(), isUserGenerated: true, prevId: prevStory.id };
      setStories(prev => {
        const updated = prev.map(s => s.id === prevStory.id ? { ...s, nextId: newId } : s);
        return [...updated, newStory];
      });
      navigate(`/reader/${newId}`);
    } catch (e) {
      alert('续写失败，请检查配置。');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateUserStory = async () => {
    if (!userOutline || isGenerating) return;
    setIsGenerating(true);
    try {
      const shuffled = [...vocabularyBank].sort(() => 0.5 - Math.random()).slice(0, 8);
      const newStoryData = await geminiService.generateStoryFromBank(userOutline, shuffled);
      const newStory: Story = { ...newStoryData, id: 'user-' + Date.now(), dateAdded: new Date().toISOString(), isUserGenerated: true };
      setStories(prev => [newStory, ...prev]);
      setShowGenModal(false);
      setUserOutline('');
      navigate(`/reader/${newStory.id}`);
    } catch (e) {
      alert('生成失败。');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#FDFBF9] shadow-2xl relative overflow-x-hidden pb-20 text-[#3D2B1F]">
      <header className="px-6 pt-8 pb-4 sticky top-0 bg-[#FDFBF9]/90 backdrop-blur-md z-40 border-b border-[#F4ECE4]/30">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex flex-col">
            <span className="text-[10px] font-bold text-[#A67B5B] tracking-widest uppercase mb-1">后端词库驱动系统</span>
            <h1 className="serif-font text-2xl font-bold tracking-tight text-[#3D2B1F]">邪修雅思</h1>
          </Link>
          <div className="bg-[#F4ECE4] px-2 py-0.5 rounded-full flex items-center">
            <Database size={10} className="text-[#A67B5B] mr-1" />
            <span className="text-[9px] font-bold text-[#6F4E37] uppercase">V2.1 Elite</span>
          </div>
        </div>
      </header>

      <main className="px-6 py-4">
        <Routes>
          <Route path="/auth" element={<Auth onLogin={setRole} />} />
          <Route path="/" element={role === UserRole.GUEST ? <Navigate to="/auth" replace /> : <Home stories={stories} progress={progress} onTriggerGen={() => setShowGenModal(true)} onImportKey={() => setShowImportModal(true)} />} />
          <Route path="/reader/:storyId" element={<Reader stories={stories} progress={progress} onCollect={(id) => setProgress(p => p.collectedWords.includes(id) ? p : ({...p, collectedWords: [...p.collectedWords, id]}))} onMaster={(id) => setProgress(p => p.masteredWords.includes(id) ? p : ({...p, masteredWords: [...p.masteredWords, id]}))} onExtend={handleExtendStory} isGenerating={isGenerating} onStoryRead={(id) => setProgress(p => p.completedStories.includes(id) ? p : ({...p, completedStories: [...p.completedStories, id]}))} />} />
          <Route path="/lexicon" element={<Lexicon stories={stories} progress={progress} />} />
          <Route path="/plan" element={<LearningPlan progress={progress} />} />
          <Route path="/profile" element={<div className="py-12 text-center space-y-4">
             <div className="w-20 h-20 bg-[#F4ECE4] rounded-full mx-auto flex items-center justify-center border-4 border-white shadow-xl"><UserIcon size={32} className="text-[#A67B5B]" /></div>
             <h2 className="serif-font text-xl font-bold">雅思修士</h2>
             {role === UserRole.ADMIN && <button onClick={() => navigate('/admin')} className="w-full bg-[#FAF7F2] border border-[#F4ECE4] text-[#6F4E37] py-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2"><ShieldCheck size={18} /><span>掌门大殿</span></button>}
             <button onClick={handleLogout} className="w-full bg-white border border-[#F4ECE4] text-red-500 py-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2"><LogOut size={16}/><span>退出登录</span></button>
          </div>} />
          <Route path="/admin" element={role === UserRole.ADMIN ? <AdminDashboard stories={stories} setStories={setStories} codes={[]} setCodes={()=>{}} vocabularyBank={vocabularyBank} setVocabularyBank={setVocabularyBank} onLogout={handleLogout} /> : <Navigate to="/" replace />} />
        </Routes>
      </main>

      {role !== UserRole.GUEST && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F4ECE4] flex justify-around items-center h-16 px-4 z-50 shadow-lg">
          <Link to="/" className={`flex flex-col items-center ${location.pathname === '/' ? 'text-[#A67B5B]' : 'text-gray-300'}`}><HomeIcon size={20} /><span className="text-[10px] font-bold">书架</span></Link>
          <Link to="/plan" className={`flex flex-col items-center ${location.pathname === '/plan' ? 'text-[#A67B5B]' : 'text-gray-300'}`}><Layout size={20} /><span className="text-[10px] font-bold">计划</span></Link>
          <Link to="/lexicon" className={`flex flex-col items-center ${location.pathname === '/lexicon' ? 'text-[#A67B5B]' : 'text-gray-300'}`}><Library size={20} /><span className="text-[10px] font-bold">语料</span></Link>
          <Link to="/profile" className={`flex flex-col items-center ${location.pathname.startsWith('/profile') || location.pathname.startsWith('/admin') ? 'text-[#A67B5B]' : 'text-gray-300'}`}><UserIcon size={20} /><span className="text-[10px] font-bold">我的</span></Link>
        </nav>
      )}

      {/* Generation Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#3D2B1F]/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#FDFBF9] w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-[#F4ECE4]">
            <div className="flex justify-between items-start mb-6">
              <h3 className="serif-font text-xl font-bold text-[#3D2B1F]">定制专属剧情</h3>
              <button onClick={() => setShowGenModal(false)}><X size={20} className="text-gray-300" /></button>
            </div>
            <textarea value={userOutline} onChange={(e) => setUserOutline(e.target.value)} placeholder="描述您的爽文蓝图..." className="w-full h-32 bg-[#FAF7F2] border border-[#F4ECE4] rounded-2xl p-4 text-sm mb-6 outline-none" />
            <button onClick={generateUserStory} disabled={isGenerating || !userOutline} className="w-full bg-[#3D2B1F] text-[#FDFBF9] py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg">
              {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <span>开始创作</span>}
            </button>
          </div>
        </div>
      )}

      {/* Import Key Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#3D2B1F]/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#FDFBF9] w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-[#F4ECE4]">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-2">
                 <Key size={20} className="text-[#A67B5B]" />
                 <h3 className="serif-font text-xl font-bold text-[#3D2B1F]">秘钥解析中心</h3>
              </div>
              <button onClick={() => setShowImportModal(false)}><X size={20} className="text-gray-300" /></button>
            </div>
            <p className="text-[11px] text-gray-500 mb-6 leading-relaxed">粘贴他人分享的剧本秘钥或词库代码，系统将自动解密并同步至您的本地修行洞府。</p>
            <textarea value={importKey} onChange={(e) => setImportKey(e.target.value)} placeholder="请粘贴剧本秘钥代码..." className="w-full h-32 bg-[#FAF7F2] border border-[#F4ECE4] rounded-2xl p-4 text-[10px] font-mono mb-6 outline-none" />
            <button onClick={handleImportKey} disabled={!importKey} className="w-full bg-[#3D2B1F] text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg">
               <span>开启解密</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => (
  <HashRouter><AppContent /></HashRouter>
);

export default App;