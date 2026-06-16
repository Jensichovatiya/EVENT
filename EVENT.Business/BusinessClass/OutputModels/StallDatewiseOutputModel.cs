using EVENT.Entities.DbClass;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.OutputModels {
    public class StallDatewiseOutputModel {
        public List<tbl_Event_StallArrangement> stallArrangements { get; set; }

    }
}
