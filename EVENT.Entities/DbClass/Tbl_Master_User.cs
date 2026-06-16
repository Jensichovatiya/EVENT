using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass
{
    public class tbl_Master_User
    {
        [Key]
        public long Id { get; set; }
        public string Name { get; set; }
        public int UserType { get; set; }
        public int UserRole { get; set; }
        public string MobileNo { get; set; }
        public string EmailId { get; set; }
        public bool IsActive { get; set; }
        public string DialCode { get; set; }
        public bool MobileConfirmation { get; set; }
        public bool EmailConfirmation { get; set; }
        public string RefferedByRefferalCode { get; set; }
        public string RefferalCode { get; set; }
        public long EntryBy { get; set; }
        public DateTime EntryDate { get; set; }
        public int EntryFrom { get; set; }
        public long UpdateBy { get; set; }
        public DateTime UpdateDate { get; set; }
        public bool IsAgreedToTerms {  get; set; }
    }
}
