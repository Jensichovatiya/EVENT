using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass {
    public class tbl_Event_Tranport_Route {
        public long RouteId { get; set; }
        public long EventId { get; set; }
        public int? TripType { get; set; }
        public long? VehicleId { get; set; }
        public long? DriverId { get; set; }
        public string? FromDestination { get; set; }
        public string? ToDestination { get; set; }
        public DateTime? Date { get; set; }
        public string? AvailableTimeFrom { get; set; }
        public string? AvailableTimeTo { get; set; }
        public int? PersonCapacity { get; set; }
        public string? Description { get; set; }
        public long? EntryBy { get; set; }
        public long? UpdateBy { get; set; }
        public decimal? IsDeleted { get; set; }
        public long? DeletedBy { get; set; }

        public DateTime? DeletedDate { get; set; }

    }
}
