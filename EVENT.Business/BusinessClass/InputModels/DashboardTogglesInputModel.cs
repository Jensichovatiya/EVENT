using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.InputModels
{
    public class DashboardTogglesInputModel
    {
        public long EventId { get; set; }
        public long UserId { get; set; }
        public string ValidateType { get; set; }
        public bool ValidateTypeValue { get; set; }
    }
}
