using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass
{
    public class tbl_Manual_pass
    {
        public long Id { get; set; }
        public long BookingId {  get; set; }
        public long? EventId { get; set; }
        public string? VisitorPassNo { get; set; }

        public long PassId { get; set; }
        public string ItemType {  get; set; }
        public decimal Price { get; set; }
        public int Quantity {  get; set; }
        public decimal TotalAmount { get; set; }
        public long? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate {  get; set; }

        public long? SrNo { get; set; }
    }
}
