import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FormSchema, Item } from './types';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
    const newDate = new Date(date);
    return newDate.toLocaleDateString('ru-RU', {});
}

const idMaps = {
    status: 'idStatus',
    zakaz: 'idZakaz',
    stage: 'idStages',
    workshop: 'idWorkshop',
    product: 'idProduct',
    'product-stage': 'idProductStages',
    user: 'id',
};

export function getId(itemName: string, item: Item) {
    const idKey = idMaps[itemName as keyof typeof idMaps] as keyof Item;

    return item[idKey];
}

export function transformDataForSend(values: FormSchema) {
    if ('stageName' in values) {
        return {
            NameStages: values.stageName,
            DescriptionStages: values.stageDescription,
            WorkshopId: values.stageWorkshopId,
        };
    } else if ('statusName' in values) {
        return {
            StatusName: values.statusName,
        };
    } else if ('zakazQuantity' in values) {
        return {
            productId: Number(values.productId),
            zakazQuantity: Number(values.zakazQuantity),
            For: values.for,
            Comment: values.comment,
        };
    } else if ('workshopName' in values) {
        return {
            NameWS: values.workshopName,
            MaxLoadWS: values.workshopMaxLoad,
        };
    } else if ('productName' in values) {
        return {
            NameProduct: values.productName,
        };
    } else if ('durationValue' in values) {
        return {
            productId: Number(values.productId),
            stageId: Number(values.stageId),
            sort: Number(values.sort),
            durationId: 2,
            durationValue: Number(values.durationValue),
        };
    } else if ('password' in values) {
        return {
            Name: values.name,
            Password: values.password,
            Login: values.login,
        };
    }
}

export function transformDataForEdit(item: Item) {
    if ('idStages' in item) {
        return {
            stageName: item.NameStages || '',
            stageDescription: item.DescriptionStages || '',
            stageWorkshopId: String(item.Workshop?.idWorkshop) || '',
        };
    } else if ('idStatus' in item) {
        return {
            statusName: item.StatusName || '',
        };
    } else if ('idZakaz' in item) {
        return {
            for: item.For || '',
            comment: item.Comment || '',
            productId: String(item.productId) || '',
            zakazQuantity: String(item.zakazQuantity) || '',
        };
    } else if ('idWorkshop' in item) {
        return {
            workshopName: item.NameWS || '',
            workshopMaxLoad: item.MaxLoadWS || '',
        };
    } else if ('idProduct' in item) {
        return {
            productName: item.NameProduct || '',
        };
    } else if ('productId' in item && 'stageId' in item) {
        return {
            productId: String(item.productId) || '',
            stageId: String(item.stageId) || '',
            sort: String(item.sort) || '',
            durationValue: String(item.durationValue) || '',
        };
    } else if ('idUser' in item) {
        return {
            name: item.Name,
            login: item.Login,
        };
    }
}
