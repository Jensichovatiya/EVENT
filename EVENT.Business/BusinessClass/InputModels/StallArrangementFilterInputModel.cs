using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.InputModels {
    public class StallArrangementFilterInputModel {
        public long EventId { get; set; }
        public string EventDate { get; set; }
        public long ZoneId { get; set; }
        public string ItemType { get; set; }
    }
}
