using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass
{
    public class tbl_Event_Location_Documents
    {
        public long? DocumentId { get; set; }
        public long? LocationId { get; set; }
        public string? DocumentName { get; set; }
        public string? DocumentType { get; set; }
        public string? DocumentDetails { get; set; }
    }

}
