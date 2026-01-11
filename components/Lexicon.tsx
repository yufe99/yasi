
import { useMemo, useState } from 'react';
import { Story, UserProgress, VocabularyWord } from '../types';
import { Search, Star, CheckCircle, Volume2, ShieldCheck, Zap } from 'lucide-react';

interface LexiconProps {
  stories: Story[];
  progress: UserProgress;
}

const Lexicon: React.FC<LexiconProps> = ({ stories, progress }) => {
  const [filter, setFilter] = useState<'all' | 'collected' | 'mastered'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const allWords = useMemo(() => {
    const wordMap = new Map<string, VocabularyWord>();
    stories.forEach(story => {
      story.vocabulary.forEach(v => {
        wordMap.set(v.id, v);
      });
    });
    return Array.from(wordMap.values());
  }, [stories]);

  const filteredWords = useMemo(() => {
    return allWords.filter(word => {
      const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            word.translation.includes(searchTerm);
      
      if (filter === 'collected') return matchesSearch && progress.collectedWords.includes(word.id);
      if (filter === 'mastered') return matchesSearch && progress.masteredWords.includes(word.id);
      return matchesSearch && (progress.collectedWords.includes(word.id) || progress.masteredWords.includes(word.id));
    });
  }, [allWords, filter, searchTerm, progress]);

  const stats = {
    collected: progress.collectedWords.length,
    mastered: progress.masteredWords.length
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-12">
      {/* Header Section */}
      <div className="mb-8 flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="shrink-0">
            <h1 className="serif-font text-3xl md:text-4xl font-bold text-[#3D2B1F]">我的精英语料库</h1>
          </div>
          <div className="md:max-w-[240px] text-right">
            <p className="text-[11px] leading-relaxed text-[#A67B5B] font-medium md:text-right text-left">
              这些词汇不仅是考试的阶梯，更是你通往全球精英圈的敲门砖。
            </p>
          </div>
        </div>
        
        {/* Stats Cards - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-[#F4ECE4] flex items-center space-x-3 shadow-sm">
            <div className="bg-amber-50 p-2 rounded-xl shrink-0">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">收藏词汇</p>
              <p className="text-xl font-bold text-[#3D2B1F]">{stats.collected}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-[#F4ECE4] flex items-center space-x-3 shadow-sm">
            <div className="bg-green-50 p-2 rounded-xl shrink-0">
              <ShieldCheck className="w-5 h-5 text-green-500 fill-green-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">已掌握</p>
              <p className="text-xl font-bold text-[#3D2B1F]">{stats.mastered}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar Area */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-[#F4ECE4] overflow-hidden">
        <div className="p-4 border-b border-[#F4ECE4]">
          <div className="flex flex-col gap-4">
            {/* Tabs - Redistributed space, no scroll */}
            <div className="flex bg-[#FAF7F2] p-1 rounded-xl w-full">
              <button 
                onClick={() => setFilter('all')}
                className={`flex-1 px-2 py-2.5 text-[11px] font-bold rounded-lg transition-all ${filter === 'all' ? 'bg-white shadow-sm text-[#3D2B1F]' : 'text-gray-400'}`}
              >
                全部
              </button>
              <button 
                onClick={() => setFilter('collected')}
                className={`flex-1 px-2 py-2.5 text-[11px] font-bold rounded-lg transition-all ${filter === 'collected' ? 'bg-white shadow-sm text-[#3D2B1F]' : 'text-gray-400'}`}
              >
                已收藏
              </button>
              <button 
                onClick={() => setFilter('mastered')}
                className={`flex-1 px-2 py-2.5 text-[11px] font-bold rounded-lg transition-all ${filter === 'mastered' ? 'bg-white shadow-sm text-[#3D2B1F]' : 'text-gray-400'}`}
              >
                已掌握
              </button>
            </div>

            {/* Search Input - Full width on mobile, auto on desktop */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
              <input 
                type="text"
                placeholder="搜索词汇..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-xs bg-[#FAF7F2] rounded-xl border border-[#F4ECE4] focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/10 focus:bg-white transition-all text-[#3D2B1F]"
              />
            </div>
          </div>
        </div>

        {/* Word List */}
        <div className="divide-y divide-[#F4ECE4] max-h-[55vh] overflow-y-auto">
          {filteredWords.length > 0 ? (
            filteredWords.map(word => (
              <div key={word.id} className="p-5 hover:bg-[#FAF7F2]/50 transition-colors flex items-center group">
                <div className="flex-grow min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-bold text-[#3D2B1F] truncate">{word.word}</h3>
                    <span className="text-[10px] text-gray-300 font-mono shrink-0">{word.phonetic}</span>
                    <button 
                      onClick={() => speak(word.word)}
                      className="p-1 text-gray-300 hover:text-[#A67B5B] transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-medium text-[#6F4E37] truncate">{word.translation}</p>
                </div>

                <div className="flex items-center space-x-3 ml-2 shrink-0">
                   {progress.collectedWords.includes(word.id) && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                   {progress.masteredWords.includes(word.id) && <CheckCircle className="w-4 h-4 text-green-500 fill-green-500" />}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center">
              <div className="w-12 h-12 bg-[#FAF7F2] rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-gray-200" />
              </div>
              <p className="text-gray-400 text-[11px]">暂无符合条件的词汇。开始阅读新剧集吧！</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lexicon;
