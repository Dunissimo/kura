import { useState, useMemo } from 'react';
import { useApp } from '../store';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { addDays, format, startOfWeek, differenceInDays, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

const PRIORITY_COLORS: Record<string, string> = {
  low: '#94a3b8', normal: '#3b82f6', high: '#f59e0b', critical: '#ef4444'
};

function getDays(start: Date, count: number): Date[] {
  return Array.from({ length: count }, (_, i) => addDays(start, i));
}

export default function Planning() {
  const { orders, statuses, workshops } = useApp();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date('2024-01-15'), { weekStartsOn: 1 }));
  const [hoverId, setHoverId] = useState<number | null>(null);
  const [filterWs, setFilterWs] = useState(0);
  const [filterStatus, setFilterStatus] = useState(0);

  const days = getDays(weekStart, 14);
  const colW = 52;

  const statusMap = Object.fromEntries(statuses.map(s => [s.id, s]));
  const workshopMap = Object.fromEntries(workshops.map(w => [w.id, w]));

  const activeOrders = useMemo(() => orders.filter(o => {
    const matchWs = !filterWs || o.workshopId === filterWs;
    const matchSt = !filterStatus || o.statusId === filterStatus;
    return matchWs && matchSt && o.statusId !== 4;
  }), [orders, filterWs, filterStatus]);

  const rangeStart = days[0];
  const rangeEnd = days[days.length - 1];

  const ordersWithBars = activeOrders.map(o => {
    const start = parseISO(o.createdAt);
    const end = parseISO(o.deadline);
    const left = Math.max(0, differenceInDays(start, rangeStart));
    const right = Math.min(days.length - 1, differenceInDays(end, rangeStart));
    const width = right - left + 1;
    return { ...o, left, width, visible: right >= 0 && left < days.length };
  }).filter(o => o.visible);

  const today = new Date('2024-01-30');
  const todayOffset = differenceInDays(today, rangeStart);

  return (
    <div className="p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Планирование производства</h1>
          <p className="text-sm text-slate-500 mt-0.5">Диаграмма Ганта по заказам</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={filterWs} onChange={e => setFilterWs(Number(e.target.value))}
            className="px-3 py-2 text-xs rounded border border-slate-200 bg-white text-slate-700 focus:outline-none">
            <option value={0}>Все цехи</option>
            {workshops.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(Number(e.target.value))}
            className="px-3 py-2 text-xs rounded border border-slate-200 bg-white text-slate-700 focus:outline-none">
            <option value={0}>Все статусы</option>
            {statuses.filter(s => s.id !== 4).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {/* Week navigation */}
      <div className="bg-card rounded border border-border overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <button onClick={() => setWeekStart(d => addDays(d, -7))}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition"><ChevronLeft size={15} /></button>
          <span className="text-xs font-medium text-slate-700">
            {format(days[0], 'd MMM', { locale: ru })} — {format(days[days.length - 1], 'd MMM yyyy', { locale: ru })}
          </span>
          <button onClick={() => setWeekStart(d => addDays(d, 7))}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition"><ChevronRight size={15} /></button>
          <div className="ml-4 flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded" style={{ background: '#3b82f6' }} />Нормальный</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded" style={{ background: '#f59e0b' }} />Высокий</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded" style={{ background: '#ef4444' }} />Критический</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div style={{ minWidth: `${180 + days.length * colW}px` }}>
            {/* Day header */}
            <div className="flex border-b border-border">
              <div className="flex-shrink-0 w-44 px-4 py-2 text-xs font-medium text-slate-500 border-r border-border">Заказ / Изделие</div>
              {days.map((d, i) => {
                const isToday = differenceInDays(d, today) === 0;
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                return (
                  <div key={i} className="flex-shrink-0 text-center py-2 border-r border-border last:border-r-0"
                    style={{ width: colW, background: isToday ? '#dbeafe' : isWeekend ? '#f8fafc' : 'white' }}>
                    <div className="text-xs text-slate-400">{format(d, 'EEE', { locale: ru })}</div>
                    <div className={`text-xs font-medium ${isToday ? 'text-blue-700' : isWeekend ? 'text-slate-400' : 'text-slate-600'}`}
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {format(d, 'd')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rows */}
            {ordersWithBars.length === 0 ? (
              <div className="px-4 py-12 text-center text-xs text-slate-400">Нет заказов в выбранном диапазоне</div>
            ) : ordersWithBars.map(o => {
              const st = statusMap[o.statusId];
              const ws = workshopMap[o.workshopId];
              const color = PRIORITY_COLORS[o.priority];
              const isHovered = hoverId === o.id;
              return (
                <div key={o.id} className="flex border-b border-border last:border-b-0 hover:bg-slate-50 transition">
                  {/* Label column */}
                  <div className="flex-shrink-0 w-44 px-4 py-3 border-r border-border">
                    <div className="text-xs font-medium text-slate-800 truncate" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{o.number}</div>
                    <div className="text-xs text-slate-500 truncate mt-0.5" title={o.product}>{o.product.slice(0, 22)}{o.product.length > 22 ? '…' : ''}</div>
                    <div className="flex items-center gap-1 mt-1">
                      {st && <span className="text-xs" style={{ color: st.color }}>{st.name}</span>}
                      {ws && <span className="text-xs text-slate-400">· {ws.code}</span>}
                    </div>
                  </div>

                  {/* Gantt track */}
                  <div className="flex-1 relative py-3" style={{ height: 60 }}>
                    {/* Weekend bg */}
                    {days.map((d, i) => {
                      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                      return isWeekend ? (
                        <div key={i} className="absolute inset-y-0" style={{ left: i * colW, width: colW, background: '#f8fafc' }} />
                      ) : null;
                    })}
                    {/* Today line */}
                    {todayOffset >= 0 && todayOffset < days.length && (
                      <div className="absolute inset-y-0 w-px z-10" style={{ left: todayOffset * colW + colW / 2, background: '#3b82f6', opacity: 0.6 }} />
                    )}
                    {/* Bar */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 rounded cursor-pointer transition-all"
                      style={{
                        left: o.left * colW + 3,
                        width: Math.max(o.width * colW - 6, 20),
                        height: isHovered ? 24 : 20,
                        background: color,
                        opacity: o.statusId === 5 ? 0.5 : 1,
                      }}
                      onMouseEnter={() => setHoverId(o.id)}
                      onMouseLeave={() => setHoverId(null)}
                    >
                      <div className="px-2 h-full flex items-center overflow-hidden">
                        <span className="text-white text-xs font-medium truncate whitespace-nowrap" style={{ fontSize: 10 }}>{o.number}</span>
                      </div>
                      {/* Tooltip */}
                      {isHovered && (
                        <div className="absolute bottom-full left-0 mb-2 bg-slate-900 text-white rounded p-3 text-xs shadow-xl z-20 whitespace-nowrap pointer-events-none">
                          <div className="font-semibold">{o.number}</div>
                          <div className="text-slate-300 mt-0.5">{o.product}</div>
                          <div className="text-slate-400 mt-1">{o.createdAt} → {o.deadline}</div>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ background: st?.color }} />
                            {st?.name}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <Info size={12} />
        <span>Клик на полосе — детали заказа. Синяя вертикальная линия — сегодня (2024-01-30).</span>
      </div>
    </div>
  );
}
