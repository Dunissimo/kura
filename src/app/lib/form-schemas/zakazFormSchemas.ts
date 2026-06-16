import { z } from 'zod';

const REQUIRED_MESSAGE = 'Обязательно для заполнения';

export const zakazFormSchema = z.object({
    productId: z.string().min(1, REQUIRED_MESSAGE),
    zakazQuantity: z
        .string()
        .min(1, REQUIRED_MESSAGE)
        .regex(/^\d+$/, { message: 'Допустимы только цифры' }),
    for: z
        .string()
        .min(1, REQUIRED_MESSAGE)
        .max(50, 'Слишком длинное название'),
    comment: z.string().max(50, 'Слишком длинное название').default(''),
});

export type ZakazFormSchema = z.infer<typeof zakazFormSchema>;
export type ZakazDefaultFormSchema = Partial<ZakazFormSchema>;
export const ZAKAZ_DEFAULT_VALUES = {
    productId: '',
    zakazQuantity: '',
    for: '',
    comment: '',
};
