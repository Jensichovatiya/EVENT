using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass {
    public class tbl_Manual_Booking {
        public long BookingId { get; set; }
        public long EventId { get; set; }
        public int PassType { get; set; }
        public string EventDate { get; set; }
        public int Qty { get; set; }
        public decimal TotalAmount { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string EmailId { get; set; }
        public string DialCode { get; set; }
        public string MobileNo { get; set; }
        public bool PrivacyPolicy { get; set; }
        public long? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public List<tbl_Manual_pass> Passes { get; set; }
    }
}
