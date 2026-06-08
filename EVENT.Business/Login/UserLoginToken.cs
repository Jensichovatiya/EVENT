using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.Login {
    public class UserLoginToken {
        public long UserId { get; set; }
        public string? Token { get; set; }
        public bool Status { get; set; }
        public string Message { get; set; }
    }
}
