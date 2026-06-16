import { z } from 'zod';

const REQUIRED_MESSAGE = 'Обязательно для заполнения';

export const stageFormSchema = z.object({
    stageName: z
        .string()
        .min(1, REQUIRED_MESSAGE)
        .max(50, 'Слишком длинное название'),
    stageDescription: z
        .string()
        .min(1, REQUIRED_MESSAGE)
        .max(50, 'Слишком длинное название'),
    stageWorkshopId: z.string().min(1, REQUIRED_MESSAGE),
});

export type StageFormSchema = z.infer<typeof stageFormSchema>;
export type StageDefaultFormSchema = Partial<StageFormSchema>;
export const STAGE_DEFAULT_VALUES = {
    stageName: '',
    stageDescription: '',
    stageWorkshopId: '',
};
