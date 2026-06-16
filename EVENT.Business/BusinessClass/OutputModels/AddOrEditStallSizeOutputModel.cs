using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.OutputModels {
    public class AddOrEditStallSizeOutputModel {
        public int ResultStatus { get; set; }
        public string ResultMessage { get; set; }
        public long Id { get; set; }

    }
}