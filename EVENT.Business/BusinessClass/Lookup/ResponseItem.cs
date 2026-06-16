using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.Lookup {
    public class ResponseItem {
        public bool Status { get; set; }
        public string Message { get; set; }
        public string UserId { get; set; }
        public string OTP { get; set; }
    }
}
