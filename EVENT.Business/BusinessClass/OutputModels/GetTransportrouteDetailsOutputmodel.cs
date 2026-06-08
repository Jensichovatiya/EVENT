using EVENT.Entities.DbClass;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.OutputModels {
    public class GetTransportrouteDetailsOutputmodel {
        public long RouteId { get; set; }
        public long EventId { get; set; }
        public int? TripType { get; set; }
        public long? VehicleId { get; set; }
        public string? VehicleName {  get; set; }
        public long? DriverId { get; set; }
        public string? DriverName { get; set; }
        public string? FromDestination { get; set; }
        public string? ToDestination { get; set; }
        public DateTime? Date { get; set; }
        public string? AvailableTimeFrom { get; set; }
        public string? AvailableTimeTo { get; set; }
        public int? PersonCapacity { get; set; }
        public string? Description { get; set; }
        public long? EntryBy { get; set; }
        public long? UpdateBy { get; set; }
        public List<tbl_Event_Transport_MultipleRoundTrip_PickPoint>? PickPoints {  get; set; }
    }
}
