import { TestBed } from '@angular/core/testing';
import { AddemployeeComponent } from './addemployee.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs'; // para simular observables
import { DatePipe } from '@angular/common';
import { EmployeeService } from '../employee.service';
import { ToastrService } from 'ngx-toastr'; // Importa ToastrService
import { Employee } from '../employee.model';
import { Router } from '@angular/router';

describe('AddemployeeComponent', () => {
  let component: AddemployeeComponent;
  let fixture;
  let employeeService: jasmine.SpyObj<EmployeeService>;
  let toastrService: jasmine.SpyObj<ToastrService>;
  let router: Router;

  beforeEach(() => {
    const toastrSpy = jasmine.createSpyObj('ToastrService', ['error', 'success']);
    const employeeServiceSpy = jasmine.createSpyObj('EmployeeService', ['getAllEmployee', 'createEmployee', 'updateEmployee']);

    TestBed.configureTestingModule({
      imports: [AddemployeeComponent, HttpClientTestingModule],
      providers: [
        DatePipe,
        {
          provide: ActivatedRoute, // Simula ActivatedRoute
          useValue: {
            params: of({ id: 1 }) // simula el parámetro id en la URL
          }
        },
        { provide: ToastrService, useValue: toastrSpy }, // Simula Toastr
        { provide: EmployeeService, useValue: employeeServiceSpy } // Simula EmployeeService
      ]
    });

    fixture = TestBed.createComponent(AddemployeeComponent);
    component = fixture.componentInstance;
    employeeService = TestBed.inject(EmployeeService) as jasmine.SpyObj<EmployeeService>;
    toastrService = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not allow creating an employee if the name contains numbers', () => {
    const employee = new Employee(0, 'John123 Doe', '');

    const result = component.validateEmployee(employee);

    expect(result).toBeFalse();
    expect(toastrService.error).toHaveBeenCalledWith('El nombre no puede contener números.', 'Error');
  });

  it('should not allow creating an employee if the name is too short', () => {
    const employee = new Employee(0, 'A', '');

    const result = component.validateEmployee(employee);

    expect(result).toBeFalse();
    expect(toastrService.error).toHaveBeenCalledWith('El nombre debe tener al menos 2 caracteres.', 'Error');
  });

  it('should not allow creating an employee if the name exceeds 100 characters', () => {
    const employee = new Employee(0, 'A'.repeat(101), '');

    const result = component.validateEmployee(employee);

    expect(result).toBeFalse();
    expect(toastrService.error).toHaveBeenCalledWith('El nombre no puede tener más de 100 caracteres.', 'Error');
  });

  it('should not allow creating an employee if the name is duplicated', () => {
    const employee = new Employee(0, 'John Doe', '');
    const existingEmployeeList: Employee[] = [
      new Employee(1, 'John Doe', '') // Empleado con el mismo nombre
    ];
    component.employeeList = existingEmployeeList;

    const result = component.validateEmployee(employee);

    expect(result).toBeFalse();
    expect(toastrService.error).toHaveBeenCalledWith('El nombre del empleado ya existe.', 'Error');
  });

  it('should not allow editing an employee if the name is duplicated', () => {
    const employee = new Employee(1, 'John Doe', ''); // Empleado en modo edición (tiene id)
    const existingEmployeeList: Employee[] = [
      new Employee(2, 'John Doe', '') // Otro empleado con el mismo nombre
    ];
    component.employeeList = existingEmployeeList;

    const result = component.validateEmployee(employee);

    expect(result).toBeFalse();
    expect(toastrService.error).toHaveBeenCalledWith('El nombre del empleado ya existe.', 'Error');
  });

  it('should format the employee name correctly', () => {
    const employee = new Employee(0, 'john doe', '');

    component.validateEmployee(employee); // La validación también formatea el nombre

    expect(employee.name).toEqual('John DOE');
  });

  it('should call createEmployee service method if validation passes', () => {
    const employee = new Employee(0, 'John Doe', '');
  
    // Simula que el servicio devuelve un observable exitoso
    employeeService.createEmployee.and.returnValue(of(employee));
  
    component.addEmployee(employee);
  
    expect(employeeService.createEmployee).toHaveBeenCalledWith(employee);
    expect(toastrService.success).toHaveBeenCalledWith('Empleado creado con éxito.', 'Éxito');
  });
  
  it('should call updateEmployee service method if employee is being edited', () => {
    const employee = new Employee(1, 'John Doe', ''); // Empleado con id (modo edición)
  
    // Simula que el servicio devuelve un observable exitoso
    employeeService.updateEmployee.and.returnValue(of(employee));
  
    component.addEmployee(employee);
  
    expect(employeeService.updateEmployee).toHaveBeenCalledWith(employee);
    expect(toastrService.success).toHaveBeenCalledWith('Empleado actualizado con éxito.', 'Éxito');
  });  
});