import { CreateWorkshopDto, Workshop, UpdateWorkshopDto } from '../../lib/types';
import { api } from '..';
import { AxiosResponse } from 'axios';

export function getAllWorkshops(): Promise<AxiosResponse<Workshop[]>> {
    return api.get('/workshop');
}

export function getOneWorkshop(id: number) {
    return api.get(`/workshop/${id}`);
}

export function createWorkshop(dto: CreateWorkshopDto) {
    return api.post('/workshop', dto);
}

export function updateWorkshop(id: number, dto: UpdateWorkshopDto) {
    return api.patch(`/workshop/${id}`, dto);
}

export function deleteWorkshop(id: number) {
    return api.delete(`/workshop/${id}`);
}
