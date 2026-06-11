using System;
using System.Collections.Generic;

namespace EVENT.Business.BusinessClass
{
    public class BlueprintRequest
    {
        public long BlueprintId { get; set; }
        public string BlueprintRId { get; set; } = string.Empty;
        public long EventId { get; set; }
        public string BlueprintName { get; set; } = string.Empty;
        public string BlueprintImage { get; set; } = string.Empty;
        public string BlueprintJson { get; set; } = string.Empty;
        public string StagePosition { get; set; } = string.Empty;
        public int TotalZones { get; set; }
        public int TotalSeats { get; set; }
        public bool IsSeatBased { get; set; } = true;
        public bool IsPublished { get; set; }
        public string Remarks { get; set; } = string.Empty;
        public long? CreatedBy { get; set; }
        public string CreatedFrom { get; set; } = string.Empty;
        public long? UpdatedBy { get; set; }
        public string UpdatedFrom { get; set; } = string.Empty;
    }

    public class BlueprintResponse
    {
        public long BlueprintId { get; set; }
        public string BlueprintRId { get; set; } = string.Empty;
        public long EventId { get; set; }
        public string BlueprintName { get; set; } = string.Empty;
        public string BlueprintImage { get; set; } = string.Empty;
        public string BlueprintJson { get; set; } = string.Empty;
        public string StagePosition { get; set; } = string.Empty;
        public int TotalZones { get; set; }
        public int TotalSeats { get; set; }
        public bool IsSeatBased { get; set; }
        public bool IsPublished { get; set; }
        public string Remarks { get; set; } = string.Empty;
        public bool IsDeleted { get; set; }
        public long? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string CreatedFrom { get; set; } = string.Empty;
        public long? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string UpdatedFrom { get; set; } = string.Empty;
    }

