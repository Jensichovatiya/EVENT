using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass
{
    public class tbl_Master_General
    {
        public string CodeType { get; set; }
        public string CodeId { get; set; }
        public string CodeDesc { get; set; }
        public string CodeAccess { get; set; }
        public string StatusCode { get; set; }
        public DateTime EntryDate { get; set; }
        public string EntryBy { get; set; }
        public DateTime? LastUpdatedDate { get; set; }
        public string LastUpdatedBy { get; set; }
        public decimal? noofdigits { get; set; }
        public decimal? noofchar { get; set; }
        public string codefor { get; set; }
    }
}
