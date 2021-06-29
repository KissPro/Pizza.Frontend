export interface OBAModel {
	id: string;
	issueId: string;
	detectingTime: Date;
	defectPart: string;
	defectName: string;
	defectType: string;
	samplingQty?: number;
	ngphoneOrdinal: string; // failure quantity
	supervisor?: string;
	auditor?: string;
	detectBy?: string;
	howToDetect?: string;
	failureValidate?: string;
	createDate?: Date;
	updatedDate?: Date;
}

export interface IMEIModel {
	imei: string;
	psn: string;
	customer: string;
	pid: string;
	product: string;
	ponno: string;
	ponsize: number;
	spcode: string;
	line: string;
	shift: string;
}

export interface OBAIssueModel {
	auditor?: any,
	createD_DATE?: any,
	faiL_DESC?: any,
	faiL_DESC2?: any,
	failurE_CLASSIFICATION_CODE?: any,
	failurE_CLASSIFICATION_DESC?: any,
	failurE_COMPONENT_CODE?: any,
	failurE_COMPONENT_DESC?: any,
	failurE_MODE_CODE?: any,
	failurE_MODE_DESC?: any,
	family?: any,
	fileName?: any,
	flaG9?: any,
	flag?: any,
	id?: any,
	line?: any,
	pid?: any,
	pointS_ID?: any,
	status?: any,
	supervisor?: any,
	unlocker?: any,
	updateD_DATE?: any,
	url?: any,
}

export interface OBAIssueFilterModel {
	factory?: any;
	npi?: any;
	date?: Date;
}

export interface ITModel {
	id: string;
	issueId: string;
	startTime: Date | null;
	endTime: Date | null;
	customerService: string;
}

export interface MailModel {
	name: string;
	empId: string;
	email: string;
	team: string;
}

export interface ProductModel {
	id: string;
	issueId: string;
	imei: string;
	customer: string;
	product: string;
	psn: string;
	ponno: number;
	ponsize?: number;
	spcode: string;
	line: string;
	pattern: string;
	shift: string;
}

export interface TeamFormationModel {
	empId: string;
	name: string;
	email: string;
	team: string;
	position: string;
}

export interface ProcessModel {
	id: string;
	processName: string;
	refTable: string;
	approverId_Lv1: string;
	approverId_Lv2: string;
	updatedBy: string;
	updateDate: Date | null;
	processRemark: string;
}

export interface ScraptCostModel {
	id: string;
	issueId: string;
	partName: string;
	scapQty: number | null;
	scapCost: number | null;
}

export interface VerificationModel {
	id: string;
	issueId: string;
	ponno: string;
	size: number | null;
	ngqty: number | null;
	ngrate: string;
	judgment: string;
	date: Date | null;
}
export interface UploadFileModel {
	id: string;
	issueId: string;
	currentStep: string;
	type: string;
	name: string;
	url: string;
	remark: string;
	uploadedBy: string;
	uploadedDate: Date | null;
}