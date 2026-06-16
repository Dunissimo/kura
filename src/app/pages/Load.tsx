import { useApp } from '../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Load() {
  const { workshops, orders, statuses } = useApp();

  const statusMap = Object.fromEntries(statuses.map(s => [s.id, s]));

  const workshopStats = workshops.map(w => {
    const wOrders = orders.filter(o => o.workshopId === w.id);
    console.log(wOrders);

    const active = wOrders.filter(o => o.statusId === 2).length;
    const waiting = wOrders.filter(o => o.statusId === 4).length;
    const done = wOrders.filter(o => o.statusId === 5).length;
    const load = Math.round((active / w.capacity) * 100);
    return { ...w, active, waiting, done, total: wOrders.length, load };
  });

  const orderStats = statuses.map(s => ({
    name: s.name,
    value: orders.filter(o => o.statusId === s.id).length,
    color: s.color,
  })).filter(s => s.value > 0);

  const getLoadColor = (load: number) => {
    if (load >= 90) return '#ef4444';
    if (load >= 70) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="p-6 space-y-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Загрузка цехов</h1>
        <p className="text-sm text-slate-500 mt-0.5">Текущая загруженность производственных подразделений</p>
      </div>

      {/* Workshop cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {workshopStats.map(w => {
          const loadColor = getLoadColor(w.load);
          return (
            <div key={w.id} className="bg-card rounded border border-border p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{w.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{w.code}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold" style={{ color: loadColor, fontFamily: "'JetBrains Mono', monospace" }}>{w.load}%</div>
                  <div className="text-xs text-slate-400">загрузка</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(w.load, 100)}%`, background: loadColor }} />
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {[
                  { label: 'Мощность', value: w.capacity, color: '#64748b' },
                  { label: 'В работе', value: w.active, color: '#3b82f6' },
                  { label: 'Ожидание', value: w.waiting, color: '#f59e0b' },
                  { label: 'Готово', value: w.done, color: '#10b981' },
                ].map(stat => (
                  <div key={stat.label}>
                    <div className="font-semibold" style={{ color: stat.color, fontFamily: "'JetBrains Mono', monospace" }}>{stat.value}</div>
                    <div className="text-slate-400 mt-0.5" style={{ fontSize: 10 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-card rounded border border-border p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Загрузка по цехам (%)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={workshopStats} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="code" tick={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`${v}%`, 'Загрузка']} labelFormatter={label => workshopStats.find(w => w.code === label)?.name ?? label} />
              <Bar dataKey="load" radius={[3, 3, 0, 0]}>
                {workshopStats.map((w, i) => <Cell key={i} fill={getLoadColor(w.load)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded border border-border p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Заказы по статусам</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={orderStats} barSize={32} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 3, 3, 0]} name="Заказов">
                {orderStats.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detail table */}
      <div className="bg-card rounded border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-slate-800">Сводная таблица загрузки</h3>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-slate-50">
              {['Цех', 'Код', 'Мощность', 'В работе', 'Ожидание', 'Выполнено', 'Всего', 'Загрузка'].map(h => (
                <th key={h} className="px-5 py-3 text-left font-medium text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workshopStats.map((w, i) => {
              const isLast = i === workshopStats.length - 1;
              const loadColor = getLoadColor(w.load);
              return (
                <tr key={w.id} className={`hover:bg-slate-50 transition ${!isLast ? 'border-b border-border' : ''}`}>
                  <td className="px-5 py-3 font-medium text-slate-800">{w.name}</td>
                  <td className="px-5 py-3 text-slate-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{w.code}</td>
                  <td className="px-5 py-3 text-slate-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{w.capacity}</td>
                  <td className="px-5 py-3" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#3b82f6' }}>{w.active}</td>
                  <td className="px-5 py-3" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#f59e0b' }}>{w.waiting}</td>
                  <td className="px-5 py-3" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#10b981' }}>{w.done}</td>
                  <td className="px-5 py-3 text-slate-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{w.total}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(w.load, 100)}%`, background: loadColor }} />
                      </div>
                      <span className="font-semibold" style={{ color: loadColor, fontFamily: "'JetBrains Mono', monospace" }}>{w.load}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
