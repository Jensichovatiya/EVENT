using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.OutputModels {
    public class GetStallsTypeOutputModel {
        public long EventId { get; set; }
        public string StallType { get; set; }
        public string StallNo { get; set; }
        public long MainStallId {get; set; }

    }
}
