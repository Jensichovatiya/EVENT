using EVENT.Business.BusinessClass;
using EVENT.Web.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EVENT.DAL.IRepository
{
    public interface IAuthRepository
    {
        Task<ApiResponseModel<AuthResponse>> RegisterAsync(RegisterRequest request);
        Task<ApiResponseModel<AuthResponse>> LoginAsync(LoginRequest request);
        Task<ApiResponseModel<string>> VerifyOTPAsync(OTPVerifyRequest request);
        Task<ApiResponseModel<string>> ResetPasswordAsync(ResetPasswordRequest request);
        Task<ApiResponseModel<List<UserResponse>>> GetUsersAsync();
        Task<ApiResponseModel<UserResponse>> GetUserByIdAsync(long id);
        Task<ApiResponseModel<string>> UpdateUserStatusAsync(UserStatusUpdateRequest request);
        Task<ApiResponseModel<List<RoleResponse>>> GetRolesAsync();
        Task<ApiResponseModel<RoleResponse>> AddEditRoleAsync(RoleRequest request);
        Task<ApiResponseModel<string>> DeleteRoleAsync(long id);
    }
}
