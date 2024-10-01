using EmployeeCrudApi.Controllers;
using EmployeeCrudApi.Data;
using EmployeeCrudApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace EmployeeCrudApi.Tests
{
    public class EmployeeControllerTests
    {
        private ApplicationDbContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Crear una nueva base de datos en memoria para cada prueba
                .Options;

            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task GetAll_ReturnsListOfEmployees()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            context.Employees.AddRange(
                new Employee { Id = 1, Name = "John Doe" },
                new Employee { Id = 2, Name = "Jane Doe" }
            );
            await context.SaveChangesAsync();

            var controller = new EmployeeController(context);

            // Act
            var result = await controller.GetAll();

            // Assert
            Assert.IsType<List<Employee>>(result);
            Assert.Equal(2, result.Count);
        }

        [Fact]
        public async Task Create_ReturnsBadRequest_WhenNameContainsNumbers()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            var controller = new EmployeeController(context);
            var employee = new Employee { Name = "John Doe 123" };

            // Act
            var result = await controller.Create(employee);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal(400, badRequestResult.StatusCode);
        }

        [Fact]
        public async Task Create_ReturnsBadRequest_WhenNamePartsHaveSingleCharacter()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            var controller = new EmployeeController(context);
            var employee = new Employee { Name = "A B" };

            // Act
            var result = await controller.Create(employee);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal(400, badRequestResult.StatusCode);
        }

        [Fact]
        public async Task Create_ReturnsBadRequest_WhenNameIsDuplicate()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            context.Employees.Add(new Employee { Name = "John Doe" });
            await context.SaveChangesAsync();

            var controller = new EmployeeController(context);
            var duplicateEmployee = new Employee { Name = "John Doe" };

            // Act
            var result = await controller.Create(duplicateEmployee);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal(400, badRequestResult.StatusCode);
        }

        [Fact]
        public async Task Create_StoresFormattedNameCorrectly()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            var controller = new EmployeeController(context);
            var employee = new Employee { Name = "juan carlos chamizo" };

            // Act
            var result = await controller.Create(employee);
            var createdEmployee = await context.Employees.FirstOrDefaultAsync(e => e.Name == "Juan Carlos CHAMIZO");

            // Assert
            Assert.NotNull(createdEmployee);
            Assert.Equal("Juan Carlos CHAMIZO", createdEmployee.Name);
        }
    }
}
