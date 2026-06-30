using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace EVENT.Entities.DbClass {
    public class tbl_Event_Pass_Facility_Mapping {
        public long Id { get; set; }
        public long? PassId { get; set; }
        public long? FacilityId { get; set; }
        [XmlIgnore]
        public string? FacilityName { get; set; }
    }
}