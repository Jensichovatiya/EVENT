using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.Login {
    public class LoginOtpGenerateRequest {
        public string MobileNo { get; set; }
        public int Purpose { get; set; }
        public string? RefKey { get; set; }
    }
}
