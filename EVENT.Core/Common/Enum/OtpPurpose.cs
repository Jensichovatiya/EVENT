using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Core.Common.Enum {
    public enum OtpPurpose {
        Registration = 1,
        Login = 2,       
        ForgotPassword = 3,
        ResendRegistrationOtp = 4,
        ResendLoginOtp = 5,
        ResendForgotPasswordOtp = 6,
    }
}
