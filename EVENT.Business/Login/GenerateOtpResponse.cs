using EVENT.Business.BusinessClass.Lookup;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.Login {
    public class GenerateOtpResponse : ResponseItem {
        public string RefKey { get; set; }
    }
}
