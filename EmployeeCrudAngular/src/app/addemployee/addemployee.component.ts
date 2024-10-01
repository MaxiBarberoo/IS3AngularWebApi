import { Component, OnInit } from '@angular/core';
import { Employee } from '../employee.model';
import { EmployeeService } from '../employee.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr'; // Importar Toastr

@Component({
  selector: 'app-addemployee',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './addemployee.component.html',
  styleUrls: ['./addemployee.component.css']
})
export class AddemployeeComponent implements OnInit {
  newEmployee: Employee = new Employee(0, '', '');
  employeeList: Employee[] = []; // Lista de empleados cargada desde el servidor
  submitBtnText: string = "Create";
  imgLoadingDisplay: string = 'none';

  constructor(private employeeService: EmployeeService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.employeeService.getAllEmployee().subscribe(
      employees => this.employeeList = employees,
      error => this.toastr.error('Error al cargar la lista de empleados.', 'Error')
    );

    this.activatedRoute.queryParams.subscribe(params => {
      const employeeId = params['id'];
      if(employeeId)
      this.editEmployee(employeeId);
    });
  }

  // Validaciones antes de agregar o editar un empleado
  validateEmployee(employee: Employee): boolean {
    // Verificar si el nombre contiene números
    if (/\d/.test(employee.name)) {
      this.toastr.error('El nombre no puede contener números.', 'Error');
      return false;
    }

    // Verificar si la longitud del nombre es menor a 2 caracteres
    if (employee.name.length < 2) {
      this.toastr.error('El nombre debe tener al menos 2 caracteres.', 'Error');
      return false;
    }

    // Verificar si la longitud del nombre excede los 100 caracteres
    if (employee.name.length > 100) {
      this.toastr.error('El nombre no puede tener más de 100 caracteres.', 'Error');
      return false;
    }

    // Formatear el nombre correctamente
    employee.name = this.formatName(employee.name);

    // Verificar si el nombre está duplicado, tanto en la creación como en la edición
    const isDuplicated = this.employeeList.some(
      existingEmployee => this.formatName(existingEmployee.name) === employee.name && existingEmployee.id !== employee.id
    );

    if (isDuplicated) {
      this.toastr.error('El nombre del empleado ya existe.', 'Error');
      return false;
    }

    return true; // Si pasa todas las validaciones
  }

  // Método para formatear el nombre
  private formatName(name: string): string {
    const parts = name.split(' ');
    const firstName = parts.slice(0, -1).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    const lastName = parts[parts.length - 1].toUpperCase();
    return `${firstName} ${lastName}`;
  }

  addEmployee(employee: Employee) {
    // Realizar las validaciones
    if (!this.validateEmployee(employee)) {
      return;
    }

    if (employee.name == "")
      return;

    if (employee.id == 0) {
      employee.createdDate = new Date().toISOString();
      this.employeeService.createEmployee(employee).subscribe(result=>{
        this.toastr.success('Empleado creado con éxito.', 'Éxito');
        this.router.navigate(['/'])});
    }
    else {
      employee.createdDate = new Date().toISOString();
      this.employeeService.updateEmployee(employee).subscribe(result=>{
        this.toastr.success('Empleado actualizado con éxito.', 'Éxito');
        this.router.navigate(['/'])});
    }
    this.submitBtnText = "";
    this.imgLoadingDisplay = 'inline';
  }

  editEmployee(employeeId: number) {
    this.employeeService.getEmployeeById(employeeId).subscribe(res => {
      this.newEmployee.id = res.id;
      this.newEmployee.name = res.name
      this.submitBtnText = "Edit";
    });
  }

}
