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

export interface EmployeeDetail {
    ad_user_displayName: string;
    ad_user_employeeID: string;
    ad_user_sAMAccountName: string;
    department_id: any[];
    id: number;
    job_title: string;
    name: string;
    parent_id: any[];
    work_email: string;
}

export interface EmployeeRole {
    listRole: string[];
    token: string;
}

export interface EmployeeModel {
   employee: Employee[];
   token: string;
}
