import { CreateZakazDto, Zakaz, UpdateZakazDto } from '@/lib/types';
import { api } from '..';
import { AxiosResponse } from 'axios';

export function getAllZakazs(): Promise<AxiosResponse<Zakaz[]>> {
    return api.get('/zakaz');
}

export function getOneZakaz(id: number) {
    return api.get(`/zakaz/${id}`);
}

export function createZakaz(dto: CreateZakazDto) {
    return api.post('/zakaz/', JSON.stringify(dto));
}

export function updateZakaz(id: number, dto: UpdateZakazDto) {
    return api.patch(`/zakaz/${id}`, JSON.stringify(dto));
}

export function deleteZakaz(id: number) {
    return api.delete(`/zakaz/${id}`);
}

export function cancelZakaz(id: number) {
    return api.put(`/zakaz/${id}/cancel`);
}

export function finishZakaz(id: number) {
    return api.put(`/zakaz/${id}/complete`);
}

export function updateStatusZakaz(id: number, status: number) {
    return api.put(`/zakaz/${id}/status/${status}`);
}

export function updateStageZakaz(id: number, stage: number) {
    return api.put(`/zakaz/${id}/stage/${stage}`);
}
