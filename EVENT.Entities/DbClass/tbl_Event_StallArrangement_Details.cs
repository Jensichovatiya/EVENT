using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass {
    public class tbl_Event_StallArrangement_Details {
        public long Id { get; set; }
        public long EventId { get; set; }
        public long? ArrangementId { get; set; }
        public string? ItemType { get; set; }
        public int NoOfItem { get; set; }
        public int? PerItemPerson { get; set; }
        public int? TotalPerson { get; set; }
        public decimal PerPersonPrice { get; set; }
        public decimal TotalAmount { get; set; }
        public long? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? Description {  get; set; }
        public long? SrNo { get; set; } 
    }
}
