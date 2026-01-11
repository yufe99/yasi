
import React from 'react';
import { UserProgress } from '../types';
import { CheckCircle, Circle, Target, Flame, TrendingUp } from 'lucide-react';

interface LearningPlanProps {
  progress: UserProgress;
}

const LearningPlan: React.FC<LearningPlanProps> = ({ progress }) => {
  // Mock steps representing the 9000 word journey
  const stages = [
    { title: '雅思 6.0 核心', count: 3500, current: 420, icon: Circle, color: 'blue' },
    { title: '进阶 7.5 关键', count: 3000, current: 85, icon: Target, color: 'amber' },
    { title: '冲刺 8.5+ 精英', count: 2500, current: 12, icon: Flame, color: 'red' },
  ];

  const totalWords = 9000;
  const learnedTotal = progress.masteredWords.length;
  const percentage = Math.round((learnedTotal / totalWords) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="serif-font text-2xl font-bold mb-1">词汇征途</h2>
        <p className="text-xs text-gray-400">9000+ 雅思词汇阶梯式掌握计划</p>
      </header>

      <div className="bg-black rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">当前进度</p>
              <h3 className="text-4xl font-black">{percentage}%</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">已掌握</p>
              <p className="text-lg font-bold text-amber-400">{learnedTotal} <span className="text-xs text-white">Words</span></p>
            </div>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full" style={{ width: `${percentage}%` }} />
          </div>
        </div>
        <TrendingUp className="absolute -right-4 -bottom-4 text-white/5" size={120} />
      </div>

      <section className="space-y-4">
        {stages.map((stage, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-2xl bg-${stage.color}-50 flex items-center justify-center`}>
              <stage.icon className={`text-${stage.color}-500`} size={24} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-bold text-sm">{stage.title}</h4>
                <span className="text-[10px] font-bold text-gray-400">{stage.current}/{stage.count}</span>
              </div>
              <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden">
                <div className={`bg-${stage.color}-500 h-full`} style={{ width: `${(stage.current / stage.count) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
         <h4 className="font-bold text-amber-900 mb-2">今日任务</h4>
         <div className="space-y-3">
            {[
              '完成 1 个职场爽文剧集阅读',
              '语料库内 15 个单词复习',
              '参与 1 次口语 AI 对话'
            ].map((task, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-5 h-5 rounded-full border-2 border-amber-200" />
                <span className="text-xs text-amber-800 font-medium">{task}</span>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
};

export default LearningPlan;
