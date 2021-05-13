import { Observable } from 'rxjs';

export interface ConfigModel {
    id: string;
    name: string;
    value: string;
    updatedBy: string;
    updateDate: Date | null;
    dropListRemark?: string;
}
export abstract class ConfigData {
    abstract getAllConfig(): Observable<ConfigModel[]>;
}
