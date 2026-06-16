using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.InputModels
{
    public class OTPInputmodel
    {
        public long UserId { get; set; }
        [RegularExpression(@"^\+?\d+$", ErrorMessage = "Dial code must start with '+' followed by numbers.")]
        public string DialCode { get; set; }

        [RegularExpression(@"^\d+$", ErrorMessage = "Mobile number must contain only numbers.")]
        public string MobileNo { get; set; }
        public string DeviceId { get; set; }

        [Required]
        [RegularExpression(@"^\d{6}$", ErrorMessage = "OTP must be a 6-digit number.")]
        public string OTP { get; set; }
        public string FCMToken { get; set; }
    }
}
