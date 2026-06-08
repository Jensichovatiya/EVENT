using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass {
    public class tbl_Visitor_Pass {
        public long VisitorPassId { get; set; }
        public string VisitorPassNo { get; set; }
        public long? BookingId { get; set; }
        public int? EventId { get; set; }
        public string PersonName { get; set; }
        public string DialCode { get; set; }
        public string MobileNo { get; set; }
        public string EmailId { get; set; }
        public long? PassId { get; set; }
        public bool? IsUsed { get; set; }
        public bool? IsMultipleEntryAllowed { get; set; }
        public long? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
    }
}
