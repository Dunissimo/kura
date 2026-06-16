export type Role = 'admin' | 'dispatcher' | 'master' | 'manager';
export type Priority = 'low' | 'normal' | 'high' | 'critical';

export interface User {
  id: number;
  Name: string;
  Login: string;
  Password: string;
  Role: Role;
  department: string;
  email: string;
  phone: string;
  active: boolean;
}

export interface Status {
  id: number;
  name: string;
  color: string;
  code: string;
}

export interface Stage {
  id: number;
  name: string;
  workshopId: number;
  duration: number;
  order: number;
  description: string;
}

export interface Workshop {
  id: number;
  name: string;
  code: string;
  capacity: number;
}

export interface Order {
  id: number;
  number: string;
  product: string;
  quantity: number;
  statusId: number;
  priority: Priority;
  createdAt: string;
  deadline: string;
  managerId: number;
  workshopId: number;
  description: string;
}

export interface Process {
  id: number;
  orderId: number;
  stageId: number;
  statusId: number;
  workshopId: number;
  startDate: string;
  endDate: string;
  masterId: number;
  notes: string;
}

export const USERS: User[] = [
  { id: 1, Name: 'Иванов Алексей Петрович', Login: 'admin', Password: 'admin', Role: 'admin', department: 'ИТ-отдел', email: 'ivanov@mes.local', phone: '+7 (495) 123-45-67', active: true },
  { id: 2, Name: 'Петрова Мария Сергеевна', Login: 'dispatcher', Password: '1234', Role: 'dispatcher', department: 'Отдел планирования', email: 'petrova@mes.local', phone: '+7 (495) 234-56-78', active: true },
  { id: 3, Name: 'Сидоров Дмитрий Иванович', Login: 'master', Password: '1234', Role: 'master', department: 'Механический цех', email: 'sidorov@mes.local', phone: '+7 (495) 345-67-89', active: true },
  { id: 4, Name: 'Козлова Елена Николаевна', Login: 'manager', Password: '1234', Role: 'manager', department: 'Отдел продаж', email: 'kozlova@mes.local', phone: '+7 (495) 456-78-90', active: true },
  { id: 5, Name: 'Новиков Сергей Александрович', Login: 'master2', Password: '1234', Role: 'master', department: 'Сварочный цех', email: 'novikov@mes.local', phone: '+7 (495) 567-89-01', active: false },
  { id: 6, Name: 'Громов Виктор Павлович', Login: 'master3', Password: '1234', Role: 'master', department: 'ОТК', email: 'gromov@mes.local', phone: '+7 (495) 678-90-12', active: true },
];

export const STATUSES: Status[] = [
  { id: 1, name: 'В работе', color: '#3b82f6', code: 'IN_PROGRESS' },
  { id: 2, name: 'Ожидание', color: '#f59e0b', code: 'WAITING' },
  { id: 3, name: 'Выполнен', color: '#10b981', code: 'DONE' },
  { id: 4, name: 'Отменён', color: '#ef4444', code: 'CANCELLED' },
  { id: 5, name: 'Приостановлен', color: '#8b5cf6', code: 'PAUSED' },
  { id: 6, name: 'Новый', color: '#6b7280', code: 'NEW' },
];

export const WORKSHOPS: Workshop[] = [
  { id: 1, name: 'Механический цех', code: 'MECH', capacity: 8 },
  { id: 2, name: 'Сварочный цех', code: 'WELD', capacity: 6 },
  { id: 3, name: 'Покрасочный цех', code: 'PAINT', capacity: 4 },
  { id: 4, name: 'Сборочный цех', code: 'ASSY', capacity: 10 },
  { id: 5, name: 'ОТК', code: 'QC', capacity: 3 },
];

export const STAGES: Stage[] = [
  { id: 1, name: 'Заготовка', workshopId: 1, duration: 8, order: 1, description: 'Подготовка заготовок для дальнейшей обработки' },
  { id: 2, name: 'Фрезеровка', workshopId: 1, duration: 12, order: 2, description: 'Фрезерная обработка деталей' },
  { id: 3, name: 'Токарная обработка', workshopId: 1, duration: 16, order: 3, description: 'Токарная обработка на станках' },
  { id: 4, name: 'Сварка', workshopId: 2, duration: 10, order: 4, description: 'Сварочные операции на каркасах' },
  { id: 5, name: 'Окраска', workshopId: 3, duration: 6, order: 5, description: 'Покрасочные работы на изделиях' },
  { id: 6, name: 'Сборка', workshopId: 4, duration: 20, order: 6, description: 'Сборка узлов и агрегатов' },
  { id: 7, name: 'Контроль качества', workshopId: 5, duration: 4, order: 7, description: 'Проверка готовых изделий на соответствие' },
];

