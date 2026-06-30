using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.OutputModels {
    public class subpartnerlist {
        public int Id { get; set; }             
        public string Name { get; set; }     
        public string Role { get; set; }  
        public int UserRole { get; set; } 
        public string EntryBy { get; set; } 
        public DateTime? EntryDate { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string UpdateBy { get; set; }
        public string UserType {  get; set; }
        public string PartnerId { get; set; }
        public string Password { get; set; }


    }
}
