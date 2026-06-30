using EVENT.Business.BusinessClass.InputModels;
using EVENT.Business.Login;
using EVENT.Core.Common.Enum;
using EVENT.DAL.IRepository;
using EVENT.DAL.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using EVENT.WebAPI.Attribute;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Google.Apis.Auth.OAuth2.Requests;
using static Dapper.SqlMapper;
using EVENT.Business.Helper;
using System.Runtime;
using EVENT.Business.Settings;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Http;
using EVENT.Web.Models;

namespace EVENT.WebAPI.Controllers {
    [Authorize]
    [Route("api/Login")]
    [ApiController]
    [ValidateModel]
    public class LoginController : ControllerBase {
        private readonly ApplicationSettings _settings;
        private readonly ILoginRepository _repository;
        private readonly IConfiguration _config;
        private readonly IHttpContextAccessor _httpContext;
        public LoginController(IOptions<ApplicationSettings> Settings, ILoginRepository loginRepository, IConfiguration config, IHttpContextAccessor httpContext) {
            _settings = Settings.Value;
            _repository = loginRepository;
            _config = config;
            _httpContext = httpContext;
        }
#region  Login
        [AllowAnonymous]
        [HttpPost]
        [Route("Login")]
        public async Task<IActionResult> Login([FromBody] LoginInputModel login)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _repository.LoginAsync(login);
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("VerifyOTP")]
        public async Task<IActionResult> VerifyOTP(OTPInputmodel otp)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _repository.VerifyOTPAsync(otp);

            return Ok(result);
        }

        [AllowAnonymous]
        [HttpGet]
        [Route("GetCountryList")]
        public async Task<IActionResult> GetCountryList()
        {
            var result = await _repository.GetCountryListAsync();
            //var url = HttpContext.Request.Scheme.ToLower() + "://" + HttpContext.Request.Host + "/image" + "/flag";
            var url = HttpContext.Request.Scheme.ToLower() + "://" + HttpContext.Request.Host + "/" + _settings.CountryFlagFolderName;
            //var url = HttpContext.Request.Scheme.ToLower() + "://" + HttpContext.Request.Host + "/" + _settings.RootFolderName + "/"+ _settings.ImageFolderName  + "/" + _settings.CountryFlagFolderName;
            if (result != null && result.Count > 0)
            {
                foreach (var item in result)
                {
                    if (!String.IsNullOrEmpty(item.Flag))
                    {
                        item.Flag = url + "/" + item.Flag;
                    }
                }
            }
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("RefreshToken")]
        public async Task<IActionResult> RefreshToken([FromBody] TokenRequestModel tokenRequest) {
            if (tokenRequest == null || string.IsNullOrEmpty(tokenRequest.Token)) {
                return BadRequest("Invalid token request.");
            }

            var refreshTokenResponse = new UserLoginResponse();
            refreshTokenResponse.Token = await _repository.RefreshToken(tokenRequest);

            if (refreshTokenResponse.Token == null) {
                return Unauthorized("Invalid refresh token.");
            }

            var refreshTokenResult = await _repository.RefreshTokenAsync(tokenRequest);
            return Ok(new { refreshTokenResult });
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("RefreshFCMToken")]
        public async Task<IActionResult> RefreshFCMToken([FromBody] FCMRefreshModel fCMRefreshModel)
        {

            var result = await _repository.RefreshFCMTokenAsync(fCMRefreshModel);
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("LoginSubPartner")]
        public async Task<IActionResult> LoginSubPartner([FromBody] SubPartnerLoginInputModel SubPartnerLoginInputModel) {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _repository.LoginSubPartner(SubPartnerLoginInputModel);
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpGet]
        [Route("ValidateReferralCode")]
        public async Task<IActionResult> ValidateReferralCode(string RefferalCode) {
            if (string.IsNullOrEmpty(RefferalCode))
                return BadRequest(new { Message = "Referral code is required." });

            var result = await _repository.ValidateReferralCode(RefferalCode);
            return Ok(result);
        }
        #endregion
    }
}
