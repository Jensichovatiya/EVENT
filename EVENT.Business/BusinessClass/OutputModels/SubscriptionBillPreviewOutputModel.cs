using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.OutputModels
{
    public class SubscriptionBillPreviewOutputModel
    {
        public long? PurchaseId { get; set; }
        public long? UserId { get; set; }
        public string? Name { get; set; }
        public string? EmailId { get; set; }
        public string? MobileNo { get; set; }
        public long? SubscriptionPlanId { get; set; }
        public string? PlanName { get; set; }
        public decimal Rate { get; set; }
        public decimal? GSTRate { get; set; }
        public decimal GSTAmount { get; set; }
        public decimal TotalRate { get; set; }
        public string? RateType { get; set; }
        public int? MaxAllowedExhibitionDays { get; set; }
        public decimal BeyondExhibitionDaysPerDayPrice { get; set; }
        public decimal BeyondMaxAllowedBoothPerBoothPrice { get; set; }
        public string? PancardNo { get; set; }
        public string? RazorpayOrderId { get; set; }
        public string? RazorpayPaymentId { get; set; }
        public string? RazorpaySignature { get; set; }
        public decimal PaidRate { get; set; }
        public string? MethodType { get; set; }
        public string? PaymentGatewayName { get; set; }
        public DateTime TransactionDate { get; set; }
        public string? PaymentMode { get; set; }
        public string? PaymentStatus { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public long? SrNo { get; set; }
        public string? CompanyName { get; set; }
        public string? GSTNo { get; set; }
        public string? Address { get; set; }
        public string? BankName { get; set; }
        public string? BankIFSC { get; set; }
        public string? BankACNo { get; set; }
        public long? NeedExtraBooth { get; set; }
        public long? NeedExtradays { get; set; }
        public long? EventId { get; set; }
        public string? PaymentModeName { get; set; }
        public string? PaymentStatusName { get; set; }
        public string? TransactionStatusName { get; set; }
        public long? MaxAllowedBooth { get; set; }
        public decimal ExtraBoothPrice { get; set; }
        public decimal ExtraDayPrice { get; set; }

    }
}
