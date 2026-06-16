import { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { useApp } from '../store';
import { Status, Stage, Workshop } from '../data';
import { createStatus, deleteStatus, updateStatus } from '../api/status';
import { createWorkshop, deleteWorkshop, updateWorkshop } from '../api/workshop';
import { createStage, deleteStage, updateStage } from '../api/stage';

type Tab = 'statuses' | 'stages' | 'workshops';

const TABS: { key: Tab; label: string }[] = [
  { key: 'statuses', label: 'Статусы' },
  { key: 'stages', label: 'Этапы' },
  { key: 'workshops', label: 'Цехи' },
];

function Row({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return <tr className={`hover:bg-slate-50 transition ${!last ? 'border-b border-border' : ''}`}>{children}</tr>;
}

function Td({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return <td className="px-5 py-3 text-xs text-slate-700" style={mono ? { fontFamily: "'JetBrains Mono', monospace" } : {}}>{children}</td>;
}

function Th({ label }: { label: string }) {
  return <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">{label}</th>;
}

function Actions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <td className="px-4 py-3">
      <div className="flex gap-1.5">
        <button onClick={onEdit} className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"><Pencil size={13} /></button>
        <button onClick={onDelete} className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition"><Trash2 size={13} /></button>
      </div>
    </td>
  );
}

function DeleteConfirm({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-80" onClick={e => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Удалить запись?</h3>
        <p className="text-xs text-slate-500 mb-5">Действие необратимо.</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-xs font-medium rounded border border-slate-200 text-slate-700 hover:bg-slate-50 transition">Отмена</button>
          <button onClick={onConfirm} className="px-4 py-2 text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 transition">Удалить</button>
        </div>
      </div>
    </div>
  );
}

/* ─── STATUSES ─── */
function StatusesTab() {
  const { statuses, setStatuses, loadStatuses } = useApp();
  const [modal, setModal] = useState<{ open: boolean; item: Partial<Status> & { id?: number }; isNew: boolean }>({ open: false, item: {}, isNew: true });
  const [delId, setDelId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const f = modal.item;
  const setF = (p: Partial<Status>) => setModal(m => ({ ...m, item: { ...m.item, ...p } }));

  const save = async () => {
    if (!f.name || !f.code || !f.color) return;
    setIsSaving(true);

    try {
      const dto = {
        StatusName: f.name,
        StatusColor: f.color,
        StatusCode: f.code,
      };

      if (modal.isNew) {
        const response = await createStatus(dto as any);
        if (response?.status === 201 || response?.status === 200) {
          await loadStatuses();
          alert('Статус успешно добавлен');
        }
      } else if (f.id) {
        const response = await updateStatus(f.id, dto as any);
        if (response?.status === 200) {
          await loadStatuses();
          alert('Статус успешно изменён');
        }
      }
    } catch (error) {
      alert('Не удалось сохранить статус');
    } finally {
      setIsSaving(false);
      setModal(m => ({ ...m, open: false }));
    }
  };
  return (
    <>
      <div className="flex justify-end mb-3">
        <button onClick={() => setModal({ open: true, item: { color: '#64748b', code: '' }, isNew: true })}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded text-white hover:opacity-90 transition" style={{ background: '#1d4ed8' }}>
          <Plus size={13} /> Добавить
        </button>
      </div>
      <div className="bg-card rounded border border-border overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border bg-slate-50"><Th label="ID" /><Th label="Название" /><Th label="Код" /><Th label="Цвет" /><th /></tr></thead>
          <tbody>
            {statuses.map((s, i) => (
              <Row key={s.id} last={i === statuses.length - 1}>
                <Td mono>#{s.id}</Td>
                <Td>
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    {s.name}
                  </span>
                </Td>
                <Td mono>{s.code}</Td>
                <Td><span className="text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: s.color }}>{s.color}</span></Td>
                <Actions onEdit={() => setModal({ open: true, item: { ...s }, isNew: false })} onDelete={() => setDelId(s.id)} />
              </Row>
            ))}
          </tbody>
        </table>
      </div>
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setModal(m => ({ ...m, open: false }))}>
          <div className="bg-white rounded-lg shadow-xl w-80" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-900">{modal.isNew ? 'Новый статус' : 'Редактирование'}</h2>
              <button onClick={() => setModal(m => ({ ...m, open: false }))} className="text-slate-400 hover:text-slate-600"><X size={15} /></button>
            </div>
            <div className="px-5 py-4 space-y-3 text-xs">
              <div><label className="block font-medium text-slate-700 mb-1.5">Название *</label>
                <input value={f.name ?? ''} onChange={e => setF({ name: e.target.value })} className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block font-medium text-slate-700 mb-1.5">Код *</label>
                <input value={f.code ?? ''} onChange={e => setF({ code: e.target.value })} className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ fontFamily: "'JetBrains Mono', monospace" }} /></div>
              <div><label className="block font-medium text-slate-700 mb-1.5">Цвет</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={f.color ?? '#64748b'} onChange={e => setF({ color: e.target.value })} className="w-10 h-9 rounded border border-slate-200 cursor-pointer" />
                  <input value={f.color ?? ''} onChange={e => setF({ color: e.target.value })} className="flex-1 px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ fontFamily: "'JetBrains Mono', monospace" }} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-200">
              <button onClick={() => setModal(m => ({ ...m, open: false }))} className="px-4 py-2 text-xs font-medium rounded border border-slate-200 text-slate-700 hover:bg-slate-50 transition">Отмена</button>
              <button onClick={save} className="px-4 py-2 text-xs font-medium rounded text-white hover:opacity-90 transition" style={{ background: '#1d4ed8' }}>Сохранить</button>
            </div>
          </div>
        </div>
      )}
      {delId !== null && <DeleteConfirm onConfirm={async () => {
        setIsDeleting(true);
        try {
          if (delId !== null) {
            const response = await deleteStatus(delId);
            if (response?.status === 200 || response?.status === 204) {
              await loadStatuses();
              alert('Статус удалён');
            }
          }
        } catch (error) {
          alert('Не удалось удалить статус');
        } finally {
          setIsDeleting(false);
          setDelId(null);
        }
      }} onCancel={() => setDelId(null)} />}
    </>
  );
}

