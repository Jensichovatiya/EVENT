using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass {
    
    public class tbl_Master_Module {
        public int ModuleId { get; set; }
        public string ModuleName { get; set; }    
        public bool IsActive { get; set; }
    }
}