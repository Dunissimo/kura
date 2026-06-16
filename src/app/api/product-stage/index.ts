import {
    CreateProductStageDto,
    ProductStage,
    UpdateProductStageDto,
} from '@/lib/types';
import { api } from '..';
import { AxiosResponse } from 'axios';

export function getAllProductStages(): Promise<AxiosResponse<ProductStage[]>> {
    return api.get('/product-stage');
}

export function getOneProductStage(id: number) {
    return api.get(`/product-stage/${id}`);
}

export function createProductStage(dto: CreateProductStageDto) {
    return api.post('/product-stage', JSON.stringify(dto));
}

export function updateProductStage(id: number, dto: UpdateProductStageDto) {
    return api.patch(`/product-stage/${id}`, JSON.stringify(dto));
}

export function deleteProductStage(id: number) {
    return api.delete(`/product-stage/${id}`);
}

export function mapProductStageData(data: ProductStage[]) {
    return data.map((ps) => ({
        idProductStages: ps.idProductStages,
        productName: ps.product.NameProduct,
        stageName: ps.stage.NameStages,
        sort: ps.sort,
        durationValue: ps.durationValue + ' мин',
    }));
}
