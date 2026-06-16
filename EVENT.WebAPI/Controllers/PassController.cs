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
            long? resolvedUserId = null;
            int? resolvedUserRole = null;

            var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (int.TryParse(roleClaim, out int parsedRole))
            {
                resolvedUserRole = parsedRole;
            }

            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (long.TryParse(userIdClaim, out long parsedUserId))
            {
                resolvedUserId = parsedUserId;
            }

            var result = await _passRepository.GetPassByIdAsync(id, resolvedUserId, resolvedUserRole);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("passes/my-passes")]
        public async Task<IActionResult> GetUserPasses([FromQuery] long? userId = null)
        {
            long resolvedUserId = 0;
            int? resolvedUserRole = null;

            var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (int.TryParse(roleClaim, out int parsedRole))
            {
                resolvedUserRole = parsedRole;
            }

            var userIdClaim = User.FindFirst("UserId")?.Value;
            long.TryParse(userIdClaim, out long parsedUserId);

            // Role-based access control: only SuperAdmin (Role 1) can fetch passes for other user IDs.
            // Organizer (Role 2) and Visitor/others must only be allowed to query using their own UserId.
            if (resolvedUserRole != 1)
            {
                resolvedUserId = parsedUserId;
            }
            else
            {
                resolvedUserId = userId ?? parsedUserId;
            }

            var result = await _passRepository.GetUserPassesAsync(resolvedUserId, resolvedUserRole);
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
