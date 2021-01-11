import { Observable } from 'rxjs';

export interface CountryShipModel {
    id: string;
    hmdShipToCode: string;
    hmdShipToParty: string;
    shipToCountryCode: string;
    shipToCountryName: string;
    updatedBy: string;
    updatedDate: Date;
    remarkCountry?: string;
}

export abstract class CountryShipData {
    abstract getAllCountryShip(): Observable<CountryShipModel>;
}