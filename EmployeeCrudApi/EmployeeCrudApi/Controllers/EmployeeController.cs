
using EmployeeCrudApi.Data;
using EmployeeCrudApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace EmployeeCrudApi.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class EmployeeController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EmployeeController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<List<Employee>> GetAll()
        {
            return await _context.Employees.ToListAsync();
        }

        [HttpGet]
        public async Task<Employee> GetById(int id)
        {
            return await _context.Employees.FindAsync(id);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Employee employee)
        {
            // Validations
            if (!IsValidName(employee.Name))
            {
                return BadRequest(new { status = 400, error = "Bad Request", message = "Invalid name. Make sure it contains no numbers and each part has at least one valid character." });
            }

            if (await IsDuplicateName(employee.Name))
            {
                return BadRequest(new { status = 400, error = "Bad Request", message = "Employee name already exists." });
            }

            employee.Name = FormatName(employee.Name);
            employee.CreatedDate = DateTime.Now;

            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();
            return Ok(employee);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Employee employee)
        {
            var existingEmployee = await _context.Employees.FindAsync(id);

            if (existingEmployee == null)
            {
                return NotFound(new { status = 404, error = "Not Found", message = "Employee not found." });
            }

            // Validations
            if (!IsValidName(employee.Name))
            {
                return BadRequest(new { status = 400, error = "Bad Request", message = "Invalid name. Make sure it contains no numbers and each part has at least one valid character." });
            }

            if (await IsDuplicateName(employee.Name, id))
            {
                return BadRequest(new { status = 400, error = "Bad Request", message = "Employee name already exists." });
            }

            existingEmployee.Name = FormatName(employee.Name);
            _context.Entry(existingEmployee).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return Ok(existingEmployee);
        }

        // Check for duplicate names
        private async Task<bool> IsDuplicateName(string name, int? id = null)
        {
            name = name.ToLower(); // Convert to lowercase for case-insensitive comparison
            if (id.HasValue)
            {
                return await _context.Employees.AnyAsync(e => e.Name.ToLower() == name && e.Id != id.Value);
            }
            return await _context.Employees.AnyAsync(e => e.Name.ToLower() == name);
        }

        // Validate name
        private bool IsValidName(string name)
        {
            if (name.Length > 100) return false;
            if (Regex.IsMatch(name, @"\d")) return false; // No numbers allowed
            var parts = name.Split(' ');
            return parts.All(p => p.Length > 1); // Each part must have at least one character
        }

        // Format name
        private string FormatName(string name)
        {
            var parts = name.Split(' ');
            var formattedParts = parts.Select(p => p.Length > 1 ? char.ToUpper(p[0]) + p.Substring(1).ToLower() : p.ToUpper()).ToList();
            if (formattedParts.Count > 1)
            {
                formattedParts[formattedParts.Count - 1] = formattedParts.Last().ToUpper(); // Last part (surname) in uppercase
            }
            return string.Join(" ", formattedParts);
        }
    }
}
