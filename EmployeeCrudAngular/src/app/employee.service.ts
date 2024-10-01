import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from './employee.model';
import { map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { environment } from '../environments/environment'; // Importa el environment


@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  apiUrlEmployee = environment.apiUrl;  // Usa el valor de environment

  constructor(private http: HttpClient, private datepipe: DatePipe) {}

  getAllEmployee(): Observable<Employee[]> {
    return this.http
      .get<Employee[]>(this.apiUrlEmployee + '/getall')
      .pipe(
        map((data: Employee[]) =>
          data.map(
            (item: Employee) =>
              new Employee(
                item.id,
                item.name,
                this.datepipe
                  .transform(item.createdDate, 'dd/MM/yyyy HH:mm:ss',undefined)
                  ?.toString()
              )
          )
        )
      );
  }


  getEmployeeById(employeeId: number): Observable<Employee> {
    return this.http.get<Employee>(
      this.apiUrlEmployee + '/getbyid/?id=' + employeeId
    );
  }
  createEmployee(employee: Employee): Observable<Employee> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.post<Employee>(
      this.apiUrlEmployee + '/create',
      employee,
      httpOptions
    );
  }
  updateEmployee(employee: Employee): Observable<Employee> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.put<Employee>(
      this.apiUrlEmployee + '/update',
      employee,
      httpOptions
    );
  }

  deleteEmployeeById(employeeid: number) {
    let endPoints = '/posts/1';
    return this.http.delete(this.apiUrlEmployee + '/Delete/?id=' + employeeid);
  }
}
