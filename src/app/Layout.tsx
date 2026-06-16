import { NavLink, Outlet, useNavigate } from 'react-router';
import {
  LayoutDashboard, ClipboardList, Cog, CalendarDays, BarChart3,
  Database, Users, LogOut, ChevronRight, Factory, Shield
} from 'lucide-react';
import { useApp } from './store';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Администратор',
  dispatcher: 'Диспетчер',
  master: 'Мастер',
  manager: 'Менеджер',
};

const NAV_ITEMS = [
  { to: '/', label: 'Дашборд', icon: LayoutDashboard, roles: ['admin', 'dispatcher', 'master', 'manager'] },
  { to: '/orders', label: 'Заказы', icon: ClipboardList, roles: ['admin', 'dispatcher', 'manager'] },
  // { to: '/processes', label: 'Процессы', icon: Cog, roles: ['admin', 'dispatcher', 'master'] },
  // { to: '/planning', label: 'Расписание', icon: CalendarDays, roles: ['admin', 'dispatcher'] },
  { to: '/load', label: 'Загрузка цехов', icon: BarChart3, roles: ['admin', 'dispatcher', 'master'] },
  { to: '/references', label: 'Справочники', icon: Database, roles: ['admin', 'dispatcher'] },
  { to: '/users', label: 'Пользователи', icon: Users, roles: ['admin'] },
];

export default function Layout() {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleNav = NAV_ITEMS.filter(item => user && item.roles.includes(user.Role));

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col" style={{ background: 'var(--sidebar)', borderRight: '1px solid var(--sidebar-border)' }}>
        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-0.5">
            {visibleNav.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors group relative ${
                      isActive
                        ? 'text-white'
                        : 'hover:text-white'
                    }`
                  }
                  style={({ isActive }) => ({
                    background: isActive ? 'var(--sidebar-accent)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--sidebar-foreground)',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full" style={{ background: 'var(--sidebar-primary)' }} />
                      )}
                      <Icon size={15} style={{ opacity: isActive ? 1 : 0.6 }} />
                      <span>{label}</span>
                      {isActive && <ChevronRight size={12} className="ml-auto opacity-40" />}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User footer */}
        <div className="px-3 py-3 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
          <div className="flex items-center gap-3 px-2 py-2 rounded" style={{ background: 'var(--sidebar-accent)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
              style={{ background: 'var(--sidebar-primary)' }}>
              {user?.Name?.split(' ').slice(0, 2).map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white truncate">{user?.Name?.split(' ').slice(0, 2).join(' ')}</div>
              <div className="text-xs truncate flex items-center gap-1" style={{ color: 'var(--sidebar-foreground)', opacity: 0.5 }}>
                <Shield size={9} />
                {ROLE_LABELS[user?.Role ?? '']}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="cursor-pointer text-xs p-1 rounded transition-colors hover:text-white flex-shrink-0"
              style={{ color: 'var(--sidebar-foreground)' }}
              title="Выйти"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-background">
        <Outlet />
      </main>
    </div>
  );
}
