using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass {
    public class tbl_Event_TransportDriver {
        public long DriverId { get; set; }
        public long EventId { get; set; }
        public string DriverName { get; set; }
        public string? DialCode { get; set; }
        public string? MobileNo { get; set; }
        public string? LicenseNumber { get; set; }
        public string? PayoutType { get; set; }
        public string? DriverReferenceBy { get; set; }
        public string? ReferenceDialCode { get; set; }
        public string? ReferenceMobileNo { get; set; }
        public string? FrontLicenseImage { get; set; }
        public string? BackLicenseImage { get; set; }
        public string? Description { get; set; }
        public decimal? Payout { get; set; }
        public DateTime? PaymentDate { get; set; }
        public string? PaymentType { get; set; }
        public string? TransactionId { get; set; }
        public long? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public bool? IsDeleted { get; set; }
        public long? DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }
        public string? ImageFile { get; set; }
    }
}
