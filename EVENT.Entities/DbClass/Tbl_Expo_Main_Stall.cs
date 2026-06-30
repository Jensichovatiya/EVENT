using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass
{
    public class tbl_Event_Main_Stall {
		public long MainStallId { get; set; }
		public long EventId { get; set; }
		public long ArrangementId { get; set; }
		public string StallNo { get; set; }
		public long ZoneId { get; set; }
		public long SizeId { get; set; }
		public long EntryBy { get; set; }
		public DateTime EntryDate { get; set; }
		public long? UpdateBy { get; set; }
		public DateTime? UpdateDate { get; set; }
		public bool? IsBooked { get; set; }
		public DateTime? BookingDate { get; set; }
		public long? BookedBy { get; set; }
		public long? BookedFor { get; set; }
		public long? BookingId { get; set; }
	}
}
