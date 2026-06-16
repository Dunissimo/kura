import { z } from 'zod';

const REQUIRED_MESSAGE = 'Обязательно для заполнения';

export const workshopFormSchema = z.object({
    workshopName: z
        .string()
        .min(1, REQUIRED_MESSAGE)
        .max(50, 'Слишком длинное название'),
    workshopMaxLoad: z
        .string()
        .min(1, REQUIRED_MESSAGE)
        .regex(/^\d+$/, { message: 'Допустимы только цифры' }),
});

export type WorkshopFormSchema = z.infer<typeof workshopFormSchema>;
export type WorkshopDefaultFormSchema = Partial<WorkshopFormSchema>;
export const WORKSHOP_DEFAULT_VALUES = {
    workshopName: '',
    workshopMaxLoad: '',
};
