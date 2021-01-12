import { Observable } from 'rxjs';
import { DataTablesResponse } from './datatables';

export interface IssueModel {
	id: string;
	processType: string;
	issueNo: string;
	title: string;
	rpn: number;
	severity: string;
	repeateddSymptom?: any;
	failureDesc?: any;
	fileAttack?: any;
	notifiedList?: any;
	issueStatus: string;
	currentStep: string;
	stepStatus: string;
	containmentAction?: any;
	analysisDetail?: any;
	recommendedAction?: any;
	escapeCause?: any;
	capadetail?: any;
	verifyNote?: any;
}

export abstract class IssueData {
	abstract getIssue(dtParameter: any): Observable<DataTablesResponse>;
	}


