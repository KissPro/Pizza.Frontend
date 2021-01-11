import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { COOData } from '../data/coo-model';

@Injectable()
export class COOService extends COOData {

  readonly rootURL = 'http://localhost:5001/api/boom-ecus/all-list';

  constructor(private http: HttpClient) {
      super();
  }

  //   postPaymentDetail() {
  //     return this.http.post(this.rootURL + '/PaymentDetail', this.formData);
  //   }
  //   putPaymentDetail() {
  //     return this.http.put(this.rootURL + '/PaymentDetail/'+ this.formData.PMId, this.formData);
  //   }
  //   deletePaymentDetail(id) {
  //     return this.http.delete(this.rootURL + '/PaymentDetail/'+ id);
  //   }
  postDatatables(dtParameter: any): Observable<any> {
    return this.http.post(this.rootURL, dtParameter).pipe(catchError(this.handleError));
  }

  handleError(error: HttpErrorResponse) {
    return throwError(error);
}
}
