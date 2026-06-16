using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass {
    public class tbl_Event_Booking_Schedule_Group_Discount {
        public long GroupDiscountId { get; set; }
        public long? EventId { get; set; }
        public long? ScheduleId { get; set; }
        public int? MinimumStall { get; set; }
        public decimal? DiscountRate { get; set; }
        public string DiscountType { get; set; }
        public long? SrNo { get; set; }
    }

}