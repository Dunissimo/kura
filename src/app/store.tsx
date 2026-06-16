import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, USERS, ORDERS, PROCESSES, STATUSES, STAGES, WORKSHOPS, Order, Process, Status, Stage, Workshop, Priority } from './data';
import { signIn } from './api/auth';
import { getAllUsers } from './api/user';
import { getAllStatuses } from './api/status';
import { getAllWorkshops } from './api/workshop';
import { getAllStages } from './api/stage';
import { getAllZakazs } from './api/zakaz';

interface AppState {
  user: User | null;
  login: (login: string, password: string) => Promise<any>;
  logout: () => void;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  processes: Process[];
  setProcesses: React.Dispatch<React.SetStateAction<Process[]>>;
  statuses: Status[];
  setStatuses: React.Dispatch<React.SetStateAction<Status[]>>;
  stages: Stage[];
  setStages: React.Dispatch<React.SetStateAction<Stage[]>>;
  workshops: Workshop[];
  setWorkshops: React.Dispatch<React.SetStateAction<Workshop[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  nextId: () => number;
  loadUsers: () => Promise<void>;
  loadStatuses: () => Promise<void>;
  loadWorkshops: () => Promise<void>;
  loadStages: () => Promise<void>;
  loadOrders: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

let _nextId = 1000;

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    } catch {
        return null;
    }
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const login = async (loginStr: string, password: string) => {
    try {
      const requestResult = await signIn({username: loginStr, password});

      if (requestResult.status !== 200) {
        return {
          message: 'Что-то пошло не так',
          status: false,
        };
      }
      
      const apiUser = requestResult.data.user;

      setUser(apiUser);
      localStorage.setItem('user', JSON.stringify(apiUser));
      return {
        status: true,
      }; 
    } catch (error) {
      return {
        message: (error as any).response.data.message,
        status: false,
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };
  const nextId = () => ++_nextId;

  const loadUsers = async () => {
    try {
      const requestResult = await getAllUsers();

      const mapped = requestResult.data.map((u: any) => ({
        ...u,
        id: u.id ?? u.idUser ?? u.userId ?? nextId(),
      }));

      setUsers(mapped as any);
    } catch (error) {
      alert('Что-то пошло не так');
    }
  };
  
  const loadOrders = async () => {
    try {
      const requestResult = await getAllZakazs();
      const res = requestResult.data.map((item: any) => ({
        id: item.idZakaz,
        number: item.For ?? `ЗАК-${item.idZakaz}`,
        product: item.productName ?? item.product?.NameProduct ?? '',
        quantity: item.zakazQuantity ?? 0,
        statusId: item.statusId ?? item.status?.idStatus ?? 0,
        priority: (item.priority ?? 'normal') as Priority,
        createdAt: item.zakazCreated ? new Date(item.zakazCreated).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        deadline: item.deadline ? new Date(item.deadline).toISOString().slice(0, 10) : '',
        managerId: item.managerId ?? 4,
        workshopId: item.workshopId ?? 0,
        description: item.Comment ?? '',
      }));
      setOrders(res);
    } catch (error) {
      alert('Что-то пошло не так');
    }
  };
  
  const loadStatuses = async () => {
    try {
      const requestResult = await getAllStatuses();

      const res = requestResult.data.map((status) => ({
        id: status.idStatus,
        name: status.StatusName,
        color: status.StatusColor,
        code: status.StatusCode,
      }));

      setStatuses(res);
    } catch (error) {
      alert('Что-то пошло не так');
    }
  };

  const loadWorkshops = async () => {
    try {
      const requestResult = await getAllWorkshops();

      const res = requestResult.data.map((item) => ({
        id: item.idWorkshop,
        name: item.NameWS,
        code: item.CodeWS,
        capacity: item.MaxLoadWS,
      }));

      setWorkshops(res);
    } catch (error) {
      alert('Что-то пошло не так');
    }
  };

  const loadStages = async () => {
    try {
      const requestResult = await getAllStages();

      const res = requestResult.data.map((item) => {
        const stageAny = item as any;
        return {
          id: item.idStages,
          name: item.NameStages,
          duration: stageAny.DurationStages ?? stageAny.DurationStages ?? 0,
          order: stageAny.OrderStages ?? stageAny.OrderStages ?? 0,
          description: item.DescriptionStages,
          workshopId: item.Workshop?.idWorkshop ?? 0,
        };
      });

      setStages(res);
    } catch (error) {
      alert('Что-то пошло не так');
    }
  };

  useEffect(() => {
    loadUsers();
    loadStatuses();
    loadWorkshops();
    loadStages();
    loadOrders();
  }, []);

  return (
    <AppContext.Provider value={{
      user, login, logout,
      orders, setOrders,
      processes, setProcesses,
      statuses, setStatuses,
      stages, setStages,
      workshops, setWorkshops,
      users, setUsers,
      nextId,
      loadUsers,
      loadOrders,
      loadStatuses,
      loadWorkshops,
      loadStages,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
