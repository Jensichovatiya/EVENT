using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass {
    public class tbl_Event_Stall {
            public long StallId { get; set; }
            public long? EventId { get; set; }
            public string? Date { get; set; }
            public string? ImageFile { get; set; }
            public string? Number { get; set; }
            public string? Name { get; set; }
            public string? Owner { get; set; }
        public string? Type {  get; set; }
            public string? Description { get; set; }
            public long? EntryBy { get; set; }
            public DateTime? EntryDate { get; set; } 
            public long? UpdateBy { get; set; }
            public DateTime? UpdateDate { get; set; }
            public bool? IsDeleted { get; set; }
            public long? DeletedBy { get; set; }
            public DateTime? DeletedDate { get; set; }
        public string CompanyName { get; set; }
        public string MobileNo { get; set; }
        public string Website { get; set; }
        public string Designation { get; set; }

    }
}
