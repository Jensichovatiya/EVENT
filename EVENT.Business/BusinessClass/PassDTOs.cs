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
        public DateTime SlotDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }
        public string SlotName { get; set; } = string.Empty;
        public string SeatNo { get; set; } = string.Empty;
        public string ZoneName { get; set; } = string.Empty;
        public string QRCode { get; set; } = string.Empty;
        public string HolderName { get; set; } = string.Empty;
        public string HolderEmail { get; set; } = string.Empty;
        public bool IsValid { get; set; }

        // Event Location details
        public string VenueName { get; set; } = string.Empty;
        public string AddressLine1 { get; set; } = string.Empty;
        public string AddressLine2 { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string GoogleMapLink { get; set; } = string.Empty;
    }

    public class PassValidateRequest
    {
        public string PassCode { get; set; } = string.Empty;
    }

    public class PassValidateResponse
    {
        public bool IsValid { get; set; }
        public string Message { get; set; } = string.Empty;
        public long PassId { get; set; }
        public string PassCode { get; set; } = string.Empty;
        public long BookingId { get; set; }
        public long EventId { get; set; }
        public string EventName { get; set; } = string.Empty;
        public long SlotId { get; set; }
        public DateTime SlotDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }
        public string SlotName { get; set; } = string.Empty;
        public string SeatNo { get; set; } = string.Empty;
        public string ZoneName { get; set; } = string.Empty;
        public string QRCode { get; set; } = string.Empty;
        public string HolderName { get; set; } = string.Empty;
        public string HolderEmail { get; set; } = string.Empty;

        // Event Location details
        public string VenueName { get; set; } = string.Empty;
        public string AddressLine1 { get; set; } = string.Empty;
        public string AddressLine2 { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string GoogleMapLink { get; set; } = string.Empty;
    }

    public class ScanRequest
    {
        public string PassCode { get; set; } = string.Empty;
        public string DeviceIdentifier { get; set; } = string.Empty;
        public long ScannerUserId { get; set; }
    }

    public class ScanLogResponse
    {
        public long LogId { get; set; }
        public string PassCode { get; set; } = string.Empty;
        public string AttendeeName { get; set; } = string.Empty;
        public string HolderName { get; set; } = string.Empty;
        public string EventName { get; set; } = string.Empty;
        public DateTime ScanTime { get; set; }
        public DateTime ScanDate { get; set; }
        public string ScanStatus { get; set; } = string.Empty;
        public int Status { get; set; }
        public string ScannerUserName { get; set; } = string.Empty;
        public string ValidationMessage { get; set; } = string.Empty;
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
