export interface AssignModel {
	id: string;
	issueNo: string;
	currentStep: string;
	team: string;
	ownerId: string;
	name: string;
	email: string;
	requestContent: string;
	actionResult: string;
	actionContent: string;
	actionDate: Date;
	assignedDate: Date;
	deadLine: Date;
	deadLevel: number;
	status: string;
	remark: string;
	scheduleDeadLine: string;
	updatedBy: string;
	updatedDate: Date;
}

export interface ExtendDLModel {
	id: string;
	assignNo: string;
	currentDeadLine: Date;
	requestDeadLine: Date;
	reason: string;
	approvalContent: string;
	status: string;
	requestDate: Date;
	approvalDate: Date;
}