
import React, { useState } from 'react';
import { UserRole } from '../types';
import { Shield, User, ChevronRight, Lock, Phone, KeyRound, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthProps {
  onLogin: (role: UserRole) => void;
}

interface UserData {
  nickname: string;
  password: string;
  phoneNumber: string;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'register' | 'admin' | 'forgot'>('login');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [adminPassInput, setAdminPassInput] = useState('');
  const navigate = useNavigate();

  const getUsers = (): UserData[] => {
    const saved = localStorage.getItem('lexitale_users');
    return saved ? JSON.parse(saved) : [];
  };

  const handleRegister = () => {
    if (!nickname || !password || !phoneNumber) {
      setError('请完善您的修行契约（填写所有字段）');
      return;
    }
    const users = getUsers();
    if (users.find(u => u.nickname === nickname)) {
      setError('此道号已在名册中，请尝试其他昵称');
      return;
    }
    const newUser = { nickname, password, phoneNumber };
    users.push(newUser);
    localStorage.setItem('lexitale_users', JSON.stringify(users));
    setError('');
    alert('入道成功！请前往登录');
    setMode('login');
  };

  const handleLogin = () => {
    if (!nickname || !password) {
      setError('请输入您的道号与密钥');
      return;
    }
    const users = getUsers();
    const user = users.find(u => u.nickname === nickname && u.password === password);
    if (user) {
      onLogin(UserRole.MEMBER);
      navigate('/');
    } else {
      setError('道号或密钥有误，请重新核对');
    }
  };

  const handleRecover = () => {
    if (!nickname || !phoneNumber) {
      setError('请提供完整道号与预留传讯符');
      return;
    }
    const users = getUsers();
    const user = users.find(u => u.nickname === nickname && u.phoneNumber === phoneNumber);
    if (user) {
      alert(`验证成功！您的密钥为：${user.password}`);
      setMode('login');
    } else {
      setError('验证信息不匹配，无法找回');
    }
  };

  const handleAdminLogin = () => {
    const savedAdminPass = localStorage.getItem('admin_password') || 'admin123';
    if (adminPassInput === savedAdminPass) {
      onLogin(UserRole.ADMIN);
      navigate('/admin');
    } else {
      setError('掌门验证未通过');
    }
  };

  return (
    <div className="py-12 px-6 flex flex-col items-center animate-in fade-in duration-700">
      <div className="w-20 h-20 bg-[#3D2B1F] text-[#FDFBF9] rounded-[2rem] flex items-center justify-center font-bold text-3xl mb-8 shadow-2xl ring-4 ring-[#F4ECE4]">
        邪
      </div>
      
      <div className="text-center mb-10">
        <h2 className="serif-font text-3xl font-bold text-[#3D2B1F]">邪修雅思</h2>
        <p className="text-[#A67B5B] text-[10px] font-bold tracking-[0.25em] uppercase mt-2">
          {mode === 'admin' ? 'Elite Admin Portal' : 'High Performance IELTS Mastery'}
        </p>
      </div>

      <div className="w-full space-y-4 max-w-[340px]">
        {mode === 'admin' ? (
          <>
            <div className="relative">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A67B5B]" size={18} />
              <input 
                type="password" 
                placeholder="掌门密钥" 
                value={adminPassInput}
                onChange={(e) => setAdminPassInput(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#F4ECE4] rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#A67B5B]/10 outline-none text-[#3D2B1F]"
              />
            </div>
            <button onClick={handleAdminLogin} className="w-full bg-[#3D2B1F] text-white py-4 rounded-2xl font-bold shadow-xl active:scale-95 transition-all">进入管理大殿</button>
          </>
        ) : mode === 'forgot' ? (
          <>
            <div className="space-y-3">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A67B5B]" size={18} />
                <input 
                  type="text" placeholder="注册时的道号" value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#F4ECE4] rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-[#3D2B1F]"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A67B5B]" size={18} />
                <input 
                  type="text" placeholder="注册时的手机号" value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#F4ECE4] rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-[#3D2B1F]"
                />
              </div>
            </div>
            {error && <p className="text-[11px] text-red-500 text-center font-bold">{error}</p>}
            <button onClick={handleRecover} className="w-full bg-[#3D2B1F] text-white py-4 rounded-2xl font-bold flex items-center justify-center shadow-xl active:scale-95 transition-all">找回我的密钥</button>
            <button onClick={() => setMode('login')} className="w-full text-[10px] font-bold text-[#A67B5B] uppercase tracking-widest text-center mt-2">返回登录</button>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A67B5B]" size={18} />
                <input 
                  type="text" placeholder="道号 (昵称)" value={nickname}
                  onChange={(e) => { setNickname(e.target.value); setError(''); }}
                  className="w-full bg-[#FAF7F2] border border-[#F4ECE4] rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:ring-2 focus:ring-[#A67B5B]/10 outline-none transition-all text-[#3D2B1F] font-medium"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A67B5B]" size={18} />
                <input 
                  type="password" placeholder="修行密钥 (密码)" value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full bg-[#FAF7F2] border border-[#F4ECE4] rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:ring-2 focus:ring-[#A67B5B]/10 outline-none transition-all text-[#3D2B1F] font-medium"
                />
              </div>
              {mode === 'register' && (
                <div className="relative animate-in slide-in-from-top-2">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A67B5B]" size={18} />
                  <input 
                    type="text" placeholder="传讯符 (手机号)" value={phoneNumber}
                    onChange={(e) => { setPhoneNumber(e.target.value); setError(''); }}
                    className="w-full bg-[#FAF7F2] border border-[#F4ECE4] rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:ring-2 focus:ring-[#A67B5B]/10 outline-none transition-all text-[#3D2B1F] font-medium"
                  />
                </div>
              )}
            </div>
            
            {error && <p className="text-[11px] text-red-500 text-center font-bold">{error}</p>}
            
            <button 
              onClick={mode === 'register' ? handleRegister : handleLogin}
              className="w-full bg-[#3D2B1F] text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-xl active:scale-95 transition-all mt-4"
            >
              <span>{mode === 'register' ? '缔结修行契约' : '回归雅思道场'}</span>
              <ChevronRight size={18} />
            </button>
            
            <div className="flex flex-col space-y-4 pt-6">
               <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-[0.15em] hover:text-[#6F4E37] transition-colors">
                 {mode === 'login' ? '初入此道？开辟您的修行洞府' : '已有道号？立即归位'}
               </button>
               {mode === 'login' && (
                 <button onClick={() => { setMode('forgot'); setError(''); }} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">忘记密钥？找回您的修为</button>
               )}
            </div>
          </>
        )}
        
        <div className="pt-12 flex justify-center">
          <button 
            onClick={() => { setMode(mode === 'admin' ? 'login' : 'admin'); setError(''); }}
            className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.3em] hover:text-[#A67B5B] transition-colors"
          >
            {mode === 'admin' ? '返回求索界面' : '掌门入口'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
