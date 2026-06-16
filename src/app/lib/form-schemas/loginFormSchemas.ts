import { z } from 'zod';

const REQUIRED_MESSAGE = 'Обязательно для заполнения';

export const loginFormSchema = z.object({
    username: z
        .string({ required_error: REQUIRED_MESSAGE })
        .min(1, REQUIRED_MESSAGE),
    password: z
        .string({ required_error: REQUIRED_MESSAGE })
        .min(1, REQUIRED_MESSAGE),
});

export type LoginFormSchema = z.infer<typeof loginFormSchema>;
export type LoginDefaultFormSchema = Partial<LoginFormSchema>;
export const LOGIN_DEFAULT_VALUES = {
    username: '',
    password: '',
};
