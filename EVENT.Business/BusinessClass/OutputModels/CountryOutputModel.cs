using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.OutputModels
{
    public class CountryOutputModel
    {
        public int CountryId { get; set; }
        public string CountryName { get; set; }
        public string DialCode { get; set; }
        public string Flag { get; set; }
        public bool IsActive { get; set; }
    }
}
