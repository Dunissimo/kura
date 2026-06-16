import { useApp } from '../store';
import { ClipboardList, CheckCircle, Clock, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router';

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Низкий', normal: 'Обычный', high: 'Высокий', critical: 'Критический'
};
const PRIORITY_COLORS: Record<string, string> = {
  low: '#94a3b8', normal: '#3b82f6', high: '#f59e0b', critical: '#ef4444'
};

export default function Dashboard() {
  const { orders, statuses, processes, workshops } = useApp();
  const navigate = useNavigate();

  const statusMap = Object.fromEntries(statuses.map(s => [s.id, s]));

  const stats = {
    total: orders.length,
    inProgress: orders.filter(o => o.statusId === 1).length,
    done: orders.filter(o => o.statusId === 3).length,
    critical: orders.filter(o => o.priority === 'critical').length,
  };

  const pieData = statuses.map(s => ({
    name: s.name,
    value: orders.filter(o => o.statusId === s.id).length,
    color: s.color,
  })).filter(d => d.value > 0);

  const workshopLoad = workshops.map(w => ({
    name: w.code,
    fullName: w.name,
    active: processes.filter(p => p.workshopId === w.id && p.statusId === 1).length,
    capacity: w.capacity,
  }));

  const recent = [...orders]
    .sort((a, b) => b.id - a.id)
    .slice(0, 6);

  const overdue = orders.filter(o => {
    const dl = new Date(o.deadline);
    return dl < new Date() && o.statusId !== 3 && o.statusId !== 4;
  });

  return (
    <div className="p-6 space-y-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Дашборд</h1>
        <p className="text-sm text-slate-500 mt-0.5">Сводная информация по производству</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Всего заказов', value: stats.total, icon: ClipboardList, color: '#1d4ed8', bg: '#dbeafe' },
          { label: 'В работе', value: stats.inProgress, icon: TrendingUp, color: '#059669', bg: '#d1fae5' },
          { label: 'Выполнено', value: stats.done, icon: CheckCircle, color: '#7c3aed', bg: '#ede9fe' },
          { label: 'Критических', value: stats.critical, icon: AlertTriangle, color: '#dc2626', bg: '#fee2e2' },
        ].map(card => (
          <div key={card.label} className="bg-card rounded border border-border p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0" style={{ background: card.bg }}>
              <card.icon size={18} style={{ color: card.color }} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{card.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Status distribution */}
        <div className="bg-card rounded border border-border p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">По статусам</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={140}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={60} stroke="none">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-slate-600 truncate max-w-[90px]">{d.name}</span>
                  </div>
                  <span className="font-medium text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Workshop load */}
        <div className="bg-card rounded border border-border p-5 xl:col-span-2">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Загрузка цехов (активных процессов)</h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={workshopLoad} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v, n) => [v, n === 'active' ? 'Активных' : 'Мощность']}
                labelFormatter={label => workshopLoad.find(w => w.name === label)?.fullName ?? label}
              />
              <Bar dataKey="capacity" fill="#e2e8f0" radius={[2, 2, 0, 0]} name="capacity" />
              <Bar dataKey="active" fill="#3b82f6" radius={[2, 2, 0, 0]} name="active" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent orders */}
        <div className="bg-card rounded border border-border xl:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-slate-800">Последние заказы</h3>
            <button onClick={() => navigate('/orders')} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 transition">
              Все заказы <ArrowRight size={11} />
            </button>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {['Номер', 'Изделие', '', 'Приоритет', 'Статус'].map(h => (
                  <th key={h} className="px-5 py-2.5 text-left font-medium text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((o, i) => {
                const st = statusMap[o.statusId];
                const isLast = i === recent.length - 1;
                return (
                  <tr key={o.id} className={`hover:bg-slate-50 transition ${!isLast ? 'border-b border-border' : ''}`}>
                    <td className="px-5 py-3 font-medium text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{o.id}</td>
                    <td className="px-5 py-3 text-slate-700 max-w-[180px] truncate">{o.product}</td>
                    <td className="px-5 py-3 text-slate-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{o.deadline}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: PRIORITY_COLORS[o.priority] + '22', color: PRIORITY_COLORS[o.priority] }}>
                        {PRIORITY_LABELS[o.priority]}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {st && (
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.color }} />
                          <span style={{ color: st.color }}>{st.name}</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Overdue */}
        <div className="bg-card rounded border border-border">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-500" />
            <h3 className="text-sm font-semibold text-slate-800">Просроченные</h3>
            {overdue.length > 0 && (
              <span className="ml-auto px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-600">{overdue.length}</span>
            )}
          </div>
          <div className="divide-y divide-border">
            {overdue.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-400">
                <CheckCircle size={24} className="mx-auto mb-2 text-green-400" />
                Просроченных нет
              </div>
            ) : overdue.map(o => {
              const daysOver = Math.floor((Date.now() - new Date(o.deadline).getTime()) / 86400000);
              return (
                <div key={o.id} className="px-5 py-3">
                  <div className="font-medium text-xs text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{o.id}</div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">{o.product}</div>
                  <div className="text-xs text-red-500 mt-1">Просрочено на {daysOver} д.</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
