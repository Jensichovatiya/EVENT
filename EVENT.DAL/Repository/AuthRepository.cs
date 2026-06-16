using EVENT.Business.BusinessClass;
using EVENT.Business.Helper;
using EVENT.DAL.IRepository;
using EVENT.Web.Models;
using INvoice.Models;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
namespace EVENT.DAL.Repository
{
    public class AuthRepository : IAuthRepository
    {
        private readonly IGeneralFunctions _gf;
        private readonly IConfiguration _config;

        public AuthRepository(IGeneralFunctions gf, IConfiguration config)
        {
            _gf = gf;
            _config = config;
        }

        private string GenerateToken(AuthResponse user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.MobileNo),
                new Claim(ClaimTypes.Role, user.UserRole.ToString()),
                new Claim("MobileNo", user.MobileNo),
                new Claim("UserId", user.UserId.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(12),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        #region User Operations

        public async Task<ApiResponseModel<AuthResponse>> RegisterAsync(RegisterRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_AddEditUser", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    if (status == 201 || status == 200)
                    {
                        var data = ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0
                            ? DataRowToObject.CreateItemFromRow<AuthResponse>(ds.Tables[1].Rows[0])
                            : null;

                        if (data != null)
                        {
                            data.Token = GenerateToken(data);
                        }

                        return new ApiResponseModel<AuthResponse>
                        {
                            Success = true,
                            StatusCode = status,
                            Message = message,
                            Data = data
                        };
                    }
                    return new ApiResponseModel<AuthResponse>
                    {
                        Success = false,
                        StatusCode = status,
                        Message = message
                    };
                }
                return new ApiResponseModel<AuthResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = "Failed to register user."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<AuthResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<AuthResponse>> LoginAsync(LoginRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_Login", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    if (status == 200)
                    {
                        var data = ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0
                            ? DataRowToObject.CreateItemFromRow<AuthResponse>(ds.Tables[1].Rows[0])
                            : null;

                        if (data != null)
                        {
                            data.Token = GenerateToken(data);
                        }

                        return new ApiResponseModel<AuthResponse>
                        {
                            Success = true,
                            StatusCode = status,
                            Message = message,
                            Data = data
                        };
                    }
                    return new ApiResponseModel<AuthResponse>
                    {
                        Success = false,
                        StatusCode = status,
                        Message = message
                    };
                }
                return new ApiResponseModel<AuthResponse>
                {
                    Success = false,
                    StatusCode = 401,
                    Message = "Invalid credentials."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<AuthResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<string>> VerifyOTPAsync(OTPVerifyRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GenerateVerifyOTP", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    return new ApiResponseModel<string>
                    {
                        Success = status == 200,
                        StatusCode = status,
                        Message = message,
                        Data = status == 200 ? "OTP Verified Successfully" : null
                    };
                }
                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "OTP verification failed."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<string>> ResetPasswordAsync(ResetPasswordRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_ChangeResetPassword", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    return new ApiResponseModel<string>
                    {
                        Success = status == 200,
                        StatusCode = status,
                        Message = message,
                        Data = status == 200 ? "Password changed successfully" : null
                    };
                }
                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Failed to update password."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<List<UserResponse>>> GetUsersAsync()
        {
            try
            {
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetUsers");
                var list = new List<UserResponse>();

                if (ds != null && ds.Tables.Count > 0)
                {
                    list = ds.Tables[0].AsEnumerable()
                        .Select(row => DataRowToObject.CreateItemFromRow<UserResponse>(row))
                        .ToList();
                }

                return new ApiResponseModel<List<UserResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Users retrieved successfully.",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<UserResponse>>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<UserResponse>> GetUserByIdAsync(long id)
        {
            try
            {
                var parameters = new Dictionary<string, object> { { "@UserId", id } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetUsers", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    var user = DataRowToObject.CreateItemFromRow<UserResponse>(ds.Tables[0].Rows[0]);
                    return new ApiResponseModel<UserResponse>
                    {
                        Success = true,
                        StatusCode = 200,
                        Message = "User retrieved successfully.",
                        Data = user
                    };
                }

                return new ApiResponseModel<UserResponse>
                {
                    Success = false,
                    StatusCode = 404,
                    Message = "User not found."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<UserResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<string>> UpdateUserStatusAsync(UserStatusUpdateRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_UpdateUserStatus", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    return new ApiResponseModel<string>
                    {
                        Success = status == 200,
                        StatusCode = status,
                        Message = message,
                        Data = status == 200 ? "User status updated successfully" : null
                    };
                }
                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Failed to update user status."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        #endregion

        #region Role Operations

        public async Task<ApiResponseModel<List<RoleResponse>>> GetRolesAsync()
        {
            try
            {
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetRoles");
                var list = new List<RoleResponse>();

                if (ds != null && ds.Tables.Count > 0)
                {
                    list = ds.Tables[0].AsEnumerable()
                        .Select(row => DataRowToObject.CreateItemFromRow<RoleResponse>(row))
                        .ToList();
                }

                return new ApiResponseModel<List<RoleResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Roles retrieved successfully.",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<RoleResponse>>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<RoleResponse>> AddEditRoleAsync(RoleRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_AddEditRole", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    if (status == 201 || status == 200)
                    {
                        var data = ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0
                            ? DataRowToObject.CreateItemFromRow<RoleResponse>(ds.Tables[1].Rows[0])
                            : null;

                        return new ApiResponseModel<RoleResponse>
                        {
                            Success = true,
                            StatusCode = status,
                            Message = message,
                            Data = data
                        };
                    }
                    return new ApiResponseModel<RoleResponse>
                    {
                        Success = false,
                        StatusCode = status,
                        Message = message
                    };
                }
                return new ApiResponseModel<RoleResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = "Failed to add/edit role."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<RoleResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<string>> DeleteRoleAsync(long id)
        {
            try
            {
                var parameters = new Dictionary<string, object> { { "@RoleId", id } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_DeleteRole", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    return new ApiResponseModel<string>
                    {
                        Success = status == 200,
                        StatusCode = status,
                        Message = message,
                        Data = status == 200 ? "Role soft deleted successfully" : null
                    };
                }
                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Failed to delete role."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        #endregion
    }
}