export const ORDERS: Order[] = [
  { id: 1, number: 'ЗАК-2401', product: 'Редуктор Р-250', quantity: 5, statusId: 1, priority: 'high', createdAt: '2024-01-10', deadline: '2024-02-15', managerId: 4, workshopId: 4, description: 'Редуктор для линии №3 АО "Металлург"' },
  { id: 2, number: 'ЗАК-2402', product: 'Вал приводной ∅60×1200', quantity: 12, statusId: 3, priority: 'normal', createdAt: '2024-01-12', deadline: '2024-01-28', managerId: 4, workshopId: 1, description: 'Приводной вал для ленточного конвейера' },
  { id: 3, number: 'ЗАК-2403', product: 'Корпус насоса НЦ-10', quantity: 3, statusId: 2, priority: 'critical', createdAt: '2024-01-15', deadline: '2024-02-05', managerId: 4, workshopId: 1, description: 'Срочный заказ для ремонтной службы' },
  { id: 4, number: 'ЗАК-2404', product: 'Шестерня коническая М8 Z=32', quantity: 20, statusId: 1, priority: 'normal', createdAt: '2024-01-18', deadline: '2024-03-01', managerId: 4, workshopId: 1, description: '' },
  { id: 5, number: 'ЗАК-2405', product: 'Фланец DN200 PN16', quantity: 8, statusId: 6, priority: 'low', createdAt: '2024-01-20', deadline: '2024-03-15', managerId: 4, workshopId: 2, description: 'Фланцы для трубопроводной системы' },
  { id: 6, number: 'ЗАК-2406', product: 'Муфта упругая МУ-1-50', quantity: 15, statusId: 4, priority: 'normal', createdAt: '2024-01-08', deadline: '2024-01-25', managerId: 4, workshopId: 4, description: 'Заказ отменён по решению заказчика' },
  { id: 7, number: 'ЗАК-2407', product: 'Подшипниковый узел УШ-310', quantity: 6, statusId: 5, priority: 'high', createdAt: '2024-01-22', deadline: '2024-02-20', managerId: 4, workshopId: 4, description: 'Приостановлен — ожидание материала' },
  { id: 8, number: 'ЗАК-2408', product: 'Корпус редуктора сварной', quantity: 2, statusId: 1, priority: 'high', createdAt: '2024-01-25', deadline: '2024-02-28', managerId: 4, workshopId: 2, description: '' },
  { id: 9, number: 'ЗАК-2409', product: 'Звёздочка цепная Z=25 t=19.05', quantity: 30, statusId: 3, priority: 'normal', createdAt: '2024-01-05', deadline: '2024-01-20', managerId: 4, workshopId: 1, description: '' },
  { id: 10, number: 'ЗАК-2410', product: 'Крышка подшипника ∅180', quantity: 40, statusId: 6, priority: 'low', createdAt: '2024-01-28', deadline: '2024-04-01', managerId: 4, workshopId: 1, description: '' },
  { id: 11, number: 'ЗАК-2411', product: 'Вал-шестерня ∅90', quantity: 4, statusId: 1, priority: 'critical', createdAt: '2024-01-29', deadline: '2024-02-12', managerId: 4, workshopId: 1, description: 'Для экстренного ремонта пресса №7' },
  { id: 12, number: 'ЗАК-2412', product: 'Плита монтажная 600×400×30', quantity: 1, statusId: 2, priority: 'normal', createdAt: '2024-01-30', deadline: '2024-03-10', managerId: 4, workshopId: 1, description: '' },
];

export const PROCESSES: Process[] = [
  { id: 1, orderId: 1, stageId: 1, statusId: 3, workshopId: 1, startDate: '2024-01-15', endDate: '2024-01-16', masterId: 3, notes: 'Заготовка выполнена в срок' },
  { id: 2, orderId: 1, stageId: 2, statusId: 3, workshopId: 1, startDate: '2024-01-17', endDate: '2024-01-19', masterId: 3, notes: '' },
  { id: 3, orderId: 1, stageId: 3, statusId: 1, workshopId: 1, startDate: '2024-01-22', endDate: '2024-01-26', masterId: 3, notes: 'В работе у Смирнова В.К.' },
  { id: 4, orderId: 2, stageId: 1, statusId: 3, workshopId: 1, startDate: '2024-01-13', endDate: '2024-01-13', masterId: 3, notes: '' },
  { id: 5, orderId: 2, stageId: 6, statusId: 3, workshopId: 4, startDate: '2024-01-18', endDate: '2024-01-25', masterId: 3, notes: '' },
  { id: 6, orderId: 2, stageId: 7, statusId: 3, workshopId: 5, startDate: '2024-01-26', endDate: '2024-01-27', masterId: 6, notes: 'Прошёл ОТК без замечаний' },
  { id: 7, orderId: 3, stageId: 1, statusId: 3, workshopId: 1, startDate: '2024-01-16', endDate: '2024-01-17', masterId: 3, notes: '' },
  { id: 8, orderId: 3, stageId: 2, statusId: 2, workshopId: 1, startDate: '2024-01-20', endDate: '2024-01-24', masterId: 3, notes: 'Ожидает очереди на станке 4К20' },
  { id: 9, orderId: 4, stageId: 2, statusId: 1, workshopId: 1, startDate: '2024-01-20', endDate: '2024-01-28', masterId: 3, notes: '' },
  { id: 10, orderId: 11, stageId: 3, statusId: 1, workshopId: 1, startDate: '2024-01-30', endDate: '2024-02-05', masterId: 3, notes: 'Приоритет — срочно!' },
  { id: 11, orderId: 8, stageId: 4, statusId: 1, workshopId: 2, startDate: '2024-01-26', endDate: '2024-02-01', masterId: 5, notes: '' },
  { id: 12, orderId: 9, stageId: 7, statusId: 3, workshopId: 5, startDate: '2024-01-19', endDate: '2024-01-20', masterId: 6, notes: 'Сдан на склад' },
];
