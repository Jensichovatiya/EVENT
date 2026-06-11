namespace EVENT.Business.BusinessClass
{
    public class RevenueReportResponse
    {
        public string EventName { get; set; } = string.Empty;
        public string EventCode { get; set; } = string.Empty;
        public int TotalBookings { get; set; }
        public decimal TotalRevenue { get; set; }
    }

    public class BookingReportResponse
    {
        public string EventName { get; set; } = string.Empty;
        public int SlotsCount { get; set; }
        public int TicketsBooked { get; set; }
        public int RemainingCapacity { get; set; }
    }
}
