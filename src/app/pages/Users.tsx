import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Shield, UserCheck, UserX } from 'lucide-react';
import { useApp } from '../store';
import { User, Role } from '../data';
import { createUser, deleteUser, updateUser } from '../api/user';

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Администратор', dispatcher: 'Диспетчер', master: 'Мастер', manager: 'Менеджер'
};
const ROLE_COLORS: Record<Role, string> = {
  admin: '#7c3aed', dispatcher: '#1d4ed8', master: '#059669', manager: '#b45309'
};

function empty(): Omit<User, 'id'> {
  return { Name: '', Login: '', Password: '', Role: 'manager', department: '', email: '', phone: '', active: true };
}

export default function Users() {
  const { users, setUsers, nextId, loadUsers } = useApp();
  const [modal, setModal] = useState<{ open: boolean; user: Omit<User, 'id'> & { id?: number }; isNew: boolean }>({
    open: false, user: empty(), isNew: true
  });
  const [delId, setDelId] = useState<number | null>(null);

  const f = modal.user;
  const setF = (p: Partial<typeof f>) => setModal(m => ({ ...m, user: { ...m.user, ...p } }));

  const save = async () => {
    if (!f.Name || !f.Login) return;

    if (modal.isNew) {
      const requestRes = await createUser(f);

      if (requestRes?.status === 201) {
        loadUsers();
        alert("Пользователь успешно добавлен");
      }
    } else {
      // setUsers(p => p.map(u => u.id === f.id ? f as User : u))
      if (!f.id) {
        setModal(m => ({ ...m, open: false }));
        return;
      };

      const requestRes = await updateUser(f.id, f);

      if (requestRes.status === 200) {
        loadUsers();
        alert("Пользователь успешно изменён");
      }
    }
    
    setModal(m => ({ ...m, open: false }));
  };

  const del = async () => {
    if (!delId) return;

    await deleteUser(delId);
    setDelId(null);
    loadUsers();

    alert("Пользователь удалён!");
  };

  return (
    <div className="p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Пользователи</h1>
          <p className="text-sm text-slate-500 mt-0.5">Управление учётными записями</p>
        </div>
        <button onClick={() => setModal({ open: true, user: empty(), isNew: true })}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded text-white hover:opacity-90 transition" style={{ background: '#1d4ed8' }}>
          <Plus size={13} /> Добавить пользователя
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
        {Object.entries(ROLE_LABELS).map(([role, label]) => {
          const count = users.filter(u => u.Role === role).length;
          return (
            <div key={role} className="bg-card rounded border border-border px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                style={{ background: ROLE_COLORS[role as Role] + '1a' }}>
                <Shield size={15} style={{ color: ROLE_COLORS[role as Role] }} />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{count}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-card rounded border border-border overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-slate-50">
              {['ФИО', 'Логин', 'Роль', 'Подразделение', 'Email', 'Телефон', 'Статус', ''].map(h => (
                <th key={h} className="px-5 py-3 text-left font-medium text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => {
              const isLast = i === users.length - 1;
              const isAdmin = u.Role === 'admin';
              return (
                <tr key={u.id} className={`hover:bg-slate-50 transition ${!isLast ? 'border-b border-border' : ''} ${!u.active ? 'opacity-50' : ''}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                        style={{ background: ROLE_COLORS[u.Role] }}>
                        {u.Name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-slate-800">{u.Name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{u.Login}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{ background: ROLE_COLORS[u.Role] + '1a', color: ROLE_COLORS[u.Role] }}>
                      {ROLE_LABELS[u.Role]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{u.department}</td>
                  <td className="px-5 py-3 text-slate-500">{u.email}</td>
                  <td className="px-5 py-3 text-slate-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{u.phone}</td>
                  <td className="px-5 py-3">
                    <button className="flex items-center gap-1.5 transition hover:opacity-80">
                      {u.active
                        ? <><UserCheck size={14} className="text-green-600" /><span className="text-green-600">Активен</span></>
                        : <><UserX size={14} className="text-slate-400" /><span className="text-slate-400">Отключён</span></>
                      }
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button
                        disabled={isAdmin}
                        onClick={() => !isAdmin && setModal({ open: true, user: { ...u }, isNew: false })}
                        className={`p-1.5 rounded text-slate-400 transition ${isAdmin ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-600 hover:bg-blue-50'}`}>
                        <Pencil size={13} />
                      </button>
                      <button
                        disabled={isAdmin}
                        onClick={() => !isAdmin && setDelId(u.id)}
                        className={`p-1.5 rounded text-slate-400 transition ${isAdmin ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-600 hover:bg-red-50'}`}>
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

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setModal(m => ({ ...m, open: false }))}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-900">{modal.isNew ? 'Новый пользователь' : 'Редактирование пользователя'}</h2>
              <button onClick={() => setModal(m => ({ ...m, open: false }))} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <div className="px-5 py-5 space-y-3 text-xs">
              <div><label className="block font-medium text-slate-700 mb-1.5">ФИО *</label>
                <input value={f.Name} onChange={e => setF({ Name: e.target.value })} className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Фамилия Имя Отчество" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-medium text-slate-700 mb-1.5">Логин *</label>
                  <input value={f.Login} onChange={e => setF({ Login: e.target.value })} className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ fontFamily: "'JetBrains Mono', monospace" }} /></div>
                <div><label className="block font-medium text-slate-700 mb-1.5">Пароль</label>
                  <input value={f.Password} onChange={e => setF({ Password: e.target.value })} type="password" className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-medium text-slate-700 mb-1.5">Роль</label>
                  <select value={f.Role} onChange={e => setF({ Role: e.target.value as Role })} className="w-full px-3 py-2 rounded border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select></div>
                <div><label className="block font-medium text-slate-700 mb-1.5">Статус</label>
                  <select value={f.active ? '1' : '0'} onChange={e => setF({ active: e.target.value === '1' })} className="w-full px-3 py-2 rounded border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="1">Активен</option>
                    <option value="0">Отключён</option>
                  </select></div>
              </div>
              <div><label className="block font-medium text-slate-700 mb-1.5">Подразделение</label>
                <input value={f.department} onChange={e => setF({ department: e.target.value })} className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-medium text-slate-700 mb-1.5">Email</label>
                  <input value={f.email} onChange={e => setF({ email: e.target.value })} className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block font-medium text-slate-700 mb-1.5">Телефон</label>
                  <input value={f.phone} onChange={e => setF({ phone: e.target.value })} className="w-full px-3 py-2 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-200">
              <button onClick={() => setModal(m => ({ ...m, open: false }))} className="px-4 py-2 text-xs font-medium rounded border border-slate-200 text-slate-700 hover:bg-slate-50 transition">Отмена</button>
              <button onClick={save} className="px-4 py-2 text-xs font-medium rounded text-white hover:opacity-90 transition" style={{ background: '#1d4ed8' }}>
                {modal.isNew ? 'Создать' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {delId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDelId(null)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-80" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Удалить пользователя?</h3>
            <p className="text-xs text-slate-500 mb-5">Учётная запись будет удалена без возможности восстановления.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDelId(null)} className="px-4 py-2 text-xs font-medium rounded border border-slate-200 text-slate-700 hover:bg-slate-50 transition">Отмена</button>
              <button onClick={del} className="px-4 py-2 text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 transition">Удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
