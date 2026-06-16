using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.Login {
    public class VerifyOtpRequest {
        public string RefKey { get; set; }
        public string Otp { get; set; }
        /// <summary>
        /// In case of Change Password With Otp
        /// </summary>
        public string? NewPassword { get; set; }
        [Required]
        public int RoleId { get; set; }
    }
}
