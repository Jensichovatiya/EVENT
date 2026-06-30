using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.OutputModels
{
    public class RefreshFCMTokenOutputModel
    {
        public string? Message { get; set; }
        public bool Status { get; set; }
        public long UserId { get; set; }
        public string? FCM_Token { get; set; }
        public string MobileNo { get; set; }
    }
}
