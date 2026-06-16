import { ProductFormSchema } from './form-schemas/productFormSchemas';
import { StageFormSchema } from './form-schemas/stageFormSchemas';
import { StatusFormSchema } from './form-schemas/statusFormSchemas';
import { WorkshopFormSchema } from './form-schemas/WorkshopFormSchemas';
import { ZakazFormSchema } from './form-schemas/zakazFormSchemas';
import { ProductStageFormSchema } from './form-schemas/productStageFormSchemas';
import { UserFormSchema } from './form-schemas/userSchema';
import { Role } from '../data';

export interface Status {
    idStatus: number;
    StatusName: string;
    StatusColor: string;
    StatusCode: string;
}

export type CreateStatusDto = Omit<Status, 'idStatus'>;
export type UpdateStatusDto = Partial<CreateStatusDto>;

export interface Stage {
    idStages: number;
    NameStages: string;
    DescriptionStages: string;
    Workshop: Workshop;
}

export type CreateStageDto = Omit<Stage, 'idStages'>;
export type UpdateStageDto = Partial<CreateStageDto>;

export interface Zakaz {
    idZakaz: number;
    productId: number;
    product: Product;
    stageId: number;
    stage: Stage;
    statusId: number;
    status: Status;
    zakazQuantity: number;
    zakazCreated: Date;
    zakazCompleted: Date | null;
    For: string;
    Comment: string;
    isCancelled: boolean;
    isFinished: boolean;
}

export type CreateZakazDto = Zakaz;
export type UpdateZakazDto = Partial<CreateZakazDto>;

export interface Workshop {
    idWorkshop: number;
    NameWS: string;
    CurrentLoadWS: number;
    MaxLoadWS: number;
    CodeWS: string;
}

export type CreateWorkshopDto = Omit<Workshop, 'idWorkshop'>;
export type UpdateWorkshopDto = Partial<CreateWorkshopDto>;

export interface Product {
    idProduct: number;
    NameProduct: string;
}

export type CreateProductDto = Product;
export type UpdateProductDto = Partial<CreateProductDto>;

export interface Duration {
    id: number;
    name: string;
}

export interface User {
    idUser: number;
    Name: string;
    Login: string;
    Role: Role;
    Password: string;
    department: string;
    email: string;
    phone: string;
    active: boolean;
}

type Optional<T, K extends keyof T> =
  Omit<T, K> & Partial<Pick<T, K>>;

export type CreateUserDto = Optional<
  Pick<User, 'Name' | 'Login' | 'Password' | 'Role' | 'active' | 'email' | 'phone'>,
  'email' | 'phone'
>;  
export type UpdateUserDto = Partial<CreateUserDto>;

export interface ProductStage {
    idProductStages: number;
    productId: number;
    product: Product;
    stageId: number;
    stage: Stage;
    sort: number;
    durationId: number;
    duration: Duration;
    durationValue: number;
}

export type CreateProductStageDto = Omit<ProductStage, 'idProductStages'>;
export type UpdateProductStageDto = Partial<CreateProductStageDto>;

export type Item =
    | Status
    | Stage
    | Zakaz
    | Workshop
    | Product
    | ProductStage
    | User;
export type FormSchema =
    | StageFormSchema
    | StatusFormSchema
    | ZakazFormSchema
    | WorkshopFormSchema
    | ProductFormSchema
    | ProductStageFormSchema
    | UserFormSchema;

export type ItemType =
    | 'zakaz'
    | 'status'
    | 'stage'
    | 'workshop'
    | 'product'
    | 'product-stage'
    | 'user';

export interface LoginDto {
    username: string;
    password: string;
}
