using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.InputModels
{
    public class TokenRequestModel
    {
        [Required]
        public string Token { get; set; }
        [Required]
        [RegularExpression(@"^\d+$", ErrorMessage = "UserId must contain only numbers.")]
        public long UserId { get; set; }
        [Required]
        [RegularExpression(@"^\d+$", ErrorMessage = "Mobile number must contain only numbers.")]
        public string MobileNo { get; set; }
    }
}
