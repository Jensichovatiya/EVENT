using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.OutputModels {
    public class BookingFilterGetTicketTypeOutputModel {
        public long PassId { get; set; }
        public string PassName { get; set; }
    }
    public class BookingFilterGetLocationOutputModel {
        public long LocationId { get; set; }
        public string LocationName { get; set; }
    }
}
