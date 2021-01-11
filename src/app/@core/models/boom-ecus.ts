import { Observable } from 'rxjs';
import { DataTablesResponse } from './datatables';

export interface BoomEcusModel {
    maHS: number;
    quantity: number;
    donGiaHD: number;
    country: number;
    soTk: number;
    ngayDk: Date;
    parentMaterial: string;
    sortString: string;
    altGroup: string;
    plant: string;
    tenHang: string;
    level: string;
    item: string;
}

export abstract class BoomEcusData {
abstract getBoomEcus(dtParameter: any): Observable<DataTablesResponse>;
}
