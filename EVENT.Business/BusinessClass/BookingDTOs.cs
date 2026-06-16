using System;
using System.Collections.Generic;

namespace EVENT.Business.BusinessClass
{
    public class BookingRequest
    {
        public long BookingId { get; set; }
        public string BookingRId { get; set; } = string.Empty;
        public long EventId { get; set; }
        public long SlotId { get; set; }
        public long ZoneId { get; set; }
        public long UserId { get; set; }
        public int TotalTickets { get; set; }
        public int BookingStatus { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal? TaxAmount { get; set; }
        public decimal? DiscountAmount { get; set; }
        public decimal? FinalAmount { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public string CreatedFrom { get; set; } = string.Empty;
        public string UpdatedBy { get; set; } = string.Empty;
        public string UpdatedFrom { get; set; } = string.Empty;
        public List<long> SelectedSlotIds { get; set; } = new List<long>();
        public List<AttendeeDTO> Attendees { get; set; } = new List<AttendeeDTO>();
    }

    public class AttendeeDTO
    {
        public string AttendeeName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string SeatNo { get; set; } = string.Empty;
    }

    public class BookingResponse
    {
        public long BookingId { get; set; }
        public string BookingRId { get; set; } = string.Empty;
        public string BookingReference { get; set; } = string.Empty;
        public long EventId { get; set; }
        public string EventName { get; set; } = string.Empty;
        public long SlotId { get; set; }
        public long UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int TotalTickets { get; set; }
        public decimal TotalAmount { get; set; }
        public string BookingStatus { get; set; } = string.Empty;
        public DateTime BookingDate { get; set; }
        public List<AttendeeResponse> Attendees { get; set; } = new List<AttendeeResponse>();
    }

    public class AttendeeResponse
    {
        public long AttendeeId { get; set; }
        public long BookingId { get; set; }
        public string AttendeeName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string SeatNo { get; set; } = string.Empty;
    }

    public class CancelBookingRequest
    {
        public long BookingId { get; set; }
        public string BookingRId { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
    }

    public class SeatAvailabilityRequest
    {
        public long EventId { get; set; }
        public long SlotId { get; set; }
    }

    public class SeatAvailabilityResponse
    {
        public long EventId { get; set; }
        public long SlotId { get; set; }
        public int TotalCapacity { get; set; }
        public int BookedSeats { get; set; }
        public int AvailableSeats { get; set; }
        public List<string> BookedSeatNumbers { get; set; } = new List<string>();
    }
}
