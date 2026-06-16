using EVENT.Entities.DbClass;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace EVENT.Business.BusinessClass.OutputModels {
    public class GetLocationOutputModel {
        public long LocationId { get; set; }
        public long? EventId { get; set; }
        public string? EventDate { get; set; }
        public string StreetNameFlatNo { get; set; }
        public string AreaName { get; set; }
        public int? Pincode { get; set; }
        public long? CityId { get; set; }
        public long? StateId { get; set; }
        public long? CountryId { get; set; }
        public string ManualAddress { get; set; }
        public string TermsAndConditions { get; set; }
        public string PermissionLetterDetails { get; set; }
        public string Latitude { get; set; }
        public string Longitude { get; set; }
        public long? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? CountryName { get; set; }
        public string? StateName { get; set; }
        public string? CityName { get; set; }
        [XmlIgnore]
        [NotMapped]
        public string? EventName { get; set; }
        public List<tbl_Event_Location_Documents> TELD { get; set; }
    }
}
