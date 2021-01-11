import { Observable } from 'rxjs';

export interface PlantModel {
    id: string;
    plant: string;
    updatedBy: string;
    updatedDate: string;
    remarkPlant?: any;
}

export abstract class PlantData {
    abstract getAllPlant(): Observable<PlantModel>;
}
