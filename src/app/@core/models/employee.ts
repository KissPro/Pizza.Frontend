export interface Employee {
    ad_user_givenName: string;
    ad_user_sn: string;
    id: number;
    name: string;
    display_name: string;
    sAMAccountName: string;
    employee_id: string;
    work_email: string;
    access_token: string;
    department: any[];
    departmentName: string;
}

export interface EmployeeRole {
    listRole: string[];
    token: string;
}

export interface EmployeeModel {
   employee: Employee[];
}
