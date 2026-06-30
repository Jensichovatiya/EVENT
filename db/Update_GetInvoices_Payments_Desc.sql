CREATE OR ALTER PROCEDURE USP_GetInvoices
    @UserId INT = NULL,
    @UserRole INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @UserRole = 1
    BEGIN
        -- SuperAdmin: get all invoices
        SELECT 
            I.InvoiceId, 
            I.InvoiceCode AS InvoiceNumber, 
            I.BookingId, 
            B.BookingNo AS BookingReference, 
            B.BookingNo AS BookingNo, 
            B.BookingNo AS BookingNumber, 
            I.SubTotal AS BaseAmount, 
            I.SubTotal AS SubTotal, 
            I.TaxAmount, 
            I.GrandTotal AS TotalAmount, 
            I.InvoiceStatus AS Status, 
            I.CreatedDate,
            I.CreatedDate AS InvoiceDate,
            E.EventName,
            U.Name AS CustomerName
        FROM Tracket_Master_Invoice I WITH (NOLOCK)
        INNER JOIN Tracket_Master_Booking B WITH (NOLOCK) ON I.BookingId = B.BookingId
        INNER JOIN Tracket_Master_Event E WITH (NOLOCK) ON B.EventId = E.EventId
        INNER JOIN Tracket_Master_User U WITH (NOLOCK) ON B.UserId = U.UserId
        WHERE I.IsDeleted = 0
        ORDER BY I.InvoiceId DESC;
    END
    ELSE IF @UserRole = 2
    BEGIN
        -- Organizer: get invoices of their own events
        SELECT 
            I.InvoiceId, 
            I.InvoiceCode AS InvoiceNumber,
            I.BookingId, 
            B.BookingNo AS BookingReference, 
            B.BookingNo AS BookingNo, 
            B.BookingNo AS BookingNumber, 
            I.SubTotal AS BaseAmount, 
            I.SubTotal AS SubTotal, 
            I.TaxAmount, 
            I.GrandTotal AS TotalAmount, 
            I.InvoiceStatus AS Status, 
            I.CreatedDate,
            I.CreatedDate AS InvoiceDate,
            E.EventName,
            U.Name AS CustomerName
        FROM Tracket_Master_Invoice I WITH (NOLOCK)
        INNER JOIN Tracket_Master_Booking B WITH (NOLOCK) ON I.BookingId = B.BookingId
        INNER JOIN Tracket_Master_Event E WITH (NOLOCK) ON B.EventId = E.EventId
        INNER JOIN Tracket_Master_User U WITH (NOLOCK) ON B.UserId = U.UserId
        WHERE I.IsDeleted = 0
          AND E.UserId = @UserId
        ORDER BY I.InvoiceId DESC;
    END
    ELSE
    BEGIN
        -- Standard/Visitor or fallback: get invoices for bookings they made
        SELECT 
            I.InvoiceId, 
            I.InvoiceCode AS InvoiceNumber,
            I.BookingId, 
            B.BookingNo AS BookingReference, 
            B.BookingNo AS BookingNo, 
            B.BookingNo AS BookingNumber, 
            I.SubTotal AS BaseAmount, 
            I.SubTotal AS SubTotal, 
            I.TaxAmount, 
            I.GrandTotal AS TotalAmount, 
            I.InvoiceStatus AS Status, 
            I.CreatedDate,
            I.CreatedDate AS InvoiceDate,
            E.EventName,
            U.Name AS CustomerName
        FROM Tracket_Master_Invoice I WITH (NOLOCK)
        INNER JOIN Tracket_Master_Booking B WITH (NOLOCK) ON I.BookingId = B.BookingId
        INNER JOIN Tracket_Master_Event E WITH (NOLOCK) ON B.EventId = E.EventId
        INNER JOIN Tracket_Master_User U WITH (NOLOCK) ON B.UserId = U.UserId
        WHERE I.IsDeleted = 0
          AND (@UserId IS NULL OR B.UserId = @UserId)
        ORDER BY I.InvoiceId DESC;
    END
END;
GO

CREATE OR ALTER PROCEDURE [dbo].[USP_GetPayments] 
AS 
BEGIN 
    SET NOCOUNT ON; 
    SELECT 
        PaymentId, 
        BookingId, 
        InvoiceId, 
        PaymentReferenceNo AS PaymentReference, 
        TransactionId AS TransactionNo, 
        PaymentGateway, 
        PaymentMode, 
        PaymentStatus AS Status, 
        Amount, 
        TaxAmount, 
        FinalAmount, 
        PaymentDate, 
        IsRefunded, 
        RefundAmount, 
        RefundDate, 
        RefundTransactionId 
    FROM Tracket_Master_Payment WITH (NOLOCK) 
    WHERE IsDeleted = 0
    ORDER BY PaymentId DESC; 
END;
GO
