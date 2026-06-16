using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass
{
    public class tbl_Event_FoodItemAllocation
    {
        public long Id { get; set; }
        public long EventId { get; set; }
        public long FoodItemId { get; set; }
        public long FoodStallId { get; set; }
        public string TicketType { get; set; }
        public decimal Price { get; set; }
        public long? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
    }
}
