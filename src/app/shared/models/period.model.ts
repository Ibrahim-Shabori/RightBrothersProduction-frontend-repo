export enum QueryPeriod {
  All,
  LastDay,
  LastWeek,
  LastMonth,
  Last6Months,
  LastYear,
}
interface QueryParameters {
  pageNumber: number;
  pageSize: number;
  sortField: string | null | string[] | undefined;
  sortOrder: number | null | undefined;
  filter: string | undefined;
}
export interface RequestQueryParameters extends QueryParameters {
  types: number[] | null;
}

export interface RequestManagementQueryParameters extends QueryParameters {
  period: QueryPeriod;
}

export interface UserManagementQueryParameters extends QueryParameters {
  isActive: boolean | null;
  usersType: 'Users' | 'Admins';
}

export interface StatDto {
  count: number;
  changePercentage: number;
  increased: boolean;
}

export interface ChartDataPoint {
  label: string;
  madeValue: number;
  doneValue: number;
}
