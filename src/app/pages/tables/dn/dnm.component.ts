import {
    AfterViewInit, Component, EventEmitter, OnChanges, OnDestroy,
    OnInit, Output, SimpleChanges, TemplateRef, ViewChild,
} from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import {
    FormControl, FormsModule, FormGroup,
    FormBuilder, Validators,
} from '@angular/forms'; // FormGroup have multiple FormControls
import { format, compareAsc } from 'date-fns';
import { DNManualModel, DNModel } from 'app/@core/models/dn';
import { DNService } from 'app/@core/service/dn.service';
import { Input } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { DialogUploadFileComponent } from 'app/pages/modal-overlays/dialog/dialog-upload-file/dialog-upload-file.component';
import { UploadService } from 'app/@core/service/upload-file.service';
import { nullSafeIsEquivalent } from '@angular/compiler/src/output/output_ast';
import { AuthenticationService } from 'app/@core/service/authentication.service';
import { GuidService } from 'app/@core/service/guid.service';
import { ToastrComponent } from 'app/pages/modal-overlays/toastr/toastr.component';


@Component({
    selector: 'ngx-dnm',
    templateUrl: 'dnm.component.html',
    styles: ['.classButton { padding: 0 0 1rem 2rem; margin: 0; }'],
})
export class DNMComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
    @Input() changeValue: string;
    @Input() type: string;

    @Output() openCOO = new EventEmitter<any>();

    // Datatable parameter
    dtOptions: DataTables.Settings = {};
    @ViewChild(DataTableDirective, { static: false })
    dtElement: DataTableDirective;
    dtTrigger: Subject<any> = new Subject();

    // Variable
    dns: DNManualModel[];
    indexTable: number;

    selectedDN?: DNManualModel;
    listSelectDN: DNManualModel[] = [];

    alert = new ToastrComponent(this.toastrService);

    constructor(
        private dnService: DNService,
        private formBuilder: FormBuilder,
        private uploadService: UploadService,
        private authen: AuthenticationService,
        private toastrService: NbToastrService,
        private guidService: GuidService,
        private dialogService: NbDialogService,
    ) { }

    // When incoming table change (@Input change) - update coo table
    ngOnChanges(): void {
        if (this.changeValue !== undefined) {
            this.loadCOOTable();
            this.reloadCOOTable();
        }
    }

    ngOnInit(): void {
        this.loadCOOTable();
    }
    loadCOOTable() {
        this.dtOptions[1] = {
            pagingType: 'full_numbers',
            pageLength: 10,
            serverSide: true,
            processing: true,
            scrollX: true,
            autoWidth: true,
            scrollY: '62vh',
            order: [1, 'asc'],

            ajax: (dataTablesParameters: any, callback) => {
                this.dnService.getDNManual(dataTablesParameters, this.type)
                    .subscribe(resp => {
                        this.dns = resp.data;
                        this.indexTable = resp.start;
                        callback({
                            recordsTotal: resp.recordsTotal,
                            recordsFiltered: resp.recordsFiltered,
                            data: [],
                        });
                    });
            },
            columns: [
                { data: 'index' },
                { data: 'deliverySales.partyName' }, { data: 'deliverySales.shipToCountry' },
                { data: 'deliverySales.delivery' }, { data: 'deliverySales.invoiceNo' },
                { data: 'deliverySales.customerInvoiceNo' },
                { data: 'receiptDate' }, { data: 'coono' },
                { data: 'returnDate' }, { data: 'cooform' }, { data: 'trackingNo' },
                { data: 'trackingDate' }, { data: 'courierDate' },
                { data: 'shipFrom' }, { data: 'package' },
                { data: 'remarkDs' }, { data: 'updatedDate' }, 
            ],
            columnDefs: [
                { targets: 'no-sort', orderable: false },
            ],
        };
    }
    reloadCOOTable() {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.ajax.reload();
        });
    }

    ngAfterViewInit(): void {
        this.dtTrigger.next();
    }
    ngOnDestroy(): void {
        this.dtTrigger.unsubscribe();
    }

    // upload file
    uploadFile(): void {
        this.dialogService.open(DialogUploadFileComponent, {
            context: {
                type: 'COO Manual',
                templateName: 'DN_Manual_Template.xlsx',
                urlUpload: '/api/dn/import-excel',
            },
        }).onClose.subscribe(result => (result === 'success') ? this.reloadCOOTable() : null);
    }

    downloadManual() {
        this.dnService.DownloadManual(this.type)
            .subscribe(
                result => this.uploadService.ShowFile(result, 'Download_DN_Manual_' + new Date().toLocaleString()),
            );
    }

    removeManual() {
        this.dnService.removeManual(this.selectedDN)
            .subscribe(result => {
                console.log(result);
                this.alert.showToast('success', 'Success', 'Remove DN manual successfully!');
                this.reloadCOOTable();
            }
        );
    }

    // select row
    currentRow; // Hight light this line
    selectedRow(event, i, dn: DNManualModel) {
        if (this.currentRow !== i) {
            // add to list
            this.selectedDN = dn;
            this.currentRow = i; // hightlight
        } else {
            this.currentRow = undefined;
            this.selectedDN = undefined;
        }
    }

    openEdit(event, i, dn: DNManualModel, dialog: TemplateRef<any>) {
        this.selectedDN = dn;
        this.loadFormEdit();
        this.dialogService.open(
            dialog,
            { context: 'this is some additional data passed to dialog' });
    }

    // Form Angular Reative
    // Init form
    cooFormGroup: FormGroup = this.formBuilder.group({
        trackingNo: ['', [Validators.minLength(3)]],
        trackingDate: '',
        courierDate: '',
        receiptDate: '',
        returnDate: '',
        returnTime: '',
        cooform: '',
        shipFrom: ['', [Validators.required]],
        package: ['', [Validators.required]],
        remark: '',
    });


    loadFormEdit() {
        // set value form init
        this.cooFormGroup.patchValue({
            trackingNo: this.selectedDN.trackingNo,
            trackingDate: (this.selectedDN.trackingDate !== null) ? new Date(this.selectedDN.trackingDate) : null,
            courierDate: (this.selectedDN.courierDate !== null) ? new Date(this.selectedDN.courierDate) : null,
            receiptDate: (this.selectedDN.receiptDate !== null) ? new Date(this.selectedDN.receiptDate) : null,
            returnDate: (this.selectedDN.returnDate !== null) ? new Date(this.selectedDN.returnDate) : null,
            returnTime: (this.selectedDN.returnDate !== null) ? 
                format(new Date(this.selectedDN.returnDate), 'HH:mm') : null,
            cooform: this.selectedDN.cooform,
            shipFrom: this.selectedDN.shipFrom,
            package: this.selectedDN.package,
            remark: this.selectedDN.remarkDs,
        });
    }

    submitEdit(ref) {
        console.log(this.cooFormGroup.value);
        console.log(this.selectedDN);
        // Create ds manual
        // Validate return date
        let error: string = null;
        const returnDateTime = new Date(format(new Date(this.cooFormGroup.value.returnDate), 'yyyy/MM/dd') + ' '
            + this.cooFormGroup.value.returnTime);

        if (isNaN(returnDateTime.getDate()))
            error = 'Please check return time format!'
        if (error !== null) {
            this.alert.showToast('danger', 'Error', error);
            return;
        }
        const dsManual = {
            'id': this.guidService.getGuid(),
            'deliverySalesId': this.selectedDN.deliverySales.id,
            'coono': this.selectedDN.coono,
            'receiptDate': this.cooFormGroup.value.receiptDate,
            'returnDate': this.cooFormGroup.value.returnDate,
            'cooform': this.cooFormGroup.value.cooform,
            'trackingNo': this.cooFormGroup.value.trackingNo,
            'courierDate': this.cooFormGroup.value.courierDate,
            'trackingDate': this.cooFormGroup.value.trackingDate,
            'origin': 'VN',
            'shipFrom': this.cooFormGroup.value.shipFrom,
            'package': this.cooFormGroup.value.package,
            'updatedBy': this.authen.userName(),
            'updatedDate': new Date(),
            'remarkDs': this.cooFormGroup.value.remark,
            'deliverySales': this.selectedDN.deliverySales,
        };
        this.dnService.updateManual(dsManual)
            .subscribe(result => {
                this.alert.showToast('success', 'Success', 'Create country ship successfully!');
                this.loadCOOTable();
                this.reloadCOOTable();
                ref.close();
            });
    }

    openCOOCreated() {
        this.openCOO.emit(this.selectedDN);
    }
}
