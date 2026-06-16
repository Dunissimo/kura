import { useState } from 'react';
import { Plus, X, Pencil, Trash2, Search } from 'lucide-react';
import { useApp } from '../store';
import { Process } from '../data';

function empty(): Omit<Process, 'id'> {
  return { orderId: 0, stageId: 0, statusId: 1, workshopId: 0, startDate: '', endDate: '', masterId: 0, notes: '' };
}

export default function Processes() {
  const { processes, setProcesses, orders, stages, statuses, workshops, users, nextId } = useApp();
  const [search, setSearch] = useState('');
  const [filterWorkshop, setFilterWorkshop] = useState(0);
  const [modal, setModal] = useState<{ open: boolean; proc: Omit<Process, 'id'> & { id?: number }; isNew: boolean }>({
    open: false, proc: empty(), isNew: true
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const orderMap = Object.fromEntries(orders.map(o => [o.id, o]));
  const stageMap = Object.fromEntries(stages.map(s => [s.id, s]));
  const statusMap = Object.fromEntries(statuses.map(s => [s.id, s]));
  const workshopMap = Object.fromEntries(workshops.map(w => [w.id, w]));
  const masterMap = Object.fromEntries(users.filter(u => u.Role === 'master').map(u => [u.id, u]));

  const filtered = processes.filter(p => {
    const ord = orderMap[p.orderId];
    const q = search.toLowerCase();
    const matchSearch = !q || ord?.number.toLowerCase().includes(q) || ord?.product.toLowerCase().includes(q);
    const matchWs = !filterWorkshop || p.workshopId === filterWorkshop;
    return matchSearch && matchWs;
  });

  const openNew = () => setModal({ open: true, proc: { ...empty(), orderId: orders[0]?.id ?? 0, stageId: stages[0]?.id ?? 0, workshopId: workshops[0]?.id ?? 0, masterId: users.find(u => u.Role === 'master')?.id ?? 0 }, isNew: true });
  const openEdit = (p: Process) => setModal({ open: true, proc: { ...p }, isNew: false });

  const save = () => {
    const { proc } = modal;
    if (!proc.orderId || !proc.stageId || !proc.startDate || !proc.endDate) return;
    if (modal.isNew) {
      setProcesses(prev => [...prev, { ...proc, id: nextId() } as Process]);
    } else {
      setProcesses(prev => prev.map(p => p.id === proc.id ? proc as Process : p));
    }
    setModal(p => ({ ...p, open: false }));
  };

  const del = () => {
    if (deleteId !== null) { setProcesses(prev => prev.filter(p => p.id !== deleteId)); setDeleteId(null); }
  };

  const f = modal.proc;
  const setF = (patch: Partial<typeof f>) => setModal(p => ({ ...p, proc: { ...p.proc, ...patch } }));

  return (
    <div className="p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Производственные процессы</h1>
          <p className="text-sm text-slate-500 mt-0.5">Этапы изготовления по заказам</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded text-white hover:opacity-90 transition" style={{ background: '#1d4ed8' }}>
          <Plus size={13} /> Добавить процесс
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по заказу..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={filterWorkshop} onChange={e => setFilterWorkshop(Number(e.target.value))}
          className="px-3 py-2 text-xs rounded border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value={0}>Все цехи</option>
          {workshops.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <span className="text-xs text-slate-400">{filtered.length} из {processes.length}</span>
      </div>

      <div className="bg-card rounded border border-border overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-slate-50">
              {['ID', 'Заказ', 'Этап', 'Цех', 'Статус', 'Мастер', 'Начало', 'Конец', 'Примечание', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-slate-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={10} className="px-4 py-12 text-center text-slate-400">Процессы не найдены</td></tr>
            ) : filtered.map((p, i) => {
              const ord = orderMap[p.orderId];
              const stage = stageMap[p.stageId];
              const status = statusMap[p.statusId];
              const ws = workshopMap[p.workshopId];
              const master = masterMap[p.masterId];
              const isLast = i === filtered.length - 1;
              return (
                <tr key={p.id} className={`hover:bg-slate-50 transition ${!isLast ? 'border-b border-border' : ''}`}>
                  <td className="px-4 py-3 text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>#{p.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{ord?.number ?? '—'}</div>
                    <div className="text-slate-400 truncate max-w-[140px]" title={ord?.product}>{ord?.product}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{stage?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{ws?.code ?? '—'}</td>
                  <td className="px-4 py-3">
                    {status && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: status.color + '1a', color: status.color }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
                        {status.name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{master ? master.Name.split(' ').slice(0, 2).join(' ') : '—'}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.startDate}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.endDate}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-[140px]">
                    <div className="truncate" title={p.notes}>{p.notes || '—'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"><Pencil size={13} /></button>
                      <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setModal(p => ({ ...p, open: false }))}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-900">{modal.isNew ? 'Новый процесс' : 'Редактирование процесса'}</h2>
              <button onClick={() => setModal(p => ({ ...p, open: false }))} className="text-slate-400 hover:text-slate-600 transition"><X size={16} /></button>
            </div>
            <div className="px-5 py-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1.5">Заказ *</label>
                  <select value={f.orderId} onChange={e => setF({ orderId: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value={0}>— Выберите —</option>
                    {orders.map(o => <option key={o.id} value={o.id}>{o.number} — {o.product.slice(0, 30)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1.5">Этап *</label>
                  <select value={f.stageId} onChange={e => setF({ stageId: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value={0}>— Выберите —</option>
                    {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1.5">Цех</label>
                  <select value={f.workshopId} onChange={e => setF({ workshopId: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {workshops.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1.5">Статус</label>
                  <select value={f.statusId} onChange={e => setF({ statusId: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1.5">Мастер</label>
                <select value={f.masterId} onChange={e => setF({ masterId: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value={0}>— Не назначен —</option>
                  {users.filter(u => u.Role === 'master').map(u => <option key={u.id} value={u.id}>{u.Name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1.5">Дата начала *</label>
                  <input type="date" min={new Date().toISOString().slice(0, 10)} value={f.startDate} onChange={e => setF({ startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1.5">Дата окончания *</label>
                  <input type="date" min={new Date().toISOString().slice(0, 10)} value={f.endDate} onChange={e => setF({ endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1.5">Примечание</label>
                <textarea value={f.notes} onChange={e => setF({ notes: e.target.value })} rows={3}
                  className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-200">
              <button onClick={() => setModal(p => ({ ...p, open: false }))} className="px-4 py-2 text-xs font-medium rounded border border-slate-200 text-slate-700 hover:bg-slate-50 transition">Отмена</button>
              <button onClick={save} className="px-4 py-2 text-xs font-medium rounded text-white hover:opacity-90 transition" style={{ background: '#1d4ed8' }}>
                {modal.isNew ? 'Добавить' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-80" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Удалить процесс?</h3>
            <p className="text-xs text-slate-500 mb-5">Запись будет удалена без возможности восстановления.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-xs font-medium rounded border border-slate-200 text-slate-700 hover:bg-slate-50 transition">Отмена</button>
              <button onClick={del} className="px-4 py-2 text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 transition">Удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
