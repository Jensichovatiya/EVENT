using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.InputModels {
    public class GetBookingDetailsInputModel {
        public string? SearchText { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? StartEndTime { get; set; }
        public long? EventId { get; set; }
        public string? TicketType { get; set; }
        public string? PaymentStatus { get; set; }
        public string? Location { get; set; }
        public int PageSize { get; set; }
        public int PageNo { get; set; }
    }
}
