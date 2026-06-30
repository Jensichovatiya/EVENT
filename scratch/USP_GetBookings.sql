
-- 2. USP_GetBookings
ALTER   PROCEDURE USP_GetBookings
    @BookingId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @BookingId IS NOT NULL
    BEGIN
        SELECT 
            B.BookingId, B.BookingRId, B.BookingNo AS BookingReference, B.EventId, E.EventName, B.SlotId, B.UserId, U.Name AS UserName, B.TotalTickets, B.TotalAmount, B.TaxAmount, B.DiscountAmount, B.FinalAmount, 
            ISNULL(V_Status.Description, CAST(B.BookingStatus AS NVARCHAR(50))) AS BookingStatus, 
            B.BookingDate
        FROM Tracket_Master_Booking B
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        LEFT JOIN Tracket_Master_User U ON B.UserId = U.UserId
        LEFT JOIN Tracket_Master_GeneralMasterValue V_Status ON V_Status.CategoryId = (
            SELECT CategoryId FROM Tracket_Master_GeneralMasterCategory WHERE DDL_ID = 'BOOKING_STATUS'
        ) AND V_Status.AdditionalField = CAST(B.BookingStatus AS NVARCHAR(50))
        WHERE B.BookingId = @BookingId AND B.IsDeleted = 0;

        SELECT AttendeeId, FullName AS AttendeeName, Email, MobileNo AS PhoneNumber, SeatNo, BookingId 
        FROM Tracket_Master_Booking_Attendee 
        WHERE BookingId = @BookingId AND IsDeleted = 0;
    END
    ELSE
    BEGIN
        SELECT 
            B.BookingId, B.BookingRId, B.BookingNo AS BookingReference, B.EventId, E.EventName, B.SlotId, B.UserId, U.Name AS UserName, B.TotalTickets, B.TotalAmount, B.TaxAmount, B.DiscountAmount, B.FinalAmount, 
            ISNULL(V_Status.Description, CAST(B.BookingStatus AS NVARCHAR(50))) AS BookingStatus, 
            B.BookingDate
        FROM Tracket_Master_Booking B
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        LEFT JOIN Tracket_Master_User U ON B.UserId = U.UserId
        LEFT JOIN Tracket_Master_GeneralMasterValue V_Status ON V_Status.CategoryId = (
            SELECT CategoryId FROM Tracket_Master_GeneralMasterCategory WHERE DDL_ID = 'BOOKING_STATUS'
        ) AND V_Status.AdditionalField = CAST(B.BookingStatus AS NVARCHAR(50))
        WHERE B.IsDeleted = 0;

        SELECT AttendeeId, FullName AS AttendeeName, Email, MobileNo AS PhoneNumber, SeatNo, BookingId 
        FROM Tracket_Master_Booking_Attendee 
        WHERE IsDeleted = 0;
    END
END;
