using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass
{
    public class tbl_Event_SecurityStaff
    {
        public long StaffId { get; set; }
        public long EventId { get; set; }
        public long SecurityCompanyId { get; set; }
        public string? ImageFile { get; set; }
        public string StaffName { get; set; }
        public string DialCode { get; set; }
        public string MobileNumber { get; set; }
        public string Designation { get; set; }
        public string SecurityType { get; set; }
        public string Experience { get; set; }
        public string Description { get; set; }
        public bool? isDeleted { get; set; }
        public long? DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }
    }
}
