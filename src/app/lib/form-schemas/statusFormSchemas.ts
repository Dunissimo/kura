import { z } from 'zod';

const REQUIRED_MESSAGE = 'Обязательно для заполнения';

export const statusFormSchema = z.object({
    statusName: z
        .string({ required_error: REQUIRED_MESSAGE })
        .min(1, 'Введите название этапа'),
});

export type StatusFormSchema = z.infer<typeof statusFormSchema>;
export type StatusDefaultFormSchema = Partial<StatusFormSchema>;
export const STATUS_DEFAULT_VALUES = {
    statusName: '',
};
