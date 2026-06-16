using EVENT.Entities.DbClass;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.InputModels {
    public class RegisterUserInputModel {
        public long Id { get; set; }
        [Required]
        [RegularExpression(@"^[a-zA-Z\s]+$", ErrorMessage = "Fullname must contain only alphabetic characters and spaces.")]
        public string Fullname { get; set; }
        [Required]
        [RegularExpression(@"^\+?\d+$", ErrorMessage = "Dial code must start with '+' followed by numbers.")]
        public string DialCode { get; set; }
        [Required]
        [RegularExpression(@"^\d+$", ErrorMessage = "Mobile number must contain only numbers.")]
        public string MobileNo { get; set; }
        public string RefferedByRefferalCode { get; set; }
        [Required]
        public bool IsAgreedToTerms { get; set; }
        [Required]
        public int UserRole { get; set; }
        [Required]
        [EmailAddress(ErrorMessage = "Invalid Email Address")]
        public string EmailId { get; set; }

        public long? EntryBy { get; set; }
        public List<tbl_Master_Country>? dialCodeList { get; set; }
    }
}
