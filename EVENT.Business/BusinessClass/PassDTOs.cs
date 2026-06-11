using System;

namespace EVENT.Business.BusinessClass
{
    public class PassGenerateRequest
    {
        public long BookingId { get; set; }
        public string PassType { get; set; } = "GENERAL"; // "VIP", "GENERAL"
    }

    public class PassResponse
    {
        public long PassId { get; set; }
        public string PassCode { get; set; } = string.Empty;
        public long BookingId { get; set; }
        public string EventName { get; set; } = string.Empty;
        public string AttendeeName { get; set; } = string.Empty;
        public string PassType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime GeneratedDate { get; set; }
    }

    public class PassValidateRequest
    {
        public string PassCode { get; set; } = string.Empty;
    }

    public class PassValidateResponse
    {
        public bool IsValid { get; set; }
        public string Message { get; set; } = string.Empty;
        public string AttendeeName { get; set; } = string.Empty;
        public string EventName { get; set; } = string.Empty;
    }

    public class ScanRequest
    {
        public string PassCode { get; set; } = string.Empty;
        public string DeviceIdentifier { get; set; } = string.Empty;
    }

    public class ScanLogResponse
    {
        public long LogId { get; set; }
        public string PassCode { get; set; } = string.Empty;
        public string AttendeeName { get; set; } = string.Empty;
        public string EventName { get; set; } = string.Empty;
        public DateTime ScanTime { get; set; }
        public string ScanStatus { get; set; } = string.Empty;
    }

    public class AttendanceReportResponse
    {
        public long EventId { get; set; }
        public string EventName { get; set; } = string.Empty;
        public int TotalBooked { get; set; }
        public int ScannedIn { get; set; }
        public int Pending { get; set; }
    }
}
