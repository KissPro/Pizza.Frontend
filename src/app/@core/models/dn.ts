import { Observable } from 'rxjs';
import { DataTablesResponse } from './datatables';

export interface DNModel {
    id: string;
    delivery: number;
    invoiceNo: number;
    materialParent: string;
    materialDesc: string;
    shipToCountry: string;
    partyName: string;
    customerInvoiceNo: number;
    saleUnit: string;
    actualGidate: Date;
    netValue: number;
    dnqty: number;
    netPrice: number;
    harmonizationCode?: string;
    address?: string;
    plant: string;
    planGidate: Date;
    planGisysDate: Date;
    insertedDate: Date;
    updatedDate?: Date;
    status?: number;
    shipToCountryName: string;
    hmdShipToCode: string;
}
export interface DNManualModel {
    id: string;
    deliverySalesId: string;
    coono: string;
    receiptDate?: Date;
    returnDate?: Date;
    cooform?: string;
    trackingNo?: string;
    courierDate?: Date;
    trackingDate?: Date;
    origin?: string;
    shipFrom: string;
    package: string;
    updatedBy?: string;
    updatedDate?: Date;
    remarkDs?: string;
    deliverySales: DNModel;
}

export abstract class DNData {
abstract getDN(dtParameter: any): Observable<DataTablesResponse>;
abstract getDNManual(dtParameter: any, type: string): Observable<DataTablesResponse>;
abstract getListDNCOO(cooNo: string): Observable<DNModel[]>;
}



