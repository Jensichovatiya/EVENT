using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace EVENT.Entities.DbClass {
    public class tbl_Event_Private_Invite {
        public long Id { get; set; }
        public long EventId { get; set; }
        [XmlIgnore]
        public string? Name { get; set; }
        public string? MobileNo { get; set; }
        public string? EmailId { get; set; }
        public bool? IsDelete { get; set; }
        public long? DaleteBy { get; set; }
        public DateTime? DaleteDate { get; set; }
        public long? EntryBy { get; set; }
        public DateTime EntryDate { get; set; }
        [XmlIgnore]
        public long? SrNo { get; set; }
    }
}
