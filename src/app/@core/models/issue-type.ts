export interface OBAModel {
	id: string;
	issueId: string;
	detectingTime: Date;
	defectPart: string;
	defectName: string;
	defectType: string;
	samplingQty?: number;
	ngphoneOrdinal: string;
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
	ponsize: number;
	spcode: string;
	line: string;
	pattern: string;
	shift: string;
}

export interface ProcessModel {
	id: string;
	processName: string;
	refTable: string;
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