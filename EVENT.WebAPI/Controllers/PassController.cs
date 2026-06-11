using EVENT.Business.BusinessClass;
using EVENT.DAL.IRepository;
using EVENT.Web.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace EVENT.WebAPI.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public class PassController : ControllerBase
    {
        private readonly IPassRepository _passRepository;

        public PassController(IPassRepository passRepository)
        {
            _passRepository = passRepository;
        }

        [HttpPost("passes/generate")]
        public async Task<IActionResult> GenerateRegeneratePass([FromBody] PassGenerateRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _passRepository.GenerateRegeneratePassAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("passes/{id}")]
        public async Task<IActionResult> GetPassDetails(long id)
        {
            var result = await _passRepository.GetPassByIdAsync(id);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("passes/validate")]
        public async Task<IActionResult> ValidatePass([FromBody] PassValidateRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _passRepository.ValidatePassAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("pass/report/attendance")]
        public async Task<IActionResult> GetAttendanceReport()
        {
            var result = await _passRepository.GetAttendanceReportAsync();
            return StatusCode(result.StatusCode, result);
        }
    }
}
