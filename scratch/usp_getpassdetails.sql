
-- 2. USP_GetPassDetails
CREATE PROCEDURE USP_GetPassDetails
    @PassId INT,
    @UserId INT = NULL,
    @UserRole INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @UserRole = 1
    BEGIN
        -- SuperAdmin: get details for any pass
        SELECT 
            P.PassId,
            P.PassNo AS PassCode,
            P.BookingId,
            E.EventName,
            S.StartDate AS SlotDate,
            S.StartTime,
            S.EndTime,
            S.SlotName,
            P.SeatNo,
            Z.ZoneName,
            P.QRCode,
            A.FullName AS AttendeeName,
            A.FullName AS HolderName,
            A.Email AS HolderEmail,
            'TICKET' AS PassType, 
            CASE WHEN P.PassStatus = 1 THEN 'ACTIVE' ELSE 'INACTIVE' END AS Status,
            P.CreatedDate AS GeneratedDate,
            CASE WHEN P.PassStatus = 1 AND P.IsUsed = 0 THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS IsValid,
            L.VenueName,
            L.AddressLine1,
            L.AddressLine2,
            L.CityId AS City,
            L.StateId AS State,
            L.CountryId AS Country,
            L.GoogleMapLink
        FROM Tracket_Master_Pass P
        INNER JOIN Tracket_Master_Booking B ON P.BookingId = B.BookingId
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        LEFT JOIN Tracket_Master_Booking_Date BD ON P.BookingDateId = BD.BookingDateId
        LEFT JOIN Tracket_Master_Event_Slot S ON BD.SlotId = S.SlotId
        INNER JOIN Tracket_Master_Booking_Attendee A ON P.AttendeeId = A.AttendeeId
        LEFT JOIN Tracket_Master_Event_Zone_Seat ZS ON ZS.BookingId = B.BookingId AND ZS.SeatNumber = P.SeatNo AND ZS.IsDeleted = 0
        LEFT JOIN Tracket_Master_Event_Zone Z ON ZS.ZoneId = Z.ZoneId AND Z.IsDeleted = 0
        LEFT JOIN Tracket_Master_Event_Location L ON E.EventId = L.EventId
        WHERE P.PassId = @PassId AND P.IsDeleted = 0;
    END
    ELSE IF @UserRole = 2
    BEGIN
        -- Organizer: get details if the pass event belongs to this organizer
        SELECT 
            P.PassId,
            P.PassNo AS PassCode,
            P.BookingId,
            E.EventName,
            S.StartDate AS SlotDate,
            S.StartTime,
            S.EndTime,
            S.SlotName,
            P.SeatNo,
            Z.ZoneName,
            P.QRCode,
            A.FullName AS AttendeeName,
            A.FullName AS HolderName,
            A.Email AS HolderEmail,
            'TICKET' AS PassType, 
            CASE WHEN P.PassStatus = 1 THEN 'ACTIVE' ELSE 'INACTIVE' END AS Status,
            P.CreatedDate AS GeneratedDate,
            CASE WHEN P.PassStatus = 1 AND P.IsUsed = 0 THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS IsValid,
            L.VenueName,
            L.AddressLine1,
            L.AddressLine2,
            L.CityId AS City,
            L.StateId AS State,
            L.CountryId AS Country,
            L.GoogleMapLink
        FROM Tracket_Master_Pass P
        INNER JOIN Tracket_Master_Booking B ON P.BookingId = B.BookingId
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        LEFT JOIN Tracket_Master_Booking_Date BD ON P.BookingDateId = BD.BookingDateId
        LEFT JOIN Tracket_Master_Event_Slot S ON BD.SlotId = S.SlotId
        INNER JOIN Tracket_Master_Booking_Attendee A ON P.AttendeeId = A.AttendeeId
        LEFT JOIN Tracket_Master_Event_Zone_Seat ZS ON ZS.BookingId = B.BookingId AND ZS.SeatNumber = P.SeatNo AND ZS.IsDeleted = 0
        LEFT JOIN Tracket_Master_Event_Zone Z ON ZS.ZoneId = Z.ZoneId AND Z.IsDeleted = 0
        LEFT JOIN Tracket_Master_Event_Location L ON E.EventId = L.EventId
        WHERE P.PassId = @PassId AND E.UserId = @UserId AND P.IsDeleted = 0;
    END
    ELSE
    BEGIN
        -- Visitor/Standard: get details if the pass booking belongs to this user
        SELECT 
            P.PassId,
            P.PassNo AS PassCode,
            P.BookingId,
            E.EventName,
            S.StartDate AS SlotDate,
            S.StartTime,
            S.EndTime,
            S.SlotName,
            P.SeatNo,
            Z.ZoneName,
            P.QRCode,
            A.FullName AS AttendeeName,
            A.FullName AS HolderName,
            A.Email AS HolderEmail,
            'TICKET' AS PassType, 
            CASE WHEN P.PassStatus = 1 THEN 'ACTIVE' ELSE 'INACTIVE' END AS Status,
            P.CreatedDate AS GeneratedDate,
            CASE WHEN P.PassStatus = 1 AND P.IsUsed = 0 THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS IsValid,
            L.VenueName,
            L.AddressLine1,
            L.AddressLine2,
            L.CityId AS City,
            L.StateId AS State,
            L.CountryId AS Country,
            L.GoogleMapLink
        FROM Tracket_Master_Pass P
        INNER JOIN Tracket_Master_Booking B ON P.BookingId = B.BookingId
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        LEFT JOIN Tracket_Master_Booking_Date BD ON P.BookingDateId = BD.BookingDateId
        LEFT JOIN Tracket_Master_Event_Slot S ON BD.SlotId = S.SlotId
        INNER JOIN Tracket_Master_Booking_Attendee A ON P.AttendeeId = A.AttendeeId
        LEFT JOIN Tracket_Master_Event_Zone_Seat ZS ON ZS.BookingId = B.BookingId AND ZS.SeatNumber = P.SeatNo AND ZS.IsDeleted = 0
        LEFT JOIN Tracket_Master_Event_Zone Z ON ZS.ZoneId = Z.ZoneId AND Z.IsDeleted = 0
        LEFT JOIN Tracket_Master_Event_Location L ON E.EventId = L.EventId
        WHERE P.PassId = @PassId AND B.UserId = @UserId AND P.IsDeleted = 0;
    END
END;

