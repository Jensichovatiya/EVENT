using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.Login {
    public class UserLoginResponse {
        public bool Status{ get; set; }
        public string Message { get; set; }
        public string Token { get; set; }
        public long UserId { get; set; }
        public string? MobileNo { get; set; }
        public int? UserRole { get; set; }
        public int? UserSubRole { get; set; }
    }
}
