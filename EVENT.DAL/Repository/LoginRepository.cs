using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using EVENT.Business.BusinessClass.Lookup;
using EVENT.Business.Helper;
using EVENT.Business.Login;
using EVENT.Business.Settings;
using EVENT.Business.User;
using EVENT.Core.Common.Enum;
using EVENT.Core.Encrypt;
using EVENT.DAL.IRepository;
using EVENT.Entities.DbClass;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics.Tracing;
using System.Dynamic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using static System.Net.WebRequestMethods;
using EVENT.Business.BusinessClass.InputModels;
using EVENT.Business.BusinessClass.OutputModels;
using System.Reflection;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using Newtonsoft.Json.Linq;
using Google.Apis.Auth.OAuth2.Requests;
using EVENT.Web.Models;

namespace EVENT.DAL.Repository
{
    public class LoginRepository : BaseRepository, ILoginRepository
    {
        private readonly ApplicationSettings _settings;
        private readonly IConfiguration _config;
        private readonly IHttpContextAccessor _httpContext;
        private ResponseItem response;

        public LoginRepository(IOptions<ApplicationSettings> options, IConfiguration config
            , IHttpContextAccessor httpContext) : base(options)
        {
            this._settings = options.Value;

            _config = config;
            _httpContext = httpContext;
        }

