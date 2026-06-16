import { CreateStatusDto, Status, UpdateStatusDto } from '../../lib/types';
import { api } from '..';
import { AxiosResponse } from 'axios';

export function getAllStatuses(): Promise<AxiosResponse<Status[]>> {
    return api.get('/status');
}

export function getOneStatus(id: number) {
    return api.get(`/status/${id}`);
}

export function createStatus(dto: CreateStatusDto) {
    return api.post('/status/', JSON.stringify(dto));
}

export function updateStatus(id: number, dto: UpdateStatusDto) {
    return api.patch(`/status/${id}`, JSON.stringify(dto));
}

export function deleteStatus(id: number) {
    return api.delete(`/status/${id}`);
}
