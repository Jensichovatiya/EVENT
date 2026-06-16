using EVENT.Entities.DbClass;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.InputModels
{
    public class LoginInputModel
    {
        [Required]
        [RegularExpression(@"^\+?\d+$", ErrorMessage = "Dial code must start with '+' followed by numbers.")]
        public string DialCode { get; set; }

        [Required]
        [RegularExpression(@"^\d+$", ErrorMessage = "Mobile number must contain only numbers.")]
        public string MobileNo { get; set; }

        public string DeviceId { get; set; } 

       /* public string FCMToken { get; set; }*/
        //public List<tbl_Master_Country>? dialCodeList { get; set; } //commented by Jitesh
    }
}
