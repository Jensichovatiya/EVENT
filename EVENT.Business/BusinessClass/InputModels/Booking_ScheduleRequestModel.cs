using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EVENT.Entities.DbClass;

namespace EVENT.Business.BusinessClass.InputModels {
    public class Booking_ScheduleRequestModel {
        public tbl_Event_Booking_Schedule tbl_Event_Booking_Schedule { get; set; }
        public List<tbl_Event_Booking_Schedule_Group_Discount> tbl_Event_Booking_Schedule_Group_Discount { get; set; }
    }
}