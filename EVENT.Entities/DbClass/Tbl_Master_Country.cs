using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass
{
    public class tbl_Master_Country {
        public int CountryId { get; set; }
        public string CountryName { get; set; }
        public bool IsActive { get; set; }
        public string CountryCode { get; set; }
        public string DialCode { get; set; }
        public string CurrencySymbol { get; set; }
        public string Flag { get; set; }
    }
}
