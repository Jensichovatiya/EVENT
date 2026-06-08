using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass {
    
    public class tbl_Role_Wise_Module_Access {
        public int RoleId { get; set; }
        public int ModuleId { get; set; }
        public string? ModuleName { get; set; }
        public bool IsRead { get; set; }    
        public bool IsWrite { get; set; }
    }
}