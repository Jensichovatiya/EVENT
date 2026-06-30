using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.OutputModels {
    public class ApplyCouponOutputModel {
        public int UserId { get; set; }
        public int CouponId { get; set; }
        public string CouponCode { get; set; }
        public double PlanAmount { get; set; }
        public double DiscountAmount { get; set; }
        public double FinalAmount { get; set; }
        public double PreTaxAmount { get; set; }
        public double? SGST { get; set; }
        public double? CGST { get; set; }
        public double? IGST { get; set; }
        public double? SGSTAmount { get; set; }
        public double? CGSTAmount { get; set; }
        public double? IGSTAmount { get; set; }
        public double? GrossAmount { get; set; }
        public bool IsSuccess { get; set; }
        public string Message { get; set; }
    }
}
