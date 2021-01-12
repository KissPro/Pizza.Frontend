export interface OBAModel {
	id: string;
	issueId: string;
	detectingTime: string;
	defectPart: string;
	defectName: string;
	defectType: string;
	samplingQty: number | null;
	ngphoneOrdinal: string;
}

export interface ITModel {
	id: string;
	issueId: string;
	startTime: string | null;
	endTime: string | null;
	customerService: string;
}

export interface ProductModel {
	id: string;
	issueId: string;
	imei: string;
	custormer: string;
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
	updateDate: string | null;
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
	date: string | null;
}