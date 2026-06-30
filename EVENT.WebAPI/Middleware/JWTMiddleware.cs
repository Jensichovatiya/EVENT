using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using EVENT.Business.BusinessClass.Lookup;
using EVENT.Business.User;
using EVENT.Core.Common.Enum;
using EVENT.DAL.IRepository;
using EVENT.WebAPI.Models;
using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace EVENT.WebAPI.Middleware {
    public class JWTMiddleware {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _configuration;

        public JWTMiddleware(RequestDelegate next, IConfiguration configuration) {
            _next = next;
            _configuration = configuration;
        }
        public async Task Invoke(HttpContext context) {
            bool isAuthenticated = false;
            string failReason = "Unauthorized";
            bool canValidateToken = false;
            int platform = Convert.ToInt32(context.Request.Headers["Platform"].FirstOrDefault());

                if (platform == (int)Platform.Android || platform == (int)Platform.Ios)
                {
                    var res = (_configuration["ApplicationSettings:ApiSecurityKey"] == context.Request.Headers["ApiSecurityKey"].FirstOrDefault());
                    if (!res)
                        failReason = "Application Security Key Not Matched.";
                    else
                    {
                        if (IsOpenPath(context))
                            isAuthenticated = true;

                        canValidateToken = true;
                    }
                }
                else
                {
                    if (IsOpenPath(context))
                    {
                        isAuthenticated = true;
                    }
                    else
                    {
                        if (context != null && context.User != null && context.User.Identity != null && context.User.Identity.IsAuthenticated)
                        {
                            canValidateToken = true;
                        }
                    }
                }

                if (!isAuthenticated)
                {
                    if (canValidateToken)
                    {
                        bool res = false;
                        res = await ValidateToken(context, context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last(), platform);
                        if (res)
                        {

                        }
                        else
                            failReason = "Auth Token Not Matched.";


                        if (!res)
                        {
                            isAuthenticated = false;
                        }
                        else
                        {
                            isAuthenticated = true;
                        }
                    }
                }
            
            

            if (isAuthenticated)
                await _next(context);
            else
            {
                context.Response.StatusCode = 401;
                var json = JsonConvert.SerializeObject(new ResponseItem() { Status = false, Message = failReason });
                await context.Response.WriteAsync(json);
            }
        }
        private async Task<bool> ValidateToken(HttpContext context, string token, int platform) {
            var result = false;
            try {
                var tokenHandler = new JwtSecurityTokenHandler();
                var secret = _configuration["Jwt:Key"];
                var key = Encoding.UTF8.GetBytes(secret);
                tokenHandler.ValidateToken(token, new TokenValidationParameters {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateIssuerSigningKey = true,
                    ValidAudience = _configuration["Jwt:Audience"],
                    ValidIssuer = _configuration["Jwt:Issuer"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]))
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;

                if (jwtToken != null) {
                    var userClaims = jwtToken.Claims;
                    var userModal = new UserModel {
                        UserName = userClaims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value,
                        Role = Convert.ToInt32(userClaims.FirstOrDefault(x => x.Type == ClaimTypes.Role)?.Value),
                        //MobileNo = Convert.ToInt32(userClaims.FirstOrDefault(x => x.Type == "MobileNo")?.Value),
                        UserId = Convert.ToInt32(userClaims.FirstOrDefault(x => x.Type == "UserId")?.Value),
                    };
                    result = true;
                    //var loginRepo = context.RequestServices.GetService<ILoginRepository>();
                    //var dbToken = await loginRepo.GetUserToken(userModal.UserId);
                    //if (token == dbToken.Token) {

                    //if (dbToken.LastActivityTime == null)
                    //    result = true;
                    //else if (platform == (int)Platform.Android || platform == (int)Platform.Ios) {
                    //    if (dbToken.LastActivityTime.Value.AddDays(365) >= DateTime.Now)
                    //        result = true;
                    //    else
                    //        result = false;
                    //}
                    //else {
                    //    if (dbToken.LastActivityTime.Value.AddMinutes(300) >= DateTime.Now) //5 Hours
                    //        result = true;
                    //    else
                    //        result = false;
                    //}

                    if (result) {
                            context.Items["User"] = userModal;
                            //loginRepo.UpdateUserLastActivityTime(dbToken.LoginId);
                        }

                    //}
                    //else
                    //    result = false;
                }
            }
            catch {
                // do nothing if jwt validation fails
                // account is not attached to context so request won't have access to secure routes
            }
            return result;
        }
        private bool IsOpenPath(HttpContext context) {
            bool result = false;
            var endpoint = context.GetEndpoint();
            if (endpoint?.Metadata?.GetMetadata<IAllowAnonymous>() is object) {
                result = true;
            }
            return result;
        }
    }

}
