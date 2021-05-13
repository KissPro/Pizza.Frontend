export interface Employee {
    ad_user_givenName: string;
    ad_user_sn: string;
    id: number;
    name: string;
    username: string;
    display_name: string;
    sAMAccountName: string;
    employee_id: string;
    employee_type: string;
    work_email: string;
    email: string;
    access_token: string;
    department: any[];
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

export class EmployeeModel {
   employee: any;
   token: Token;
}

export class Token {
    refresh_token : any;
    expires_in : any;
    token_type : any;
    access_token : any;
}