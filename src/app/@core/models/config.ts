import { Observable } from 'rxjs';

export interface ConfigModel {
    id: string;
    key: string;
    value: string;
    updatedBy: string;
    updatedDate: Date;
    remarkConfig?: string;
}
export abstract class ConfigData {
    abstract getAllConfig(): Observable<ConfigModel>;
}
