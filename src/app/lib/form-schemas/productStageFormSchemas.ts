import { z } from 'zod';

const REQUIRED_MESSAGE = 'Обязательно для заполнения';

export const productStageFormSchema = z.object({
    productId: z
        .string({ required_error: REQUIRED_MESSAGE })
        .min(1, REQUIRED_MESSAGE),
    stageId: z
        .string({ required_error: REQUIRED_MESSAGE })
        .min(1, REQUIRED_MESSAGE),
    sort: z
        .string()
        .min(1, REQUIRED_MESSAGE)
        .regex(/^\d+$/, { message: 'Допустимы только цифры' }),
    durationValue: z
        .string()
        .min(1, REQUIRED_MESSAGE)
        .regex(/^\d+$/, { message: 'Допустимы только цифры' }),
});

export type ProductStageFormSchema = z.infer<typeof productStageFormSchema>;
export type ProductStageDefaultFormSchema = Partial<ProductStageFormSchema>;
export const PRODUCT_STAGE_DEFAULT_VALUES = {
    productId: '',
    stageId: '',
    sort: '',
    durationValue: '',
};
