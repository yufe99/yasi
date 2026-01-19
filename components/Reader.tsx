import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Story, VocabularyWord, UserProgress, UserRole } from '../types';
import { geminiService } from '../services/geminiService';
import { 
  ArrowLeft, 
  Volume2, 
  Star, 
  CheckCircle, 
  X,
  Lock,
  ChevronRight,
  Sparkles,
  Loader2,
  ArrowRight,
  ChevronLeft,
  Home,
  List,
  Play,
  Pause,
  Headphones,
  Zap,
  Turtle,
  Share2,
  Copy,
  Check,
  ShieldAlert,
  UserCheck,
  Crown
} from 'lucide-react';

// --- Audio & Serialization Helpers ---
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}

interface ReaderProps {
  stories: Story[];
  progress: UserProgress;
  userRole: UserRole;
  isGenerating?: boolean;
  onCollect: (wordId: string) => void;
  onMaster: (wordId: string) => void;
  onExtend: (story: Story) => void;
  onStoryRead: (id: string) => void;
}

const Reader: React.FC<ReaderProps> = ({ stories, progress, userRole, isGenerating, onCollect, onMaster, onExtend, onStoryRead }) => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null);
  const [showChapters, setShowChapters] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [isPlayingFull, setIsPlayingFull] = useState(false);
  const [audioLoading, setAudioLoading] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const story = useMemo(() => stories.find(s => s.id === storyId), [stories, storyId]);
  
  // 试用锁定检查：如果是新章节，且不是 VIP，且灵石已耗尽
  const isLocked = useMemo(() => {
    if (!story) return false;
    if (progress.isVip || userRole === UserRole.ADMIN) return false;
    const isAlreadyRead = progress.completedStories.includes(story.id);
    return !isAlreadyRead && progress.freeTrialQuota <= 0;
  }, [story, progress, userRole]);

  const seriesChapters = useMemo(() => {
    if (!story) return [];
    let root = story;
    const visited = new Set();
    while (root.prevId && !visited.has(root.prevId)) {
      const prev = stories.find(s => s.id === root.prevId);
      if (prev) { root = prev; visited.add(root.id); } else break;
    }
    const list: Story[] = [];
    let current: Story | undefined = root;
    const visitedForward = new Set();
    while (current && !visitedForward.has(current.id)) {
      list.push(current);
      visitedForward.add(current.id);
      current = stories.find(s => s.id === current?.nextId);
    }
    return list;
  }, [stories, story]);

  useEffect(() => {
    if (story && !isLocked) {
      onStoryRead(story.id);
    }
    window.scrollTo(0, 0);
    return () => stopAudio();
  }, [storyId, isLocked]);

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    setIsPlayingFull(false);
  };

  const playTTS = async (text: string, type: 'standard' | 'slow' | 'full' = 'standard') => {
    if (isLocked) return;
    if (isPlayingFull && type === 'full') {
      stopAudio();
      return;
    }
    setAudioLoading(type);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const base64Audio = await geminiService.generateTTS(text, type);
      if (base64Audio) {
        const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioContextRef.current);
        stopAudio();
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => {
          if (type === 'full') setIsPlayingFull(false);
          setAudioLoading(null);
        };
        source.start(0);
        sourceNodeRef.current = source;
        if (type === 'full') setIsPlayingFull(true);
      }
    } catch (error) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = type === 'slow' ? 0.4 : 0.85; 
      utterance.lang = 'en-GB';
      utterance.onend = () => setAudioLoading(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const generateShareKey = () => {
    if (!story) return '';
    const users = JSON.parse(localStorage.getItem('lexitale_users') || '[]');
    const currentUser = users[0]?.nickname || '无名修士';

    const payload = {
      type: 'SECURE_STORY_KEY',
      origin: currentUser,
      isOfficial: !story.isUserGenerated,
      data: {
        title: story.title,
        tagline: story.tagline,
        genre: story.genre,
        immersionContent: story.immersionContent,
        blindContent: story.blindContent,
        vocabulary: story.vocabulary,
        coverImage: story.coverImage
      },
      timestamp: Date.now(),
      securityLevel: 'MEMBER_ONLY'
    };
    const jsonStr = JSON.stringify(payload);
    return btoa(unescape(encodeURIComponent(jsonStr)));
  };

  const handleCopyKey = () => {
    const key = generateShareKey();
    navigator.clipboard.writeText(key);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  if (!story) return null;

  return (
    <div className="animate-in fade-in duration-500 pb-24 relative">
      {/* Paywall Layer */}
      {isLocked && (
        <div className="fixed inset-0 z-[80] bg-[#FDFBF9]/40 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-700">
           <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-10 shadow-2xl border border-[#F4ECE4] text-center relative overflow-hidden">
              <div className="relative z-10">
                 <div className="inline-flex p-4 rounded-full bg-amber-50 mb-6">
                    <Crown size={32} className="text-amber-500" />
                 </div>
                 <h2 className="serif-font text-2xl font-bold text-[#3D2B1F] mb-4">试炼灵石已耗尽</h2>
                 <p className="text-xs text-[#A67B5B] leading-relaxed mb-8">
                   您的 10 章试读额度已使用完毕。为了保证社群公平性，继续修行需晋升为【宗门真传】会员。
                 </p>
                 <div className="space-y-4">
                    <button onClick={() => navigate('/profile')} className="w-full bg-[#3D2B1F] text-white py-4 rounded-2xl font-bold shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-2">
                       <span>立即晋升会员</span>
                       <ArrowRight size={18} />
                    </button>
                    <button onClick={() => navigate('/')} className="w-full text-[10px] font-bold text-[#A67B5B] uppercase tracking-widest">返回书架</button>
                 </div>
              </div>
              <Sparkles className="absolute -right-8 -bottom-8 text-amber-500/5" size={160} />
           </div>
        </div>
      )}

      {/* Reader Header */}
      <div className="flex items-center justify-between mb-8 sticky top-0 py-4 bg-[#FDFBF9]/90 backdrop-blur-md z-30 border-b border-[#F4ECE4]/30">
        <div className="flex items-center space-x-1">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#F4ECE4] rounded-full text-[#6F4E37]"><ArrowLeft className="w-5 h-5" /></button>
          <button onClick={() => setShowChapters(true)} className="p-2 hover:bg-[#F4ECE4] rounded-full text-[#A67B5B] flex items-center space-x-1">
            <List size={18} /><span className="text-[10px] font-bold">目录</span>
          </button>
          <button onClick={() => setShowShareModal(true)} className="p-2 hover:bg-[#F4ECE4] rounded-full text-[#A67B5B] flex items-center space-x-1">
            <Share2 size={16} /><span className="text-[10px] font-bold">刻录</span>
          </button>
        </div>
        
        <button 
          onClick={() => playTTS(story.blindContent, 'full')}
          disabled={!!audioLoading}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all ${isPlayingFull ? 'bg-[#3D2B1F] border-[#3D2B1F] text-white' : 'bg-white border-[#F4ECE4] text-[#A67B5B] shadow-sm'}`}
        >
          {audioLoading === 'full' ? (
            <Loader2 size={14} className="animate-spin" />
          ) : isPlayingFull ? (
            <Pause size={14} fill="currentColor" />
          ) : (
            <Headphones size={14} />
          )}
          <span className="text-[10px] font-bold tracking-widest">{isPlayingFull ? '暂停' : '精听'}</span>
        </button>
      </div>

      <div className={`flex-grow ${isLocked ? 'blur-md pointer-events-none grayscale' : ''}`}>
        {/* Title area */}
        <div className="text-center mb-8 px-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
             <div className="h-px w-8 bg-[#A67B5B]/20" />
             <span className="text-[9px] font-black text-[#A67B5B] uppercase tracking-widest">Episode {seriesChapters.indexOf(story) + 1}</span>
             <div className="h-px w-8 bg-[#A67B5B]/20" />
          </div>
          <h1 className="serif-font text-2xl font-bold text-[#3D2B1F] mb-2">{story.title}</h1>
          <p className="text-xs text-[#A67B5B] font-medium italic opacity-80">{story.tagline}</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-7 md:p-10 shadow-sm border border-[#F4ECE4] mb-12 min-h-[350px]">
          <div className="text-[1.1rem] leading-[2] text-[#3D2B1F] tracking-wide font-normal whitespace-pre-line">
            {story.immersionContent.map((part, idx) => (
              <span key={idx}>
                {part.type === 'text' ? part.content : (
                  <button 
                    onClick={() => {
                      const word = story.vocabulary.find(v => v.id === part.wordId);
                      if (word) setSelectedWord(word);
                    }}
                    className="relative inline-block mx-1 font-bold text-[#3D2B1F] transition-all hover:text-[#A67B5B]"
                  >
                    <span className="relative z-10">{part.content}</span>
                    <span className="absolute bottom-1.5 left-0 right-0 h-2 bg-[#A67B5B]/10 rounded-sm -rotate-1 z-0" />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="px-2 space-y-6">
          <div className="flex flex-col items-center">
            <div className="h-px bg-[#F4ECE4] w-full mb-4" />
            <p className="text-[10px] text-[#A67B5B] font-bold uppercase tracking-widest">修行至此</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
             {story.prevId && (
               <button onClick={() => navigate(`/reader/${story.prevId}`)} className="py-5 bg-white border border-[#F4ECE4] text-[#6F4E37] rounded-2xl font-bold flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-sm">
                 <ChevronLeft size={18} /><span>上一章</span>
               </button>
             )}
             <button 
               onClick={() => story.nextId ? navigate(`/reader/${story.nextId}`) : onExtend(story)}
               disabled={isGenerating}
               className={`py-5 bg-[#3D2B1F] text-white rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-xl active:scale-95 transition-all disabled:opacity-50 ${story.prevId ? 'col-span-1' : 'col-span-2'}`}
             >
               {isGenerating ? <Loader2 className="animate-spin" size={18} /> : (story.nextId ? <><span>下章剧情</span><ArrowRight size={18} /></> : <><Sparkles size={18} className="text-[#A67B5B]" /><span>开启下章</span></>)}
             </button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-[#3D2B1F]/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="serif-font text-xl font-bold text-[#3D2B1F]">
                     {story.isUserGenerated ? '刻录私人密档' : '发布宗门秘钥'}
                   </h3>
                   <button onClick={() => setShowShareModal(false)}><X size={20} className="text-gray-300" /></button>
                </div>
                <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#F4ECE4] flex items-start space-x-3 mb-6">
                   <ShieldAlert className="text-[#A67B5B] shrink-0 w-4 h-4 mt-0.5" />
                   <p className="text-[10px] text-[#6F4E37] leading-relaxed font-medium">
                     防伪警示：所有剧本均受“解析权限”保护。您的好友需拥有【宗门会员】身份方可解密此代码。
                   </p>
                </div>
                <div className="bg-[#FDFBF9] p-4 rounded-2xl border border-[#F4ECE4] break-all font-mono text-[8px] max-h-32 overflow-y-auto mb-6 text-gray-300 select-all border-dashed">
                  {generateShareKey()}
                </div>
                <button 
                  onClick={handleCopyKey}
                  className="w-full bg-[#3D2B1F] text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-all"
                >
                  {hasCopied ? <><Check size={18}/><span>秘钥已生成</span></> : <><Copy size={18}/><span>复制秘钥代码</span></>}
                </button>
              </div>
              <Sparkles className="absolute -right-8 -bottom-8 text-[#A67B5B]/5" size={120} />
           </div>
        </div>
      )}

      {/* Word Details Overlay */}
      {selectedWord && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-4 bg-[#3D2B1F]/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300 border border-[#F4ECE4]">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="serif-font text-2xl font-bold text-[#3D2B1F]">{selectedWord.word}</h2>
                  <p className="text-gray-400 font-mono text-[10px] mt-1">{selectedWord.phonetic} • <span className="text-[#A67B5B] font-bold">{selectedWord.level}</span></p>
                </div>
                <button onClick={() => setSelectedWord(null)} className="p-2 text-gray-300 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
              </div>

              <div className="flex space-x-3 mb-8">
                <button onClick={() => playTTS(selectedWord.word, 'standard')} disabled={!!audioLoading} className="flex-1 flex items-center justify-center space-x-2 py-3 bg-[#FAF7F2] border border-[#F4ECE4] rounded-xl text-[#3D2B1F] active:bg-[#F4ECE4] transition-all hover:border-[#A67B5B]/30">
                  {audioLoading === 'standard' ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} className="text-[#A67B5B]" />}
                  <span className="text-[11px] font-bold">标准</span>
                </button>
                <button onClick={() => playTTS(selectedWord.word, 'slow')} disabled={!!audioLoading} className="flex-1 flex items-center justify-center space-x-2 py-3 bg-[#FAF7F2] border border-[#F4ECE4] rounded-xl text-[#3D2B1F] active:bg-[#F4ECE4] transition-all hover:border-[#A67B5B]/30">
                  {audioLoading === 'slow' ? <Loader2 size={16} className="animate-spin" /> : <Turtle size={16} className="text-[#A67B5B]" />}
                  <span className="text-[11px] font-bold">慢速</span>
                </button>
              </div>

              <div className="space-y-4">
                <section>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#A67B5B] mb-1">中文释义</h3>
                  <p className="text-md font-bold text-[#3D2B1F]">{selectedWord.translation}</p>
                </section>
                <section>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#A67B5B] mb-1">精英语境</h3>
                  <p onClick={() => playTTS(selectedWord.example, 'standard')} className="text-xs text-[#6F4E37] leading-relaxed italic border-l-2 border-[#A67B5B]/20 pl-3 cursor-pointer hover:bg-[#FAF7F2] p-1 rounded transition-colors">
                    "{selectedWord.example}"
                  </p>
                </section>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-8">
                <button onClick={() => onCollect(selectedWord.id)} className={`flex items-center justify-center space-x-2 py-4 rounded-2xl text-xs font-bold transition-all ${progress.collectedWords.includes(selectedWord.id) ? 'bg-[#FAF7F2] text-[#A67B5B]' : 'bg-[#3D2B1F] text-white shadow-lg'}`}>
                  <Star className={`w-3.5 h-3.5 ${progress.collectedWords.includes(selectedWord.id) ? 'fill-[#A67B5B]' : ''}`} />
                  <span>{progress.collectedWords.includes(selectedWord.id) ? '已收藏' : '语料收藏'}</span>
                </button>
                <button onClick={() => onMaster(selectedWord.id)} className={`flex items-center justify-center space-x-2 py-4 rounded-2xl text-xs font-bold border transition-all ${progress.masteredWords.includes(selectedWord.id) ? 'bg-[#F4ECE4] border-[#A67B5B]/20 text-[#6F4E37]' : 'bg-white border-[#F4ECE4] text-gray-500'}`}>
                  <CheckCircle className={`w-3.5 h-3.5 ${progress.masteredWords.includes(selectedWord.id) ? 'fill-[#A67B5B]' : ''}`} />
                  <span>{progress.masteredWords.includes(selectedWord.id) ? '已掌握' : '掌握'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showChapters && (
        <div className="fixed inset-0 z-[100] flex animate-in fade-in">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowChapters(false)} />
           <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
              <div className="p-6 border-b border-[#F4ECE4]">
                 <div className="flex justify-between items-center mb-2">
                    <h3 className="serif-font text-lg font-bold text-[#3D2B1F]">章节目录</h3>
                    <button onClick={() => setShowChapters(false)}><X size={20} className="text-gray-300" /></button>
                 </div>
              </div>
              <div className="flex-grow overflow-y-auto p-4 space-y-2">
                 {seriesChapters.map((ch, idx) => (
                    <button 
                      key={ch.id}
                      onClick={() => { navigate(`/reader/${ch.id}`); setShowChapters(false); }}
                      className={`w-full text-left p-4 rounded-2xl transition-all border ${ch.id === story.id ? 'bg-[#3D2B1F] text-white border-[#3D2B1F] shadow-lg' : 'bg-[#FAF7F2] border-[#F4ECE4] text-[#3D2B1F]'}`}
                    >
                       <p className="text-[9px] font-black uppercase tracking-wider opacity-60 mb-1">Episode {idx + 1}</p>
                       <p className="text-xs font-bold line-clamp-1">{ch.title}</p>
                    </button>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Reader;