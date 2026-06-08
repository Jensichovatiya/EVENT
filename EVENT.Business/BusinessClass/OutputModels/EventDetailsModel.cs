using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.OutputModels {
    public class EventDetailsModel {
        public string EventName { get; set; }
        public string? StartDateDisplay { get; set; }
        public string? EndDateDisplay { get; set; }

        public string? StartTimeDisplay { get; set; }
        public string? EndTimeDisplay { get; set; }
        public string? UserName { get; set; }
    }
}
