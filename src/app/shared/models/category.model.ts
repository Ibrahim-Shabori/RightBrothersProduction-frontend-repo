import { RequestType } from './request.model';

export interface CreateCategoryDto {
  name: string;
  color: string;
  type: RequestType;
}
