using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass
{
    public class tbl_Subscription_Plan_Purchase_History
    {
        public long Id { get; set; }
        public long? UserId { get; set; }
        public long? SubscriptionPlanId { get; set; }
        public long? RazorPayId { get; set; }
        public DateTime? TransactionDate { get; set; }
        public string? TransactionStatus { get; set; }
        public string? PaymentMode { get; set; }
        public string? PaymentStatus { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public long? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public long? NeedExtraBooth { get; set; }
        public long? NeedExtradays { get; set; }
        public decimal ExtraBoothPrice { get; set; }
        public decimal ExtraDayPrice { get; set; }

    }
}
