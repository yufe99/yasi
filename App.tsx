
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { INITIAL_STORIES } from './constants';
import { Story, UserProgress, UserRole, ActivationCode } from './types';
import Reader from './components/Reader';
import Lexicon from './components/Lexicon';
import Auth from './components/Auth';
import AdminDashboard from './components/AdminDashboard';
import LearningPlan from './components/LearningPlan';
import { geminiService } from './services/geminiService';
import { Book, Library, Layout, User as UserIcon, Home as HomeIcon, Star, ShieldCheck, PlusSquare, Sparkles, X, Loader2, ArrowRight, LogOut, ImageOff, Trash2, Layers } from 'lucide-react';

// --- Home Component ---
const Home: React.FC<{ 
  stories: Story[]; 
  progress: UserProgress; 
  onTriggerGen: () => void;
  onDeleteStory: (id: string) => void;
}> = ({ stories, progress, onTriggerGen, onDeleteStory }) => {
  const navigate = useNavigate();

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'; 
  };

  // 首页只显示根剧集
  const rootStories = useMemo(() => stories.filter(s => !s.prevId), [stories]);

  const getEpisodeCount = (rootId: string) => {
    let count = 0;
    let currentId: string | undefined = rootId;
    const visited = new Set();
    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      count++;
      const currentStory = stories.find(s => s.id === currentId);
      currentId = currentStory?.nextId;
    }
    return count;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="bg-[#3D2B1F] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl border border-[#A67B5B]/20">
        <div className="relative z-10">
          <p className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-widest mb-2">精英求索者，欢迎归位</p>
          <h2 className="serif-font text-3xl font-bold mb-6">已吞噬词汇：<span className="text-[#A67B5B]">{progress.masteredWords.length}</span></h2>
          <button 
            onClick={onTriggerGen}
            className="bg-[#A67B5B] hover:bg-[#8B654A] text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center space-x-2 transition-all shadow-lg active:scale-95 border border-white/10"
          >
            <PlusSquare size={18} />
            <span>私人定制剧集</span>
          </button>
        </div>
        <Sparkles className="absolute -right-6 -bottom-6 text-white/5" size={160} />
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h3 className="serif-font text-xl font-bold text-[#3D2B1F]">剧情目录</h3>
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{rootStories.length} Series</span>
        </div>
        <div className="space-y-6">
          {rootStories.map(story => {
            const epCount = getEpisodeCount(story.id);
            return (
              <div 
                key={story.id} 
                onClick={() => navigate(`/reader/${story.id}`)}
                className="group bg-white rounded-[2rem] overflow-hidden border border-[#F4ECE4] shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col active:scale-[0.98] relative"
              >
                <div className="relative h-48 bg-[#FAF7F2] flex items-center justify-center overflow-hidden">
                  {story.coverImage ? (
                    <img 
                      src={story.coverImage} 
                      alt={story.title} 
                      onError={handleImageError}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    />
                  ) : (
                    <ImageOff size={40} className="text-gray-200" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3D2B1F]/90 via-[#3D2B1F]/20 to-transparent" />
                  <div className="absolute top-4 right-4">
                     <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-sm">
                        <Layers size={10} className="text-[#A67B5B]" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">{epCount} Episodes</span>
                     </div>
                  </div>
                  <div className="absolute bottom-4 left-6 right-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-[8px] font-black bg-[#A67B5B] text-white px-2 py-0.5 rounded uppercase tracking-wider">
                        {story.genre}
                      </span>
                    </div>
                    <h4 className="serif-font text-xl font-bold text-white line-clamp-2 leading-tight mt-2">{story.title}</h4>
                  </div>
                </div>
                <div className="p-5 flex justify-between items-center relative z-10">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Book size={12} className="text-[#A67B5B]" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase">系列详情</span>
                    </div>
                    
                    {/* 移除按钮：确保在高 z-index 层级并彻底阻止冒泡 */}
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDeleteStory(story.id);
                      }}
                      className="flex items-center space-x-1 text-gray-300 hover:text-red-500 transition-colors py-2 px-2 -m-2 rounded-lg hover:bg-red-50 relative z-20"
                    >
                      <Trash2 size={12} />
                      <span className="text-[10px] font-bold uppercase">移除系列</span>
                    </button>
                  </div>
                  <div className="flex items-center text-[#A67B5B] font-bold text-[10px] uppercase tracking-widest">
                    <span>开始修行</span>
                    <ArrowRight size={14} className="ml-1" />
                  </div>
                </div>
              </div>
            );
          })}
          {rootStories.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-[#F4ECE4] rounded-[2rem]">
               <p className="text-gray-300 text-sm italic">书架空空如也，点击上方“定制剧集”开启修行</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Profile Component ---
const Profile: React.FC<{ role: UserRole; progress: UserProgress; onLogout: () => void; onActivate: (code: string) => boolean }> = ({ role, progress, onLogout, onActivate }) => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleActivate = () => {
    if (onActivate(code)) {
      setStatus('特权已开启');
      setCode('');
    } else {
      setStatus('无效的灵石代码');
    }
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-12">
      <div className="flex flex-col items-center py-8">
        <div className="w-24 h-24 bg-[#F4ECE4] rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-xl overflow-hidden">
          <UserIcon size={40} className="text-[#A67B5B]" />
        </div>
        <h2 className="serif-font text-2xl font-bold text-[#3D2B1F]">雅思修士</h2>
        <p className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-widest mt-1">
          {progress.isVip ? '精英特权已开启' : '普通修行中'}
        </p>
      </div>

      {!progress.isVip && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-[#F4ECE4] shadow-sm space-y-6">
          <h3 className="font-bold text-sm text-[#3D2B1F]">开启无限续写特权</h3>
          <div className="space-y-3">
            <input 
              type="text" placeholder="输入灵石代码..." value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full bg-[#FAF7F2] border border-[#F4ECE4] rounded-2xl py-4 px-5 text-sm font-bold text-[#3D2B1F] outline-none"
            />
            <button onClick={handleActivate} className="w-full bg-[#3D2B1F] text-white py-4 rounded-2xl font-bold text-xs shadow-lg active:scale-95">立即激活</button>
            {status && <p className="text-center text-[10px] font-bold text-[#A67B5B]">{status}</p>}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {role === UserRole.ADMIN && (
          <button onClick={() => navigate('/admin')} className="w-full bg-[#F4ECE4] text-[#6F4E37] py-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2">
            <ShieldCheck size={18} /> <span>进入管理后台</span>
          </button>
        )}
        <button onClick={onLogout} className="w-full bg-white border border-[#F4ECE4] text-red-500 py-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2">
          <LogOut size={16} /> <span>注销登录</span>
        </button>
      </div>
    </div>
  );
};

// --- Main App ---
const AppContent: React.FC = () => {
  const [role, setRole] = useState<UserRole>(() => (localStorage.getItem('user_role') as UserRole) || UserRole.GUEST);
  const [stories, setStories] = useState<Story[]>(() => {
    const saved = localStorage.getItem('user_stories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_STORIES;
  });
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('user_progress');
    return saved ? JSON.parse(saved) : { masteredWords: [], collectedWords: [], completedStories: [], currentPlanLevel: 1, isVip: false, freeStoriesRead: 0 };
  });
  const [codes, setCodes] = useState<ActivationCode[]>([{ code: 'IELTS888', isUsed: false, expiresAt: '2025-12-31', type: 'annual' }]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenModal, setShowGenModal] = useState(false);
  const [userOutline, setUserOutline] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('user_role', role);
    localStorage.setItem('user_progress', JSON.stringify(progress));
    localStorage.setItem('user_stories', JSON.stringify(stories));
  }, [role, progress, stories]);

  const handleLogout = () => {
    setRole(UserRole.GUEST);
    localStorage.removeItem('user_role');
    navigate('/auth');
  };

  const handleActivateVip = (code: string) => {
    const foundCode = codes.find(c => c.code === code && !c.isUsed);
    if (foundCode) {
      setCodes(prev => prev.map(c => c.code === code ? { ...c, isUsed: true } : c));
      setProgress(prev => ({ ...prev, isVip: true }));
      return true;
    }
    return false;
  };

  // 核心修复：重构删除逻辑
  const deleteStory = useCallback((id: string) => {
    if (!window.confirm('确定要移除该系列及后续章节吗？此操作不可撤销。')) return;
    
    // 1. 识别该系列下的所有章节 ID
    const idsToRemove = new Set<string>([id]);
    let added = true;
    while (added) {
      added = false;
      // 基于当前 stories 状态计算所有后续章节
      stories.forEach(s => {
        if (s.prevId && idsToRemove.has(s.prevId) && !idsToRemove.has(s.id)) {
          idsToRemove.add(s.id);
          added = true;
        }
      });
    }

    // 2. 更新剧集库
    setStories(prev => prev.filter(s => !idsToRemove.has(s.id)));

    // 3. 更新进度记录
    setProgress(prev => ({
      ...prev,
      completedStories: prev.completedStories.filter(sid => !idsToRemove.has(sid))
    }));
  }, [stories]); // 依赖项包含 stories 确保能获取最新链条

  const generateUserStory = async () => {
    if (!userOutline || isGenerating) return;
    setIsGenerating(true);
    try {
      const newStoryData = await geminiService.generateStory(userOutline);
      const newStory: Story = { ...newStoryData, id: 'user-' + Date.now(), dateAdded: new Date().toISOString(), isUserGenerated: true };
      setStories(prev => [newStory, ...prev]);
      setShowGenModal(false);
      setUserOutline('');
      navigate(`/reader/${newStory.id}`);
    } catch (e) {
      alert('构思中断，请检查网络后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExtendStory = async (prevStory: Story) => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const extensionData = await geminiService.extendStory(prevStory);
      const newId = 'user-ext-' + Date.now();
      const newStory: Story = { ...extensionData, id: newId, dateAdded: new Date().toISOString(), isUserGenerated: true, prevId: prevStory.id };
      setStories(prev => prev.map(s => s.id === prevStory.id ? { ...s, nextId: newId } : s).concat(newStory));
      navigate(`/reader/${newId}`);
    } catch (e) {
      alert('续写失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const BottomNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F4ECE4] flex justify-around items-center h-16 px-4 z-50 shadow-lg">
      <Link to="/" className={`flex flex-col items-center ${location.pathname === '/' ? 'text-[#A67B5B]' : 'text-gray-300'}`}>
        <HomeIcon size={20} /><span className="text-[10px] font-bold">书架</span>
      </Link>
      <Link to="/plan" className={`flex flex-col items-center ${location.pathname === '/plan' ? 'text-[#A67B5B]' : 'text-gray-300'}`}>
        <Layout size={20} /><span className="text-[10px] font-bold">计划</span>
      </Link>
      <Link to="/lexicon" className={`flex flex-col items-center ${location.pathname === '/lexicon' ? 'text-[#A67B5B]' : 'text-gray-300'}`}>
        <Library size={20} /><span className="text-[10px] font-bold">语料</span>
      </Link>
      <Link to="/profile" className={`flex flex-col items-center ${location.pathname === '/profile' || location.pathname === '/admin' ? 'text-[#A67B5B]' : 'text-gray-300'}`}>
        <UserIcon size={20} /><span className="text-[10px] font-bold">我的</span>
      </Link>
    </nav>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#FDFBF9] shadow-2xl relative overflow-x-hidden pb-20 text-[#3D2B1F]">
      <header className="px-6 pt-8 pb-4 sticky top-0 bg-[#FDFBF9]/90 backdrop-blur-md z-40 border-b border-[#F4ECE4]/30">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex flex-col">
            <span className="text-[10px] font-bold text-[#A67B5B] tracking-widest uppercase mb-1">智能爽文背单词</span>
            <h1 className="serif-font text-2xl font-bold tracking-tight text-[#3D2B1F]">邪修雅思</h1>
          </Link>
          {role !== UserRole.GUEST && (
             <div className="flex items-center space-x-2">
                <div className="bg-[#F4ECE4] px-2 py-0.5 rounded-full flex items-center">
                   <Star size={10} className="text-[#A67B5B] fill-[#A67B5B] mr-1" />
                   <span className="text-[10px] font-bold text-[#6F4E37]">{progress.collectedWords.length}</span>
                </div>
                {progress.isVip && <span className="bg-[#3D2B1F] text-[#A67B5B] text-[8px] font-black px-1.5 py-0.5 rounded">VIP</span>}
             </div>
          )}
        </div>
      </header>

      <main className="px-6 py-4">
        <Routes>
          <Route path="/auth" element={<Auth onLogin={setRole} />} />
          <Route path="/" element={role === UserRole.GUEST ? <Navigate to="/auth" replace /> : <Home stories={stories} progress={progress} onTriggerGen={() => setShowGenModal(true)} onDeleteStory={deleteStory} />} />
          <Route path="/reader/:storyId" element={<Reader stories={stories} progress={progress} onCollect={(id) => setProgress(p => p.collectedWords.includes(id) ? p : ({...p, collectedWords: [...p.collectedWords, id]}))} onMaster={(id) => setProgress(p => p.masteredWords.includes(id) ? p : ({...p, masteredWords: [...p.masteredWords, id]}))} onExtend={handleExtendStory} isGenerating={isGenerating} onStoryRead={(id) => setProgress(p => p.completedStories.includes(id) ? p : ({...p, completedStories: [...p.completedStories, id]}))} />} />
          <Route path="/lexicon" element={<Lexicon stories={stories} progress={progress} />} />
          <Route path="/plan" element={<LearningPlan progress={progress} />} />
          <Route path="/profile" element={<Profile role={role} progress={progress} onLogout={handleLogout} onActivate={handleActivateVip} />} />
          <Route path="/admin" element={role === UserRole.ADMIN ? <AdminDashboard stories={stories} setStories={setStories} codes={codes} setCodes={setCodes} onLogout={handleLogout} /> : <Navigate to="/profile" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {role !== UserRole.GUEST && <BottomNav />}

      {showGenModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#3D2B1F]/40 backdrop-blur-sm">
          <div className="bg-[#FDFBF9] w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-[#F4ECE4]">
            <div className="flex justify-between items-start mb-6">
              <h3 className="serif-font text-xl font-bold text-[#3D2B1F]">定制专属爽文</h3>
              <button onClick={() => setShowGenModal(false)} className="text-gray-300"><X size={20} /></button>
            </div>
            <textarea value={userOutline} onChange={(e) => setUserOutline(e.target.value)} placeholder="描述剧情方向：如一位精英女性在跨国并购中..." className="w-full h-32 bg-[#FAF7F2] border border-[#F4ECE4] rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#A67B5B]/10 outline-none mb-6 text-[#3D2B1F]" />
            <button onClick={generateUserStory} disabled={isGenerating || !userOutline} className="w-full bg-[#3D2B1F] text-[#FDFBF9] py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 disabled:bg-gray-200">
              {isGenerating ? <><Loader2 className="animate-spin" size={18} /><span>正在构思...</span></> : <span>开始创作</span>}
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
