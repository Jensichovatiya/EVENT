using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.InputModels
{
    public class RazorOrderInputModel
    {
        public long UserId { get; set; }
        public int AmountInPaise { get; set; }
    }
    public class RazorPaymentCheckInput
    {
        public string RazorpayPaymentId { get; set; }
    }
}
