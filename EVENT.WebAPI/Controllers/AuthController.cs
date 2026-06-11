using EVENT.Business.BusinessClass;
using EVENT.DAL.IRepository;
using EVENT.Web.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EVENT.WebAPI.Controllers
{
    [ApiController]
    [Route("api")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository _authRepository;

        public AuthController(IAuthRepository authRepository)
        {
            _authRepository = authRepository;
        }

        [AllowAnonymous]
        [HttpPost("auth/register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _authRepository.RegisterAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        [AllowAnonymous]
        [HttpPost("auth/login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _authRepository.LoginAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        [AllowAnonymous]
        [HttpPost("auth/otp")]
        public async Task<IActionResult> VerifyOTP([FromBody] OTPVerifyRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _authRepository.VerifyOTPAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        [AllowAnonymous]
        [HttpPost("auth/password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _authRepository.ResetPasswordAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        [Authorize]
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var result = await _authRepository.GetUsersAsync();
            return StatusCode(result.StatusCode, result);
        }

        [Authorize]
        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUserById(long id)
        {
            var result = await _authRepository.GetUserByIdAsync(id);
            return StatusCode(result.StatusCode, result);
        }

        [Authorize]
        [HttpPut("users/status")]
        public async Task<IActionResult> UpdateUserStatus([FromBody] UserStatusUpdateRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _authRepository.UpdateUserStatusAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        [AllowAnonymous]
        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            var result = await _authRepository.GetRolesAsync();
            return StatusCode(result.StatusCode, result);
        }

        [Authorize]
        [HttpPost("roles")]
        public async Task<IActionResult> AddEditRole([FromBody] RoleRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _authRepository.AddEditRoleAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        [Authorize]
        [HttpDelete("roles/{id}")]
        public async Task<IActionResult> DeleteRole(long id)
        {
            var result = await _authRepository.DeleteRoleAsync(id);
            return StatusCode(result.StatusCode, result);
        }
    }
}
