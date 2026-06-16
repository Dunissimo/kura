import { z } from 'zod';

const REQUIRED_MESSAGE = 'Обязательно для заполнения';

export const userFormSchema = z.object({
    name: z.string().min(1, REQUIRED_MESSAGE),
    login: z.string().min(1, REQUIRED_MESSAGE),
    password: z.string().min(1, REQUIRED_MESSAGE),
});

export type UserFormSchema = z.infer<typeof userFormSchema>;
export type UserDefaultFormSchema = Partial<UserFormSchema>;
export const USER_DEFAULT_VALUES = {
    name: '',
    password: '',
};
