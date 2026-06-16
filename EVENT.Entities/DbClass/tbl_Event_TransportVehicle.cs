using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace EVENT.Entities.DbClass {
    public class tbl_Event_TransportVehicle {
        public long VehicleId { get; set; }
        public long EventId { get; set; }
        public string VehicleName { get; set; }
        public string? VehicleType { get; set; }
        public string VehicleNumber { get; set; }
        public int? PersonCapacity { get; set; }
        public string? PayoutType { get; set; }
        public string? ImageFile { get; set; }
        public string? Description { get; set; }
        public decimal? Payout { get; set; }
        public DateTime? PaymentDate { get; set; }
        public string? PaymentType { get; set; }
        public string? TransactionId { get; set; }
        public long? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public bool? IsDeleted { get; set; }
        public long? DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }
        public string? RCbookFrontPhoto { get; set; }
        public string? RCbookBackPhoto { get; set; }

        [XmlIgnore]
        [NotMapped]
        public string? PayoutName { get; set; }
        [XmlIgnore]
        [NotMapped]
        public string? VehicleTypeName { get; set; }
        [XmlIgnore]
        [NotMapped]
        public string? PaymentModeName { get; set; }
    }
}
