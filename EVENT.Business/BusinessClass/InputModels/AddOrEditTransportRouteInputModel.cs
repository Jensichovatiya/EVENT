using EVENT.Entities.DbClass;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.InputModels {
    public class AddOrEditTransportRouteInputModel {
        public tbl_Event_Tranport_Route TransportRoute { get; set; }
        public List<tbl_Event_Transport_MultipleRoundTrip_PickPoint>? PickPoints { get; set; }
    }
}
