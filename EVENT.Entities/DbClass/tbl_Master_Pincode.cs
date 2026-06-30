using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass {
    public class tbl_Master_Pincode {
        public long PincodeId { get; set; }
        public int Pincode { get; set; }
        public int DistrictId { get; set; }
        public int StateId { get; set; }
        public string Area { get; set; }
        public int CountryId { get; set; }
        public bool IsActive { get; set; }
    }
}