using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;


namespace EVENT.Entities.DbClass {
    public class tbl_Event_Master_Pass {
        public long PassId { get; set; }
        public long? EventId { get; set; }
        public string PassName { get; set; }
        public string PassType { get; set; }
        public int  PriceType { get; set; }
        public decimal? Price { get; set; }
        public int? MinimumPasses { get; set; }
        public int? MaximumPasses { get; set; }
        public long? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public int PassForDateType { get; set; }
        public DateTime PassForDate { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        // [JsonIgnore]
        public string? FacilitieIds { get; set; }
        public string? FacilitiesDisplay { get; set; }
        public List<tbl_Event_Pass_Facility_Mapping> tbl_Event_Pass_Facility_Mapping { get; set; }

    }
}