/* ─── STAGES ─── */
function StagesTab() {
  const { stages, workshops, loadStages } = useApp();
  const wsMap = Object.fromEntries(workshops.map(w => [w.id, w]));
  const [modal, setModal] = useState<{ open: boolean; item: Partial<Stage> & { id?: number }; isNew: boolean }>({ open: false, item: {}, isNew: true });
  const [delId, setDelId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const f = modal.item;
  const setF = (p: Partial<Stage>) => setModal(m => ({ ...m, item: { ...m.item, ...p } }));

  const save = async () => {
    if (!f.name || !f.workshopId) return;
    setIsSaving(true);

    const dto = {
      NameStages: f.name,
      DescriptionStages: f.description ?? '',
      DurationStages: f.duration ?? null,
      OrderStages: f.order ?? null,
      WorkshopId: f.workshopId,
    };

    try {
      if (modal.isNew) {
        const response = await createStage(dto as any);
        if (response?.status === 201 || response?.status === 200) {
          await loadStages();
          alert('Этап успешно добавлен');
        }
      } else if (f.id) {
        const response = await updateStage(f.id, dto as any);
        if (response?.status === 200) {
          await loadStages();
          alert('Этап успешно изменён');
        }
      }
    } catch (error) {
      alert('Не удалось сохранить этап');
    } finally {
      setIsSaving(false);
      setModal(m => ({ ...m, open: false }));
    }
  };

  const removeStage = async () => {
    if (delId === null) return;
    setIsDeleting(true);

    try {
      const response = await deleteStage(delId);
      if (response?.status === 200 || response?.status === 204) {
        await loadStages();
        alert('Этап удалён');
      }
    } catch (error) {
      alert('Не удалось удалить этап');
    } finally {
      setIsDeleting(false);
      setDelId(null);
    }
  };

  return (
    <>
      <div className="flex justify-end mb-3">
        <button onClick={() => setModal({ open: true, item: { workshopId: workshops[0]?.id, duration: 8, order: stages.length + 1, description: '' }, isNew: true })}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded text-white hover:opacity-90 transition" style={{ background: '#1d4ed8' }}>
          <Plus size={13} /> Добавить
        </button>
      </div>
      <div className="bg-card rounded border border-border overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border bg-slate-50"><Th label="#" /><Th label="Название" /><Th label="Цех" /><Th label="Длит. (ч)" /><Th label="Порядок" /><Th label="Описание" /><th /></tr></thead>
          <tbody>
            {[...stages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((s, i) => (
              <Row key={s.id} last={i === stages.length - 1}>
                <Td mono>#{s.id}</Td>
                <Td>{s.name}</Td>
                <Td>{wsMap[s.workshopId]?.name ?? '—'}</Td>
                <Td mono>{s.duration}</Td>
                <Td mono>{s.order}</Td>
                <Td>{s.description ?? '—'}</Td>
                <Actions onEdit={() => setModal({ open: true, item: { ...s }, isNew: false })} onDelete={() => setDelId(s.id)} />
              </Row>
            ))}
          </tbody>
        </table>
      </div>
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setModal(m => ({ ...m, open: false }))}>
          <div className="bg-white rounded-lg shadow-xl w-80" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-900">{modal.isNew ? 'Новый этап' : 'Редактирование'}</h2>
              <button onClick={() => setModal(m => ({ ...m, open: false }))} className="text-slate-400 hover:text-slate-600"><X size={15} /></button>
            </div>
            <div className="px-5 py-4 space-y-3 text-xs">
              <div><label className="block font-medium text-slate-700 mb-1.5">Название *</label>
                <input value={f.name ?? ''} onChange={e => setF({ name: e.target.value })} className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block font-medium text-slate-700 mb-1.5">Цех *</label>
                <select value={f.workshopId ?? ''} onChange={e => setF({ workshopId: Number(e.target.value) })} className="w-full px-3 py-2 rounded border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {workshops.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-medium text-slate-700 mb-1.5">Длительность (ч)</label>
                  <input type="number" min={1} value={f.duration ?? 8} onChange={e => setF({ duration: Number(e.target.value) })} className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block font-medium text-slate-700 mb-1.5">Порядок</label>
                  <input type="number" min={1} value={f.order ?? 1} onChange={e => setF({ order: Number(e.target.value) })} className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <div><label className="block font-medium text-slate-700 mb-1.5">Описание</label>
                <textarea value={f.description ?? ''} onChange={e => setF({ description: e.target.value })} className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={4} /></div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-200">
              <button onClick={() => setModal(m => ({ ...m, open: false }))} className="px-4 py-2 text-xs font-medium rounded border border-slate-200 text-slate-700 hover:bg-slate-50 transition">Отмена</button>
              <button onClick={save} className="px-4 py-2 text-xs font-medium rounded text-white hover:opacity-90 transition" style={{ background: '#1d4ed8' }}>Сохранить</button>
            </div>
          </div>
        </div>
      )}
      {delId !== null && <DeleteConfirm onConfirm={removeStage} onCancel={() => setDelId(null)} />}
    </>
  );
}

