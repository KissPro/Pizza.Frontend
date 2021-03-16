export interface ApprovalModel {
	id: string;
	issueNo: string;
	approverId: string;
	team: string;
	action: string;
	approverRemark: string;
	updatedBy: string;
	updatedDate?: Date;
}

export interface ApprovalDialogModel {
	status: number;
	remark: string;
}