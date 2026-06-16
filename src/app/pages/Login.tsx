import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Factory, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../store';

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [creds, setCreds] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // const hints = [
  //   { login: 'admin', password: 'admin', role: 'Администратор' },
  //   { login: 'dispatcher', password: '1234', role: 'Диспетчер' },
  //   { login: 'master', password: '1234', role: 'Мастер' },
  //   { login: 'manager', password: '1234', role: 'Менеджер' },
  // ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');
    
    const res = await login(creds.login, creds.password);
    
    if (res.status) {
      navigate('/');
    } else {
      setError(res.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Left panel */}
      {/* <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ background: '#0f172a' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded flex items-center justify-center" style={{ background: '#1d4ed8' }}>
            <Factory size={18} className="text-white" />
          </div>
          <span className="text-white font-semibold text-base">MES-система</span>
        </div>
        <div>
          <div className="text-4xl font-bold text-white leading-tight mb-4">
            Управление<br />производством
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            Модуль учёта заказов и планирования производства. Контроль этапов, загрузки цехов и статусов в реальном времени.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: 'Заказов в работе', value: '8' },
              { label: 'Цехов', value: '5' },
              { label: 'Этапов производства', value: '7' },
              { label: 'Пользователей', value: '6' },
            ].map(stat => (
              <div key={stat.label} className="rounded p-4" style={{ background: '#1e293b' }}>
                <div className="text-2xl font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{stat.value}</div>
                <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-slate-600 text-xs">© 2024 МЕС-система. Версия 1.0.0</div>
      </div> */}

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: '#1d4ed8' }}>
              <Factory size={16} className="text-white" />
            </div>
            <span className="font-semibold text-slate-800">MES-система</span>
          </div>

          <h1 className="text-xl font-semibold text-slate-900 mb-1 text-center">Вход</h1>
          {/* <p className="text-sm text-slate-500 mb-7">Введите учётные данные для доступа</p>  */}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Имя пользователя</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={creds.login}
                  onChange={e => setCreds(p => ({ ...p, login: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Введите логин"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Пароль</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={creds.password}
                  onChange={e => setCreds(p => ({ ...p, password: e.target.value }))}
                  className="w-full pl-9 pr-10 py-2.5 text-sm rounded border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Введите пароль"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded px-3 py-2.5">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded text-sm font-medium text-white transition-all hover:opacity-90 active:scale-98 disabled:opacity-60"
              style={{ background: '#1d4ed8' }}
            >
              {loading ? 'Выполняется вход...' : 'Войти'}
            </button>
          </form>

          {/* <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="text-xs text-slate-400 mb-3">Демо-аккаунты:</div>
            <div className="grid grid-cols-2 gap-2">
              {hints.map(h => (
                <button
                  key={h.login}
                  onClick={() => setCreds({ login: h.login, password: h.password })}
                  className="text-left px-3 py-2 rounded border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition text-xs"
                >
                  <div className="font-medium text-slate-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{h.login}</div>
                  <div className="text-slate-400 mt-0.5">{h.role}</div>
                </button>
              ))}
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
