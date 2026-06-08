using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.OutputModels {
    public class StallPreviewOutPutModel {
        public long ArrangementId { get; set; }
        public long EventId { get; set; }
        public string StallPrefix { get; set; }
        public long? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public int? SrNo { get; set; }
    }
}