        public async Task<ResponseItem> LoginAsync(LoginInputModel login)
        {
            try
            {
                if (string.IsNullOrEmpty(login.MobileNo))
                    return new ResponseItem { Status = false, Message = "Please Enter Valid Mobile No." };

                if (string.IsNullOrEmpty(login.DialCode))
                    return new ResponseItem { Status = false, Message = "Please Select Valid Mobile Dial Code" };

                //var newOtp = Helper.GenerateOTP();
                string newOtp = "";
                if (login.MobileNo == "6354211192" || login.MobileNo == "9375784248") { // added this code for appstore personal testing, need to remove once getting permission from app store.
                    newOtp = "888888";
                }
                else {
                    //newOtp = Helper.GenerateOTP();
                    newOtp = "888888";
                }

                string squery = "EXEC USP_Login @UserName, @DeviceId, @FCM_Token, @IPAddress, @CreatedFrom";
                var param = new DynamicParameters();
                param.Add("@UserName", login.MobileNo);
                param.Add("@DeviceId", login.DeviceId);
                param.Add("@FCM_Token", null);
                param.Add("@IPAddress", null);
                param.Add("@CreatedFrom", "WebAPI");

                var sres = await QueryFirstOrDefaultAsync<ResponseItem>(squery, param);

                if (sres != null)
                {
                    response = sres;
                }
                else
                {
                    response = new ResponseItem { Status = false, Message = "Login failed." };
                }
            }
            catch (Exception ex)
            {
                response = new ResponseItem { Status = false, Message = ex.Message };
            }
            return response;
        }
        public string GenerateToken(UserLoginResponse sres)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier,sres.MobileNo.ToString()),
                new Claim(ClaimTypes.Role,sres.UserRole.ToString()),
                new Claim("MobileNo", sres.MobileNo),
                new Claim("UserId", sres.UserId.ToString())
            };

            var token = new JwtSecurityToken
            (
               issuer: _config["Jwt:Issuer"],
               audience: _config["Jwt:Audience"],
               claims: claims,
               expires: DateTime.Now.AddHours(12),
               signingCredentials: credentials
             );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        public async Task<UserLoginResponse> VerifyOTPAsync(OTPInputmodel otp)
        {
            UserLoginResponse response = new UserLoginResponse();
            try
            {
                var user = await QueryFirstOrDefaultAsync<Tracket_Master_User>("SELECT UserId FROM Tracket_Master_User WHERE MobileNo = @MobileNo AND IsDeleted = 0", new { MobileNo = otp.MobileNo });
                if (user == null) {
                    response.Status = false;
                    response.Message = "User not found.";
                    return response;
                }

                string squery = "EXEC USP_VerifyOTP @UserId, @OTP, @Purpose, @UpdatedFrom";
                var param = new DynamicParameters();
                param.Add("@UserId", user.UserId);
                param.Add("@OTP", otp.OTP);
                param.Add("@Purpose", "Register");
                param.Add("@UpdatedFrom", "WebAPI");
                var sres = await QueryFirstOrDefaultAsync<ResponseItem>(squery, param);

                if (sres != null && sres.Status)
                {
                    var userLoginInfo = await QueryFirstOrDefaultAsync<UserLoginResponse>(@"
                        SELECT U.UserId, U.Name, U.MobileNo, U.EmailId, U.UserType, U.UserRole
                        FROM Tracket_Master_User U
                        WHERE U.UserId = @UserId", new { UserId = user.UserId });

                    if (userLoginInfo != null)
                    {
                        var Token = GenerateToken(userLoginInfo);

                        string sqlQuery = "UPDATE Tracket_Master_User_Login SET Token = @Token, FCM_Token = @FCMToken WHERE UserId = @UserId";
                        var tokenParams = new DynamicParameters();
                        tokenParams.Add("@UserId", user.UserId);
                        tokenParams.Add("@Token", Token);
                        tokenParams.Add("@FCMToken", otp.FCMToken);
                        await ExecuteAsync<int>(sqlQuery, tokenParams);

                        response.Status = true;
                        response.Message = "OTP verified successfully.";
                        response.Token = Token;
                        response.UserId = userLoginInfo.UserId;
                        response.UserRole = userLoginInfo.UserRole;
                        response.MobileNo = userLoginInfo.MobileNo;
                    }
                    else
                    {
                        response.Status = false;
                        response.Message = "User details not found.";
                    }
                }
                else
                {
                    response.Status = false;
                    response.Message = sres?.Message ?? "OTP not verified.";
                }
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
            }
            return response;
        }

        public async Task<string> RefreshToken(TokenRequestModel tokenRequest) {
            var tokenHandler = new JwtSecurityTokenHandler();
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);


            try {
                var claimsPrincipal = tokenHandler.ValidateToken(tokenRequest.Token, new TokenValidationParameters {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = securityKey,
                    ValidateIssuer = true,
                    ValidIssuer = _config["Jwt:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = _config["Jwt:Audience"],
                    ValidateLifetime = false
                }, out _);

                var mobileNo = claimsPrincipal.FindFirst("MobileNo")?.Value;
                var userId = claimsPrincipal.FindFirst("UserId")?.Value;

                if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(mobileNo)) {
                    return null;
                }

                string squery = "EXEC USP_User_Role_For_Refresh_Token  @UserId,@MobileNo ";
                var param = new DynamicParameters();
                param.Add("@UserId", userId);
                param.Add("@MobileNo", mobileNo);
                var sres = await QueryFirstOrDefaultAsync<UserLoginResponse>(squery, param);

                var Token = GenerateToken(sres);

                return Token;
            }
            catch (SecurityTokenExpiredException) {
                return "";
            }
            catch (SecurityTokenException ex) {
                return "";
            }

        }

        public async Task<UserLoginToken> RefreshTokenAsync(TokenRequestModel tokenRequest)
        {
            UserLoginToken response = new UserLoginToken();
            try
            {
                string squery = @"
                    IF EXISTS (SELECT * FROM Tracket_Master_User_Login WHERE UserId = @UserId AND UserName = @MobileNo)
                    BEGIN
                        UPDATE Tracket_Master_User_Login 
                        SET Token = @Token 
                        WHERE UserName = @MobileNo AND UserId = @UserId;
    
                        SELECT 
                            [Status] = 1, 
                            [Message] = 'Token refreshed successfully.', 
                            [Token] = @Token, 
                            [UserId] = @UserId, 
                            [MobileNo] = @MobileNo;
                    END
                    ELSE
                    BEGIN
                        SELECT 
                            [Status] = 0, 
                            [Message] = 'Token refresh failed. User not found.', 
                            [Token] = @Token, 
                            [UserId] = @UserId, 
                            [MobileNo] = @MobileNo;
                    END";

                var param = new DynamicParameters();
                param.Add("@Token", tokenRequest.Token);
                param.Add("@UserId", tokenRequest.UserId);
                param.Add("@MobileNo", tokenRequest.MobileNo);
                var sres = await QueryFirstOrDefaultAsync<UserLoginToken>(squery, param);
                if (sres != null)
                {
                    response = sres;
                }
                else
                {
                    response.Status = false;
                    response.Message = "";
                }
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
            }
            return response;
        }
        public async Task<List<CountryOutputModel>> GetCountryListAsync()
        {
            try
            {
                string squery = @"SELECT CountryId, CountryName, IsActive, CountryCode, DialCode, CurrencySymbol, Flag FROM tbl_Master_Country WITH (NOLOCK) WHERE IsActive = 1";

                var param = new DynamicParameters();
                var countries = await QueryAsync<CountryOutputModel>(squery, param);

                return countries.ToList();
            }
            catch (Exception ex)
            {
                throw new Exception("Error fetching country list", ex);
            }
        }

        public async Task<RefreshFCMTokenOutputModel> RefreshFCMTokenAsync(FCMRefreshModel fCMRefreshModel)
        {
            RefreshFCMTokenOutputModel response = new RefreshFCMTokenOutputModel();

            try
            {
                string squery = "EXEC USP_API_RefreshFCMToken @FCM_Token, @UserId, @MobileNo";

                var param = new DynamicParameters();
                param.Add("FCM_Token", fCMRefreshModel.FCM_Token);
                param.Add("UserId", fCMRefreshModel.UserId);
                param.Add("MobileNo", fCMRefreshModel.MobileNo);

                var sres = await QueryFirstOrDefaultAsync<RefreshFCMTokenOutputModel>(squery, param);

                if (sres != null)
                {
                    response = sres;
                }
                else
                {
                    response.Status = false;
                    response.Message = "No response received.";
                }
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
            }

            return response;
        }

        public async Task<UserLoginToken> GetUserToken(int UserId) {
            try {
                var token = await QueryFirstOrDefaultAsync<UserLoginToken>("select  top 1 LoginId, Token,  LastActivityTime from Tracket_Master_User_Login  Where UserId = @UserId and IsDeleted = 0", new { UserId });
                return token;
            }
            catch (Exception ex) {
                return null;
            }
        }
        public async Task<bool> UpdateUserLastActivityTime(int loginId) {
            try {
                var query = "update Tracket_Master_User_Login set LastActivityTime = getdate() where LoginId = @Id ";
                var res = await ExecuteAsync<int>(query, new { Id = loginId });
                return res > 0;
            }
            catch (Exception ex) {
                throw;
            }
        }

        public async Task<UserLoginResponse> LoginSubPartner(SubPartnerLoginInputModel SubPartnerLoginInputModel) {
            UserLoginResponse response = new UserLoginResponse();
            try {
                if (string.IsNullOrEmpty(SubPartnerLoginInputModel.Name)) {
                    response.Status = false;
                    response.Message = "Please enter a valid Sub Partner Id.";
                }

                if (string.IsNullOrEmpty(SubPartnerLoginInputModel.Password)) {
                    response.Status = false;
                    response.Message = "Please enter a valid Password.";
                }

                string squery = "EXEC USP_Login_SubPartner @PartnerId, @Password";
                var param = new DynamicParameters();
                param.Add("@PartnerId", SubPartnerLoginInputModel.Name);
                param.Add("@Password", SubPartnerLoginInputModel.Password);

                var sres = await QueryFirstOrDefaultAsync<UserLoginResponse>(squery, param);

                if (sres != null) {
                    if (sres.Status) {
                        var Token = GenerateToken(sres);

                        string sqlQuery = "EXEC USP_SubPartner_Login_NewToken_Update @PartnerId, @DeviceId, @Token, @FCMToken";
                        var newTokenParam = new DynamicParameters();
                        newTokenParam.Add("@PartnerId", SubPartnerLoginInputModel.Name);
                        newTokenParam.Add("@DeviceId", SubPartnerLoginInputModel.DeviceId);
                        newTokenParam.Add("@Token", Token);
                        newTokenParam.Add("@FCMToken", SubPartnerLoginInputModel.FCMToken);
                        var TokenUpdateResult = await QueryFirstOrDefaultAsync<UserLoginResponse>(sqlQuery, newTokenParam);

                        if (TokenUpdateResult != null) {

                            response.Status = TokenUpdateResult.Status;
                            response.Message = TokenUpdateResult.Message;
                            response.Token = Token;
                            response.UserId = sres.UserId;
                            response.UserRole = sres.UserRole;
                            response.UserSubRole = sres.UserSubRole;
                            response.MobileNo = sres.MobileNo;
                        }
                        else {
                            response.Status = false;
                            response.Message = "New token not updated.";
                        }
                    }
                    else {
                        response.Status = false;
                        response.Message = sres.Message;
                    }
                }
                else {
                    response.Status = false;
                    response.Message = "Login failed.";
                }
            }
            catch (Exception ex) {
                response.Status = false;
                response.Message = ex.Message;
            }
            return response;
        }


        public async Task<ValidateReferralCodeOutput> ValidateReferralCode(string RefferalCode) {
            try {
                var parameters = new DynamicParameters();
                parameters.Add("@RefferalCode", RefferalCode, DbType.String);
                var result = await QueryFirstOrDefaultAsync<ValidateReferralCodeOutput>("USP_Validate_RefferalCode", parameters, commandType: CommandType.StoredProcedure);
                return result;
            }
            catch (Exception ex) {
                return new ValidateReferralCodeOutput {
                    Status = false,
                    Message = ex.Message,
                    ReferredByUserId = null
                };
            }
        }

    }
}
