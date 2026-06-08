using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass
{
    public class tbl_Event_ServiceAgency
    {
        public long ServiceAgencyId { get; set; }
        public long EventId { get; set; }
        public string ServiceAgencyName { get; set; }
        public string? ImageFile { get; set; }
        public string DialCode { get; set; }
        public string MobileNumber { get; set; }
        public string EmailId { get; set; }
        public long TotalStaffMember { get; set; }
        public string? SubPartner { get; set; }
        public string Description { get; set; }
        public decimal Payout { get; set; }
        public DateTime PaymentDate { get; set; }
        public string PaymentType { get; set; }
        public string TransactionId { get; set; }
        public long EntryBy { get; set; }
        public DateTime EntryDate { get; set; }
        public long UpdateBy { get; set; }
        public DateTime UpdateDate { get; set; }
        public bool? isDeleted { get; set; }
        public long? DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }
    }
}
