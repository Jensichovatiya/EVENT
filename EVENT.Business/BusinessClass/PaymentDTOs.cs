using System;

namespace EVENT.Business.BusinessClass
{
    public class TaxRequest
    {
        public long TaxId { get; set; }
        public string TaxName { get; set; } = string.Empty;
        public decimal Percentage { get; set; }
    }

    public class TaxResponse
    {
        public long TaxId { get; set; }
        public string TaxName { get; set; } = string.Empty;
        public decimal Percentage { get; set; }
        public bool IsActive { get; set; }
    }

    public class InvoiceRequest
    {
        public long InvoiceId { get; set; }
        public long BookingId { get; set; }
        public decimal BaseAmount { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal TotalAmount { get; set; }
    }

    public class InvoiceResponse
    {
        public long InvoiceId { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public long BookingId { get; set; }
        public string BookingReference { get; set; } = string.Empty;
        public string BookingNo { get; set; } = string.Empty;
        public string BookingNumber { get; set; } = string.Empty;
        public decimal BaseAmount { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public DateTime InvoiceDate { get; set; }
        public string EventName { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
    }

    public class PaymentRequest
    {
        public long BookingId { get; set; }
        public string TransactionReference { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string PaymentMode { get; set; } = "CARD"; // "CARD", "UPI", "NETBANKING"
    }

    public class PaymentResponse
    {
        public long PaymentId { get; set; }
        public string PaymentReference { get; set; } = string.Empty;
        public long BookingId { get; set; }
        public string TransactionReference { get; set; } = string.Empty;
        public string TransactionNo { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal RefundAmount { get; set; }
        public string PaymentMode { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public int Status { get; set; }
        public DateTime PaymentDate { get; set; }
    }

    public class RefundRequest
    {
        public long PaymentId { get; set; }
        public decimal Amount { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
}
