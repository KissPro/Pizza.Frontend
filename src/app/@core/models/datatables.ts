export interface DataTablesResponse {
    data: any[];
    draw: number;
    recordsFiltered: number;
    recordsTotal: number;
    pages: number;
    start: number;
    end: number;
}
