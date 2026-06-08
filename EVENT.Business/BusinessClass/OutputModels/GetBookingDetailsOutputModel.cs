using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.OutputModels {
    public class GetBookingDetailsOutputModel {
        public long BookingId { get; set; }

        public string ThumbnaileImage { get; set; }
        public string EventName { get; set; }
        public string EventDate { get; set; }
        public string EventTime { get; set; }
        public string TransactionId { get; set; }
   
        public long EventId { get; set; }
        public string FirstName { get; set; }
        public string DialCode { get; set; }
        public string MobileNo { get; set; }
        public string EmailId { get; set; }
        public string BookingDate { get; set; }
        public int BookingType { get; set; }
        public string BookingTypeDesc { get; set; }
        public long PassId { get; set; }
        public int Qty { get; set; }
        public decimal Fees { get; set; }
        public string Status { get; set; }
        public string PaymentStatus { get; set; }
    }
}
