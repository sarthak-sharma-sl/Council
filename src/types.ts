export type House = 'ARYABHATT' | 'BOSE' | 'KALAM' | 'RAMAN' | 'CORE COUNCIL' | string;

export interface Student {
  id: string;
  name: string;
  class: string;
  house: House;
  post: string;
  assignedFloorId?: string; // floor id or undefined
  isSpecificallyAssigned: boolean; // if explicitly assigned by individual check/select
}

export interface Floor {
  id: string;
  name: string;
  order: number;
}

export interface FilterOptions {
  searchQuery: string;
  floorFilter: string; // 'ALL' | 'UNASSIGNED' | floorId
  designationFilter: string; // 'ALL' | 'PREFECT' | 'CAPTAIN' | 'HEAD' | 'INCHARGE'
  houseFilter: string; // 'ALL' | houseName
}
