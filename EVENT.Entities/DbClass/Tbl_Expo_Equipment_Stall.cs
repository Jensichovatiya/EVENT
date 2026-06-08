using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass {
    public class tbl_Event_Equipment_Stall {
        public long EquipmentStallId { get; set; }
        public long EventId { get; set; }
        public string EquipmentStallNo { get; set; }
        public string EquipmentStallName { get; set; }
        public string OwnerName { get; set; }
        public string DialCode { get; set; }
        public string MobileNumber { get; set; }
        public int AddBy { get; set; }
        public string Description { get; set; }
        public long EntryBy { get; set; }
        public long SubPartnerId { get; set; }
        public DateTime EntryDate { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
    }
}
