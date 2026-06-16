import { Product, CreateProductDto, UpdateProductDto } from '@/lib/types';
import { api } from '..';
import { AxiosResponse } from 'axios';

export function getAllProducts(): Promise<AxiosResponse<Product[]>> {
    return api.get('/product');
}

export function getOneProduct(id: number) {
    return api.get(`/product/${id}`);
}

export function getProductStages(id: number) {
    return api.get(`/product/${id}/stages`);
}

export function createProduct(dto: CreateProductDto) {
    return api.post('/product/', JSON.stringify(dto));
}

export function updateProduct(id: number, dto: UpdateProductDto) {
    return api.patch(`/product/${id}`, JSON.stringify(dto));
}

export function deleteProduct(id: number) {
    return api.delete(`/product/${id}`);
}

export function mapProductData(data: Product[]) {
    return data.map((product) => ({
        idProduct: product.idProduct,
        productName: product.NameProduct,
    }));
}
