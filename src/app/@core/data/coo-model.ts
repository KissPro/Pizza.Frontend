import { Observable } from 'rxjs';

export interface COOModel {
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

export interface DataTablesResponse {
    data: COOModel[];
    draw: number;
    recordsFiltered: number;
    recordsTotal: number;
}

export abstract class COOData {
abstract postDatatables(dtParameter: any): Observable<any>;
}
