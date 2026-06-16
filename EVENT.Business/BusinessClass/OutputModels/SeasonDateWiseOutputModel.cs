using EVENT.Entities.DbClass;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.OutputModels {
    public class SeasonDateWiseOutputModel {
        public List<tbl_Event_SeasonPass> seasonPasses { get; set; }
    }
}
