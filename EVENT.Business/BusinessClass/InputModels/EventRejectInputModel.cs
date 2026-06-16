using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.InputModels {
    public class EventRejectInputModel {
        public long RejectEventId { get; set; }
        public int EventStatus { get; set; }
        public string RejectionReason { get; set; }

    }
}
