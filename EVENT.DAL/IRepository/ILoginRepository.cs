using EVENT.Business.BusinessClass.InputModels;
using EVENT.Business.BusinessClass.Lookup;
using EVENT.Business.BusinessClass.OutputModels;
using EVENT.Business.Login;
using EVENT.Core.Common.Enum;
using EVENT.Web.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.DAL.IRepository {
    public interface ILoginRepository
    {
        Task<RefreshFCMTokenOutputModel> RefreshFCMTokenAsync(FCMRefreshModel fCMRefreshModel);
        Task<List<CountryOutputModel>> GetCountryListAsync();
        Task<ResponseItem> LoginAsync(LoginInputModel login);
        Task<string> RefreshToken(TokenRequestModel tokenRequest);
        Task<UserLoginToken> RefreshTokenAsync(TokenRequestModel tokenRequest);
        Task<UserLoginResponse> VerifyOTPAsync(OTPInputmodel otp);
        Task<UserLoginResponse> LoginSubPartner(SubPartnerLoginInputModel SubPartnerLoginInputModel);
        Task<ValidateReferralCodeOutput> ValidateReferralCode(string RefferalCode);

    }
}