/* ─── WORKSHOPS ─── */
function WorkshopsTab() {
  const { workshops, setWorkshops, loadWorkshops } = useApp();
  const [modal, setModal] = useState<{ open: boolean; item: Partial<Workshop> & { id?: number }; isNew: boolean }>({ open: false, item: {}, isNew: true });
  const [delId, setDelId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const f = modal.item;
  const setF = (p: Partial<Workshop>) => setModal(m => ({ ...m, item: { ...m.item, ...p } }));

  const save = async () => {
    if (!f.name) return;
    setIsSaving(true);

    try {
      const dto = {
        NameWS: f.name,
        MaxLoadWS: f.capacity ?? '',
        CurrentLoadWS: f.capacity ?? '',
        CodeWS: f.code,
      };

      if (modal.isNew) {
        const response = await createWorkshop(dto as any);
        if (response?.status === 201 || response?.status === 200) {
          await loadWorkshops();
          alert('Цех успешно добавлен');
        }
      } else if (f.id) {
        const response = await updateWorkshop(f.id, dto as any);
        if (response?.status === 200) {
          await loadWorkshops();
          alert('Цех успешно изменён');
        }
      }
    } catch (error) {
      alert('Не удалось сохранить цех');
    } finally {
      setIsSaving(false);
      setModal(m => ({ ...m, open: false }));
    }
  };
  return (
    <>
      <div className="flex justify-end mb-3">
        <button onClick={() => setModal({ open: true, item: { capacity: 5 }, isNew: true })}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded text-white hover:opacity-90 transition" style={{ background: '#1d4ed8' }}>
          <Plus size={13} /> Добавить
        </button>
      </div>
      <div className="bg-card rounded border border-border overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border bg-slate-50"><Th label="ID" /><Th label="Название" /><Th label="Код" /><Th label="Мощность" /><th /></tr></thead>
          <tbody>
            {workshops.map((w, i) => (
              <Row key={w.id} last={i === workshops.length - 1}>
                <Td mono>#{w.id}</Td><Td>{w.name}</Td><Td mono>{w.code}</Td>
                <Td mono>{w.capacity}</Td>
                <Actions onEdit={() => setModal({ open: true, item: { ...w }, isNew: false })} onDelete={() => setDelId(w.id)} />
              </Row>
            ))}
          </tbody>
        </table>
      </div>
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setModal(m => ({ ...m, open: false }))}>
          <div className="bg-white rounded-lg shadow-xl w-80" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-900">{modal.isNew ? 'Новый цех' : 'Редактирование'}</h2>
              <button onClick={() => setModal(m => ({ ...m, open: false }))} className="text-slate-400 hover:text-slate-600"><X size={15} /></button>
            </div>
            <div className="px-5 py-4 space-y-3 text-xs">
              <div><label className="block font-medium text-slate-700 mb-1.5">Название *</label>
                <input value={f.name ?? ''} onChange={e => setF({ name: e.target.value })} className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-medium text-slate-700 mb-1.5">Код *</label>
                  <input value={f.code ?? ''} onChange={e => setF({ code: e.target.value })} className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ fontFamily: "'JetBrains Mono', monospace" }} /></div>
                <div><label className="block font-medium text-slate-700 mb-1.5">Мощность</label>
                  <input type="number" min={1} value={f.capacity ?? 5} onChange={e => setF({ capacity: Number(e.target.value) })} className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-200">
              <button onClick={() => setModal(m => ({ ...m, open: false }))} className="px-4 py-2 text-xs font-medium rounded border border-slate-200 text-slate-700 hover:bg-slate-50 transition">Отмена</button>
              <button onClick={save} className="px-4 py-2 text-xs font-medium rounded text-white hover:opacity-90 transition" style={{ background: '#1d4ed8' }}>Сохранить</button>
            </div>
          </div>
        </div>
      )}
      {delId !== null && <DeleteConfirm onConfirm={async () => {
        setIsDeleting(true);
        try {
          if (delId !== null) {
            const response = await deleteWorkshop(delId);
            if (response?.status === 200 || response?.status === 204) {
              await loadWorkshops();
              alert('Цех удалён');
            }
          }
        } catch (error) {
          alert('Не удалось удалить цех');
        } finally {
          setIsDeleting(false);
          setDelId(null);
        }
      }} onCancel={() => setDelId(null)} />}
    </>
  );
}

export default function References() {
  const [tab, setTab] = useState<Tab>('statuses');
  return (
    <div className="p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-slate-900">Справочники</h1>
        <p className="text-sm text-slate-500 mt-0.5">Управление нормативно-справочной информацией</p>
      </div>
      <div className="flex gap-0 mb-5 border-b border-border">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-xs font-medium transition border-b-2 -mb-px ${tab === t.key ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'statuses' && <StatusesTab />}
      {tab === 'stages' && <StagesTab />}
      {tab === 'workshops' && <WorkshopsTab />}
    </div>
  );
}
