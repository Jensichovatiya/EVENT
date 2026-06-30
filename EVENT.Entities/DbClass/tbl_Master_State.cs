using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass {
    public class tbl_Master_State {
        public int StateId { get; set; }
        public string StateName { get; set; }
        public int? CountryId { get; set; }
        public bool? IsActive { get; set; }

    }
}