-- ==========================================
-- MODULE: REPORTING AND ANALYTICS SERVICES
-- ==========================================

-- 1. USP_GetRevenueReport
CREATE OR ALTER PROCEDURE USP_GetRevenueReport
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        SELECT 
            E.EventName,
            E.EventCode,
            COUNT(B.BookingId) AS TotalBookings,
            SUM(ISNULL(B.TotalAmount, 0)) AS TotalRevenue
        FROM Tracket_Master_Event E WITH (NOLOCK)
        LEFT JOIN Tracket_Master_Booking B WITH (NOLOCK) ON E.EventId = B.EventId AND B.IsDeleted = 0
        WHERE E.IsDeleted = 0
        GROUP BY E.EventId, E.EventName, E.EventCode;
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS ErrorMessage;
    END CATCH
END;
GO

-- 2. USP_GetBookingReport
CREATE OR ALTER PROCEDURE USP_GetBookingReport
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        SELECT 
            E.EventName,
            COUNT(DISTINCT S.SlotId) AS SlotsCount,
            SUM(ISNULL(B.TotalTickets, 0)) AS TicketsBooked,
            (ISNULL(E.Capacity, 0) - SUM(ISNULL(B.TotalTickets, 0))) AS RemainingCapacity
        FROM Tracket_Master_Event E WITH (NOLOCK)
        LEFT JOIN Tracket_Master_Event_Slot S WITH (NOLOCK) ON E.EventId = S.EventId AND S.IsDeleted = 0
        LEFT JOIN Tracket_Master_Booking B WITH (NOLOCK) ON E.EventId = B.EventId AND B.IsDeleted = 0
        WHERE E.IsDeleted = 0
        GROUP BY E.EventId, E.EventName, E.Capacity;
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS ErrorMessage;
    END CATCH
END;
GO
