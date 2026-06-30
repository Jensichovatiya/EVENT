using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.InputModels
{
    public class SubscriptionPurchaseFilterInputModel
    {
        public int UserId { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public string? PaymentStatus { get; set; }
    }
}
