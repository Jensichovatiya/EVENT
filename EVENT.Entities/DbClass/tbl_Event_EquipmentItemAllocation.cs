using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass
{
    public class tbl_Event_EquipmentItemAllocation
    {
        public long Id { get; set; }
        public long EventId { get; set; }
        public long EquipmentItemId { get; set; }
        public long EquipmentStallId { get; set; }
        public string TicketType { get; set; }
        public decimal Price { get; set; }
        public long? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
    }
}
