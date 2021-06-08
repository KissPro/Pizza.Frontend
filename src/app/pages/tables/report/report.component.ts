import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

  constructor(private http: HttpClient,
    private toastrService: NbToastrService,
  ) { }

  IssueID: string = '';
  template: string = `
  <p>Hello! this is demo table, let's try it</p> 
  <table style="height: 98px; width: 791px;"> <tbody> <tr> <td style="width: 71.2px;">#</td> <td style="width: 116.8px;">ID</td> <td style="width: 190.4px;">Name</td> <td style="width: 190.4px;">Email</td> <td style="width: 190.4px;">Department</td> </tr> <tr> <td style="width: 71.2px;">1</td> <td style="width: 116.8px;">V1536123</td> <td style="width: 190.4px;">Hoang Ngo Van</td> <td style="width: 190.4px;">hoangnv@fih</td> <td style="width: 190.4px;">IT</td> </tr> <tr> <td style="width: 71.2px;">2</td> <td style="width: 116.8px;">V422564</td> <td style="width: 190.4px;">Ngo Van Hoang</td> <td style="width: 190.4px;">hoangng@gmail</td> <td style="width: 190.4px;">IT</td> </tr> </tbody> </table> 
  `;



//   template: string = `<p>
//   Hello world! <br>
//   Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut officia error laudantium deserunt commodi perspiciatis,
//   ea quaerat quo reprehenderit voluptatibus, facere pariatur velit amet debitis. Ipsa modi cupiditate molestias
//   soluta. <br>
//   </p>
//   <table style="width:100%" class="table table-striped table-sm table-bordered">
//   <thead>
//     <tr>
//       <th>Area</th>
//       <th>PON</th>
//       <th>Line</th>
//     </tr>
//   </thead>
//  <tbody>
//     <tr>
//       <td>1</td>
//       <td>2</td>
//       <td>3</td>
//     </tr>
//     <tr>
//       <td>1</td>
//       <td>2</td>
//       <td>3</td>
//     </tr>
//     <tr>
//       <td>1</td>
//       <td>2</td>
//       <td>3</td>
//     </tr>
//  </tbody>
// </table>



//   `;

  ngOnInit(): void {
    this.IssueID = "4843726B-B336-4635-82F6-E68D3AC044B0";
  }


}