    public class ZoneRequest
    {
        public long ZoneId { get; set; }
        public string ZoneRId { get; set; } = string.Empty;
        public long BlueprintId { get; set; }
        public long EventId { get; set; }
        public string ZoneName { get; set; } = string.Empty;
        public string ZoneCode { get; set; } = string.Empty;
        public string ZoneType { get; set; } = string.Empty;
        public string ColorCode { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public int RowCount { get; set; }
        public int ColumnCount { get; set; }
        public decimal SeatPrice { get; set; }
        public bool IsVIP { get; set; }
        public bool IsReserved { get; set; }
        public bool IsSeatSelectionAllowed { get; set; } = true;
        public long? EntryGateId { get; set; }
        public int SortOrder { get; set; }
        public string Remarks { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public long? CreatedBy { get; set; }
        public string CreatedFrom { get; set; } = string.Empty;
        public long? UpdatedBy { get; set; }
        public string UpdatedFrom { get; set; } = string.Empty;
    }

    public class ZoneResponse
    {
        public long ZoneId { get; set; }
        public string ZoneRId { get; set; } = string.Empty;
        public long BlueprintId { get; set; }
        public long EventId { get; set; }
        public string ZoneName { get; set; } = string.Empty;
        public string ZoneCode { get; set; } = string.Empty;
        public string ZoneType { get; set; } = string.Empty;
        public string ColorCode { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public int RowCount { get; set; }
        public int ColumnCount { get; set; }
        public decimal SeatPrice { get; set; }
        public bool IsVIP { get; set; }
        public bool IsReserved { get; set; }
        public bool IsSeatSelectionAllowed { get; set; }
        public long? EntryGateId { get; set; }
        public string GateName { get; set; } = string.Empty;
        public int SortOrder { get; set; }
        public string Remarks { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public long? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string CreatedFrom { get; set; } = string.Empty;
        public long? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string UpdatedFrom { get; set; } = string.Empty;
    }

    public class ZoneSeatRequest
    {
        public long SeatId { get; set; }
        public string SeatRId { get; set; } = string.Empty;
        public long ZoneId { get; set; }
        public long EventId { get; set; }
        public string SeatNumber { get; set; } = string.Empty;
        public string RowName { get; set; } = string.Empty;
        public int ColumnNo { get; set; }
        public string SeatStatus { get; set; } = "Available";
        public bool IsBooked { get; set; }
        public bool IsBlocked { get; set; }
        public bool IsReserved { get; set; }
        public long? BookingId { get; set; }
        public decimal Price { get; set; }
        public string QRCode { get; set; } = string.Empty;
        public string Barcode { get; set; } = string.Empty;
        public string Remarks { get; set; } = string.Empty;
        public long? CreatedBy { get; set; }
    }

    public class ZoneSeatResponse
    {
        public long SeatId { get; set; }
        public string SeatRId { get; set; } = string.Empty;
        public long ZoneId { get; set; }
        public long EventId { get; set; }
        public string SeatNumber { get; set; } = string.Empty;
        public string RowName { get; set; } = string.Empty;
        public int ColumnNo { get; set; }
        public string SeatStatus { get; set; } = "Available";
        public bool IsBooked { get; set; }
        public bool IsBlocked { get; set; }
        public bool IsReserved { get; set; }
        public long? BookingId { get; set; }
        public decimal Price { get; set; }
        public string QRCode { get; set; } = string.Empty;
        public string Barcode { get; set; } = string.Empty;
        public string Remarks { get; set; } = string.Empty;
        public bool IsDeleted { get; set; }
        public long? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string CreatedFrom { get; set; } = string.Empty;
        public long? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string UpdatedFrom { get; set; } = string.Empty;
    }

    public class EntryGateRequest
    {
        public long EntryGateId { get; set; }
        public string EntryGateRId { get; set; } = string.Empty;
        public long EventId { get; set; }
        public string GateName { get; set; } = string.Empty;
        public string GateCode { get; set; } = string.Empty;
        public string GateType { get; set; } = string.Empty;
        public string Latitude { get; set; } = string.Empty;
        public string Longitude { get; set; } = string.Empty;
        public long? ScannerUserId { get; set; }
        public string Remarks { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public long? CreatedBy { get; set; }
        public string CreatedFrom { get; set; } = string.Empty;
        public long? UpdatedBy { get; set; }
        public string UpdatedFrom { get; set; } = string.Empty;
    }

    public class EntryGateResponse
    {
        public long EntryGateId { get; set; }
        public string EntryGateRId { get; set; } = string.Empty;
        public long EventId { get; set; }
        public string GateName { get; set; } = string.Empty;
        public string GateCode { get; set; } = string.Empty;
        public string GateType { get; set; } = string.Empty;
        public string Latitude { get; set; } = string.Empty;
        public string Longitude { get; set; } = string.Empty;
        public long? ScannerUserId { get; set; }
        public string Remarks { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public long? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string CreatedFrom { get; set; } = string.Empty;
        public long? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string UpdatedFrom { get; set; } = string.Empty;
    }

    public class ZonePricingRequest
    {
        public long ZonePricingId { get; set; }
        public string ZonePricingRId { get; set; } = string.Empty;
        public long EventId { get; set; }
        public long ZoneId { get; set; }
        public long? SlotId { get; set; }
        public decimal Price { get; set; }
        public decimal TaxPercentage { get; set; }
        public decimal FinalPrice { get; set; }
        public bool IsEarlyBird { get; set; }
        public DateTime? ValidFrom { get; set; }
        public DateTime? ValidTo { get; set; }
        public string Remarks { get; set; } = string.Empty;
        public long? CreatedBy { get; set; }
        public string CreatedFrom { get; set; } = string.Empty;
        public long? UpdatedBy { get; set; }
        public string UpdatedFrom { get; set; } = string.Empty;
    }

    public class ZonePricingResponse
    {
        public long ZonePricingId { get; set; }
        public string ZonePricingRId { get; set; } = string.Empty;
        public long EventId { get; set; }
        public long ZoneId { get; set; }
        public long? SlotId { get; set; }
        public decimal Price { get; set; }
        public decimal TaxPercentage { get; set; }
        public decimal FinalPrice { get; set; }
        public bool IsEarlyBird { get; set; }
        public DateTime? ValidFrom { get; set; }
        public DateTime? ValidTo { get; set; }
        public string Remarks { get; set; } = string.Empty;
        public bool IsDeleted { get; set; }
        public long? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string CreatedFrom { get; set; } = string.Empty;
        public long? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string UpdatedFrom { get; set; } = string.Empty;
    }
}
