import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { Mail } from '../models/mail';

@Injectable()
export class MailService{
  readonly url = environment.APIPortalURL + '/mail';
  constructor(private http: HttpClient) {
  }

  SendMail(mail: Mail) {
    return this.http.post(this.url + "/send-mail", mail);
  }
}

