using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.Lookup {
    public class ValidateReferralCodeOutput {
        public bool Status { get; set; }
        public string Message { get; set; }
        public long? ReferredByUserId { get; set; }
    }
}
