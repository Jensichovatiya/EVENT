using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass {
    
    public class tbl_Master_Role {
        public int Id { get; set; }
        public string Role { get; set; }    
        public bool IsActive { get; set; }
        public long EntryBy { get; set; }
        public string? EntryByName { get; set; }
        public DateTime EntryDate { get; set; }
        public bool IsAllowToCreateSubPartner { get; set; }
    }
}