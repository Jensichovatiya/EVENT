using Microsoft.IdentityModel.Tokens;
using EVENT.Business.User;
using EVENT.WebAPI.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace EVENT.WebAPI.Middleware {
    public class UserDetailMiddleware {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _configuration;

        public UserDetailMiddleware(RequestDelegate next, IConfiguration configuration) {
            _next = next;
            _configuration = configuration;
        }
        public async Task Invoke(HttpContext context) {
            bool isAuthenticated = false;
            if (!context.Request.Path.Value.ToString().ToLower().Contains("login")) {
                if (context != null && context.User != null && context.User.Identity != null && context.User.Identity.IsAuthenticated) {
                    bool res = await GetUserDetails(context);
                    if (!res) {
                        isAuthenticated = false;
                    }
                    else {
                        isAuthenticated = true;
                    }
                }
            }
            else {
                isAuthenticated = true;
            }

            if (isAuthenticated)
                await _next(context);
            else {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Unauthorized.");
            }
        }
        private async Task<bool> GetUserDetails(HttpContext context) {
            bool result = false;
            try {
                var userClaims = context.User.Identity as ClaimsIdentity;
                var userModal = new UserModel {
                    UserName = userClaims.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value,
                    Role = Convert.ToInt32(userClaims.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Role)?.Value),
                    UserId = Convert.ToInt32(userClaims.Claims.FirstOrDefault(x => x.Type == "Id")?.Value),
                };
                context.Items["User"] = userModal;
                //HttpContext.Connection.RemoteIpAddress
                result = true;
            }
            catch {
            }
            return result;
        }
    }
}
