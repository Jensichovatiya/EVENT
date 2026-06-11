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
    public class ScannerController : ControllerBase
    {
        private readonly IPassRepository _passRepository;

        public ScannerController(IPassRepository passRepository)
        {
            _passRepository = passRepository;
        }

        [HttpPost("scanner/scan")]
        public async Task<IActionResult> ScanPass([FromBody] ScanRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _passRepository.ScanPassAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("scanner/history")]
        public async Task<IActionResult> GetScanHistory()
        {
            var result = await _passRepository.GetScanHistoryAsync();
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("scanner/attendance")]
        public async Task<IActionResult> GetAttendanceReport()
        {
            var result = await _passRepository.GetAttendanceReportAsync();
            return StatusCode(result.StatusCode, result);
        }
    }
}
