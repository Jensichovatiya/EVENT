using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.OutputModels {
    public class LocationPreviewOutputModel {
        public long LocationId { get; set; }
        public long? EventId { get; set; }
        public long? DateId { get; set; }
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
        public string StateName { get; set; }
        public string CityName { get; set; }
    }
}
