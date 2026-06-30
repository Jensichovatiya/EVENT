using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass {
    public class tbl_Event_Transport_MultipleRoundTrip_PickPoint {
        public long Id { get; set; }
        public long? EventId { get; set; }
        public long? RouteId { get; set; }
        public string? FromDestination { get; set; }
        public string? AvailableTimeFrom { get; set; }
        public long? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
         public long? SrNo { get; set; }
    }
}
