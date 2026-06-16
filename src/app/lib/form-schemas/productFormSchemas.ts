import { z } from 'zod';

const REQUIRED_MESSAGE = 'Обязательно для заполнения';

export const productFormSchema = z.object({
    productName: z
        .string()
        .min(1, REQUIRED_MESSAGE)
        .max(50, 'Слишком длинное название'),
});

export type ProductFormSchema = z.infer<typeof productFormSchema>;
export type ProductDefaultFormSchema = Partial<ProductFormSchema>;
export const PRODUCT_DEFAULT_VALUES = {
    productName: '',
};
