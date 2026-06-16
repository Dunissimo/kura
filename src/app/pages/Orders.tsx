import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, X, Upload, Download, ChevronDown } from 'lucide-react';
import { useApp } from '../store';
import { Order, Priority } from '../data';
import { createZakaz, updateZakaz, deleteZakaz, updateStatusZakaz } from '../api/zakaz';

const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Низкий', normal: 'Обычный', high: 'Высокий', critical: 'Критический'
};
const PRIORITY_COLORS: Record<Priority, string> = {
  low: '#94a3b8', normal: '#3b82f6', high: '#f59e0b', critical: '#ef4444'
};

const emptyOrder = (): Omit<Order, 'id'> => ({
  number: '',
  product: '',
  quantity: 1,
  statusId: 6,
  priority: 'normal',
  createdAt: new Date().toISOString().slice(0, 10),
  deadline: '',
  managerId: 4,
  workshopId: 1,
  description: '',
});

function Badge({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ background: color + '1a', color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

export default function Orders() {
  const { orders, setOrders, statuses, workshops } = useApp();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState(0);
  const [filterPriority, setFilterPriority] = useState('');
  const [modal, setModal] = useState<{ open: boolean; order: Omit<Order, 'id'> & { id?: number }; isNew: boolean }>({
    open: false, order: emptyOrder(), isNew: true
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [statusModal, setStatusModal] = useState<{ open: boolean; orderId: number; currentStatus: number } | null>(null);

  const statusMap = Object.fromEntries(statuses.map(s => [s.id, s]));
  const workshopMap = Object.fromEntries(workshops.map(w => [w.id, w]));

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const matchSearch = !q || o.number.toLowerCase().includes(q) || o.product.toLowerCase().includes(q);
    const matchStatus = !filterStatus || o.statusId === filterStatus;
    const matchPriority = !filterPriority || o.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const openNew = () => setModal({ open: true, order: emptyOrder(), isNew: true });
  const openEdit = (o: Order) => setModal({ open: true, order: { ...o }, isNew: false });

  const save = async () => {
    if (!modal.order.number || !modal.order.product || !modal.order.deadline) return;

    try {
      if (modal.isNew) {
        const dto = {
          idZakaz: modal.order.number,
          For: modal.order.number,
          zakazQuantity: modal.order.quantity,
          statusId: modal.order.statusId,
          priority: modal.order.priority,
          zakazCreated: new Date(modal.order.createdAt),
          zakazCompleted: null,
          deadline: modal.order.deadline,
          Comment: modal.order.description,
          workshopId: modal.order.workshopId,
          productName: modal.order.product,
          status: {
            idStatus: modal.order.statusId,
            StatusName: statuses.find(s => s.id === modal.order.statusId)?.name || '',
            StatusColor: statuses.find(s => s.id === modal.order.statusId)?.color || '',
            StatusCode: statuses.find(s => s.id === modal.order.statusId)?.code || '',
          },
          stageid: null,
        };

        const response = await createZakaz(dto as any);
        if (response?.status === 201 || response?.status === 200) {
          setOrders(prev => [...prev, {
            ...modal.order,
            id: response.data.idZakaz,
          } as Order]);
          setModal(p => ({ ...p, open: false }));
        }
      } else if (modal.order.id) {
        const dto = {
          For: modal.order.number,
          zakazQuantity: modal.order.quantity,
          statusId: modal.order.statusId,
          priority: modal.order.priority,
          Comment: modal.order.description,
          workshopId: modal.order.workshopId,
          deadline: modal.order.deadline,
          zakazCompleted: null,
        };

        const response = await updateZakaz(modal.order.id, dto as any);
        if (response?.status === 200) {
          setOrders(prev => prev.map(o => o.id === modal.order.id ? modal.order as Order : o));
          setModal(p => ({ ...p, open: false }));
        }
      }
    } catch (error) {
      alert('Не удалось сохранить заказ');
    }
  };

  const del = async () => {
    if (deleteId !== null) {
      try {
        const response = await deleteZakaz(deleteId);
        if (response?.status === 200 || response?.status === 204) {
          setOrders(prev => prev.filter(o => o.id !== deleteId));
          setDeleteId(null);
        }
      } catch (error) {
        alert('Не удалось удалить заказ');
      }
    }
  };

  const changeStatus = async (statusId: number) => {
    if (!statusModal) return;
    try {
      const response = await updateStatusZakaz(statusModal.orderId, statusId);
      if (response?.status === 200) {
        setOrders(prev => prev.map(o => o.id === statusModal.orderId ? { ...o, statusId } : o));
      }
    } catch (error) {
      alert('Не удалось сменить статус');
    } finally {
      setStatusModal(null);
    }
  };

  const exportCsv = () => {
    const delim = ';';
    const quote = (value: string | number | undefined | null) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const header = ['Номер', 'Изделие', 'Количество', 'Статус', 'Приоритет', 'Создан', 'Срок'].join(delim);
    const rows = filtered.map(o =>
      [o.number, o.product, o.quantity, statusMap[o.statusId]?.name, PRIORITY_LABELS[o.priority], o.createdAt, o.deadline]
        .map(quote)
        .join(delim)
    );
    const csv = '\uFEFF' + header + '\r\n' + rows.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click();
  };

  const f = modal.order;
  const setF = (patch: Partial<typeof f>) => setModal(p => ({ ...p, order: { ...p.order, ...patch } }));

  return (
    <div className="p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Заказы</h1>
          <p className="text-sm text-slate-500 mt-0.5">Управление производственными заказами</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCsv} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition">
            <Download size={13} /> Экспорт
          </button>
          <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded text-white transition hover:opacity-90" style={{ background: '#1d4ed8' }}>
            <Plus size={13} /> Новый заказ
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по номеру или изделию..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(Number(e.target.value))}
          className="px-3 py-2 text-xs rounded border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value={0}>Все статусы</option>
          {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          className="px-3 py-2 text-xs rounded border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Все приоритеты</option>
          {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <span className="text-xs text-slate-400">{filtered.length} из {orders.length}</span>
      </div>

      {/* Table */}
      <div className="bg-card rounded border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-slate-50">
                {['Номер', 'Изделие', 'Кол-во', 'Цех', 'Приоритет', 'Статус', 'Создан', 'Срок', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-400">Заказы не найдены</td></tr>
              ) : filtered.map((o, i) => {
                const st = statusMap[o.statusId];
                const ws = workshopMap[o.workshopId];
                const isLast = i === filtered.length - 1;
                const isOverdue = new Date(o.deadline) < new Date() && o.statusId !== 3 && o.statusId !== 4;
                console.log(isOverdue);
                
                return (
                  <tr key={o.id} className={`hover:bg-slate-50 transition ${!isLast ? 'border-b border-border' : ''}`}>
                    <td className="px-4 py-3 font-semibold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{o.id}</td>
                    <td className="px-4 py-3 text-slate-700 max-w-[200px]">
                      <div className="truncate" title={o.product}>{o.product}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-left" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{o.quantity}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{ws?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap"
                        style={{ background: PRIORITY_COLORS[o.priority] + '22', color: PRIORITY_COLORS[o.priority] }}>
                        {PRIORITY_LABELS[o.priority]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {st && (
                        <button
                          onClick={() => setStatusModal({ open: true, orderId: o.id, currentStatus: o.statusId })}
                          className="flex items-center gap-1.5 hover:opacity-80 transition"
                          title="Сменить статус"
                        >
                          <Badge color={st.color} label={st.name} />
                          <ChevronDown size={10} className="text-slate-400" />
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{o.createdAt}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      <span className={!isOverdue ? 'text-red-600 font-medium' : 'text-slate-500'}>{o.deadline}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(o)} className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setDeleteId(o.id)} className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status modal */}
      {statusModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setStatusModal(null)}>
          <div className="bg-white rounded-lg shadow-xl p-5 w-64" onClick={e => e.stopPropagation()}>
            <div className="text-sm font-semibold text-slate-800 mb-3">Сменить статус</div>
            <div className="space-y-1.5">
              {statuses.map(s => (
                <button key={s.id} onClick={() => changeStatus(s.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs text-left transition hover:bg-slate-50 ${s.id === statusModal.currentStatus ? 'bg-slate-100' : ''}`}>
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-slate-700">{s.name}</span>
                  {s.id === statusModal.currentStatus && <span className="ml-auto text-slate-400">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit/create modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setModal(p => ({ ...p, open: false }))}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-900">{modal.isNew ? 'Новый заказ' : `Редактирование ${f.number}`}</h2>
              <button onClick={() => setModal(p => ({ ...p, open: false }))} className="text-slate-400 hover:text-slate-600 transition"><X size={16} /></button>
            </div>
            <div className="px-5 py-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1.5">Номер заказа *</label>
                  <input disabled={!modal.isNew} value={f.number} onChange={e => setF({ number: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ЗАК-XXXX" style={{ fontFamily: "'JetBrains Mono', monospace" }} />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1.5">Количество *</label>
                  <input type="number" min={1} value={f.quantity} onChange={e => setF({ quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1.5">Наименование изделия *</label>
                <input value={f.product} onChange={e => setF({ product: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Название и обозначение изделия" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1.5">Статус</label>
                  <select value={f.statusId} onChange={e => setF({ statusId: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1.5">Приоритет</label>
                  <select value={f.priority} onChange={e => setF({ priority: e.target.value as Priority })}
                    className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1.5">Цех</label>
                  <select value={f.workshopId} onChange={e => setF({ workshopId: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    {workshops.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1.5">Срок сдачи *</label>
                  <input type="date" min={new Date().toISOString().slice(0, 10)} value={f.deadline} onChange={e => setF({ deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1.5">Примечание</label>
                <textarea value={f.description} onChange={e => setF({ description: e.target.value })}
                  rows={3} className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Дополнительная информация" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-200">
              <button onClick={() => setModal(p => ({ ...p, open: false }))}
                className="px-4 py-2 text-xs font-medium rounded border border-slate-200 text-slate-700 hover:bg-slate-50 transition">
                Отмена
              </button>
              <button onClick={save}
                className="px-4 py-2 text-xs font-medium rounded text-white transition hover:opacity-90"
                style={{ background: '#1d4ed8' }}>
                {modal.isNew ? 'Создать заказ' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-80" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Удалить заказ?</h3>
            <p className="text-xs text-slate-500 mb-5">Это действие необратимо. Все связанные процессы также будут удалены.</p>
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
