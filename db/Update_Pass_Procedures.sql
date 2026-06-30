-- ============================================================
-- SQL Script: Update Pass-related Stored Procedures
-- This updates:
--   1. USP_GetUserPasses
--   2. USP_GetPassDetails
--   3. USP_GenerateRegeneratePass
-- to dynamically resolve ticket/pass types and populate model fields.
-- ============================================================
USE EVENT_Master;
GO

-- 1. USP_GetUserPasses
IF OBJECT_ID('dbo.USP_GetUserPasses', 'P') IS NOT NULL
BEGIN
    EXEC('
    ALTER PROCEDURE [dbo].[USP_GetUserPasses]
        @UserId INT,
        @UserRole INT = NULL
    AS
    BEGIN
        SET NOCOUNT ON;

        IF @UserRole = 1
        BEGIN
            -- SuperAdmin: get all passes
            SELECT 
                P.PassId,
                P.PassNo AS PassCode,
                P.BookingId,
                E.EventName,
                A.FullName AS AttendeeName,
                COALESCE(T.TicketName, EP.PassName, ''TICKET'') AS PassType,
                CASE WHEN P.PassStatus = 1 THEN ''ACTIVE'' ELSE ''INACTIVE'' END AS Status,
                P.CreatedDate AS GeneratedDate,
                S.StartDate AS SlotDate,
                S.StartTime,
                S.EndTime,
                S.SlotName,
                P.SeatNo,
                Z.ZoneName,
                P.QRCode,
                A.FullName AS HolderName,
                A.Email AS HolderEmail,
                CASE WHEN P.PassStatus = 1 AND P.IsUsed = 0 THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS IsValid,
                L.VenueName,
                L.AddressLine1,
                L.AddressLine2,
                L.CityId AS City,
                L.StateId AS State,
                L.CountryId AS Country,
                L.GoogleMapLink
            FROM Tracket_Master_Pass P WITH (NOLOCK)
            INNER JOIN Tracket_Master_Booking B WITH (NOLOCK) ON P.BookingId = B.BookingId
            LEFT JOIN Tracket_Master_Event_Ticket T WITH (NOLOCK) ON B.TicketTypeId = T.TicketId AND T.IsDeleted = 0
            LEFT JOIN Tracket_Master_Event_Pass EP WITH (NOLOCK) ON B.PassTypeId = EP.EventPassId AND EP.IsDeleted = 0
            INNER JOIN Tracket_Master_Event E WITH (NOLOCK) ON B.EventId = E.EventId
            LEFT JOIN Tracket_Master_Booking_Date BD WITH (NOLOCK) ON P.BookingDateId = BD.BookingDateId
            LEFT JOIN Tracket_Master_Event_Slot S WITH (NOLOCK) ON BD.SlotId = S.SlotId
            INNER JOIN Tracket_Master_Booking_Attendee A WITH (NOLOCK) ON P.AttendeeId = A.AttendeeId
            LEFT JOIN Tracket_Master_Event_Zone_Seat ZS WITH (NOLOCK) ON ZS.BookingId = B.BookingId AND ZS.SeatNumber = P.SeatNo AND ZS.IsDeleted = 0
            LEFT JOIN Tracket_Master_Event_Zone Z WITH (NOLOCK) ON ZS.ZoneId = Z.ZoneId AND Z.IsDeleted = 0
            LEFT JOIN Tracket_Master_Event_Location L WITH (NOLOCK) ON E.EventId = L.EventId
            WHERE P.IsDeleted = 0 AND B.IsDeleted = 0;
        END
        ELSE IF @UserRole = 2
        BEGIN
            -- Organizer: get passes for bookings of their own events (filtered by event''s UserId)
            SELECT 
                P.PassId,
                P.PassNo AS PassCode,
                P.BookingId,
                E.EventName,
                A.FullName AS AttendeeName,
                COALESCE(T.TicketName, EP.PassName, ''TICKET'') AS PassType,
                CASE WHEN P.PassStatus = 1 THEN ''ACTIVE'' ELSE ''INACTIVE'' END AS Status,
                P.CreatedDate AS GeneratedDate,
                S.StartDate AS SlotDate,
                S.StartTime,
                S.EndTime,
                S.SlotName,
                P.SeatNo,
                Z.ZoneName,
                P.QRCode,
                A.FullName AS HolderName,
                A.Email AS HolderEmail,
                CASE WHEN P.PassStatus = 1 AND P.IsUsed = 0 THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS IsValid,
                L.VenueName,
                L.AddressLine1,
                L.AddressLine2,
                L.CityId AS City,
                L.StateId AS State,
                L.CountryId AS Country,
                L.GoogleMapLink
            FROM Tracket_Master_Pass P WITH (NOLOCK)
            INNER JOIN Tracket_Master_Booking B WITH (NOLOCK) ON P.BookingId = B.BookingId
            LEFT JOIN Tracket_Master_Event_Ticket T WITH (NOLOCK) ON B.TicketTypeId = T.TicketId AND T.IsDeleted = 0
            LEFT JOIN Tracket_Master_Event_Pass EP WITH (NOLOCK) ON B.PassTypeId = EP.EventPassId AND EP.IsDeleted = 0
            INNER JOIN Tracket_Master_Event E WITH (NOLOCK) ON B.EventId = E.EventId
            LEFT JOIN Tracket_Master_Booking_Date BD WITH (NOLOCK) ON P.BookingDateId = BD.BookingDateId
            LEFT JOIN Tracket_Master_Event_Slot S WITH (NOLOCK) ON BD.SlotId = S.SlotId
            INNER JOIN Tracket_Master_Booking_Attendee A WITH (NOLOCK) ON P.AttendeeId = A.AttendeeId
            LEFT JOIN Tracket_Master_Event_Zone_Seat ZS WITH (NOLOCK) ON ZS.BookingId = B.BookingId AND ZS.SeatNumber = P.SeatNo AND ZS.IsDeleted = 0
            LEFT JOIN Tracket_Master_Event_Zone Z WITH (NOLOCK) ON ZS.ZoneId = Z.ZoneId AND Z.IsDeleted = 0
            LEFT JOIN Tracket_Master_Event_Location L WITH (NOLOCK) ON E.EventId = L.EventId
            WHERE E.UserId = @UserId AND P.IsDeleted = 0 AND B.IsDeleted = 0;
        END
        ELSE
        BEGIN
            -- Standard/Visitor or fallback: get passes they booked
            SELECT 
                P.PassId,
                P.PassNo AS PassCode,
                P.BookingId,
                E.EventName,
                A.FullName AS AttendeeName,
                COALESCE(T.TicketName, EP.PassName, ''TICKET'') AS PassType,
                CASE WHEN P.PassStatus = 1 THEN ''ACTIVE'' ELSE ''INACTIVE'' END AS Status,
                P.CreatedDate AS GeneratedDate,
                S.StartDate AS SlotDate,
                S.StartTime,
                S.EndTime,
                S.SlotName,
                P.SeatNo,
                Z.ZoneName,
                P.QRCode,
                A.FullName AS HolderName,
                A.Email AS HolderEmail,
                CASE WHEN P.PassStatus = 1 AND P.IsUsed = 0 THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS IsValid,
                L.VenueName,
                L.AddressLine1,
                L.AddressLine2,
                L.CityId AS City,
                L.StateId AS State,
                L.CountryId AS Country,
                L.GoogleMapLink
            FROM Tracket_Master_Pass P WITH (NOLOCK)
            INNER JOIN Tracket_Master_Booking B WITH (NOLOCK) ON P.BookingId = B.BookingId
            LEFT JOIN Tracket_Master_Event_Ticket T WITH (NOLOCK) ON B.TicketTypeId = T.TicketId AND T.IsDeleted = 0
            LEFT JOIN Tracket_Master_Event_Pass EP WITH (NOLOCK) ON B.PassTypeId = EP.EventPassId AND EP.IsDeleted = 0
            INNER JOIN Tracket_Master_Event E WITH (NOLOCK) ON B.EventId = E.EventId
            LEFT JOIN Tracket_Master_Booking_Date BD WITH (NOLOCK) ON P.BookingDateId = BD.BookingDateId
            LEFT JOIN Tracket_Master_Event_Slot S WITH (NOLOCK) ON BD.SlotId = S.SlotId
            INNER JOIN Tracket_Master_Booking_Attendee A WITH (NOLOCK) ON P.AttendeeId = A.AttendeeId
            LEFT JOIN Tracket_Master_Event_Zone_Seat ZS WITH (NOLOCK) ON ZS.BookingId = B.BookingId AND ZS.SeatNumber = P.SeatNo AND ZS.IsDeleted = 0
            LEFT JOIN Tracket_Master_Event_Zone Z WITH (NOLOCK) ON ZS.ZoneId = Z.ZoneId AND Z.IsDeleted = 0
            LEFT JOIN Tracket_Master_Event_Location L WITH (NOLOCK) ON E.EventId = L.EventId
            WHERE B.UserId = @UserId AND P.IsDeleted = 0 AND B.IsDeleted = 0;
        END
    END;
    ')
    PRINT 'Updated USP_GetUserPasses stored procedure.';
END
GO

-- 2. USP_GetPassDetails
IF OBJECT_ID('dbo.USP_GetPassDetails', 'P') IS NOT NULL
BEGIN
    EXEC('
    ALTER PROCEDURE USP_GetPassDetails
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
                COALESCE(T.TicketName, EP.PassName, ''TICKET'') AS PassType, 
                CASE WHEN P.PassStatus = 1 THEN ''ACTIVE'' ELSE ''INACTIVE'' END AS Status,
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
            LEFT JOIN Tracket_Master_Event_Ticket T ON B.TicketTypeId = T.TicketId AND T.IsDeleted = 0
            LEFT JOIN Tracket_Master_Event_Pass EP ON B.PassTypeId = EP.EventPassId AND EP.IsDeleted = 0
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
                COALESCE(T.TicketName, EP.PassName, ''TICKET'') AS PassType, 
                CASE WHEN P.PassStatus = 1 THEN ''ACTIVE'' ELSE ''INACTIVE'' END AS Status,
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
            LEFT JOIN Tracket_Master_Event_Ticket T ON B.TicketTypeId = T.TicketId AND T.IsDeleted = 0
            LEFT JOIN Tracket_Master_Event_Pass EP ON B.PassTypeId = EP.EventPassId AND EP.IsDeleted = 0
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
                COALESCE(T.TicketName, EP.PassName, ''TICKET'') AS PassType, 
                CASE WHEN P.PassStatus = 1 THEN ''ACTIVE'' ELSE ''INACTIVE'' END AS Status,
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
            LEFT JOIN Tracket_Master_Event_Ticket T ON B.TicketTypeId = T.TicketId AND T.IsDeleted = 0
            LEFT JOIN Tracket_Master_Event_Pass EP ON B.PassTypeId = EP.EventPassId AND EP.IsDeleted = 0
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
    ')
    PRINT 'Updated USP_GetPassDetails stored procedure.';
END
GO

-- 3. USP_GenerateRegeneratePass
IF OBJECT_ID('dbo.USP_GenerateRegeneratePass', 'P') IS NOT NULL
BEGIN
    EXEC('
    ALTER PROCEDURE USP_GenerateRegeneratePass
        @JsonData NVARCHAR(MAX)
    AS
    BEGIN
        SET NOCOUNT ON;

        DECLARE @BookingId INT, @PassType NVARCHAR(50), @PassNo NVARCHAR(100), @PassId INT;

        SELECT 
            @BookingId = BookingId,
            @PassType = PassType
        FROM OPENJSON(@JsonData)
        WITH (
            BookingId INT ''$.BookingId'',
            PassType NVARCHAR(50) ''$.PassType''
        );

        IF EXISTS (SELECT 1 FROM Tracket_Master_Pass WHERE BookingId = @BookingId AND IsDeleted = 0)
        BEGIN
            SELECT @PassId = PassId FROM Tracket_Master_Pass WHERE BookingId = @BookingId AND IsDeleted = 0;
            SELECT 200 AS ResultStatus, ''Pass already exists.'' AS ResultMessage;
        END
        ELSE
        BEGIN
            -- Generate passes for the booking attendees
            INSERT INTO Tracket_Master_Pass (BookingId, AttendeeId, BookingDateId, PassNo, QRCode, SeatNo, PassStatus, IsUsed, IsDeleted, CreatedDate, CreatedBy)
            SELECT 
                @BookingId,
                A.AttendeeId,
                BD.BookingDateId,
                ''PASS-'' + UPPER(SUBSTRING(CONVERT(NVARCHAR(36), NEWID()), 1, 12)),
                ''QR-'' + UPPER(SUBSTRING(CONVERT(NVARCHAR(36), NEWID()), 1, 8)),
                A.SeatNo,
                1, -- Active
                0, -- Not used
                0,
                GETDATE(),
                ''System''
            FROM Tracket_Master_Booking_Attendee A
            CROSS JOIN Tracket_Master_Booking_Date BD
            WHERE A.BookingId = @BookingId 
              AND BD.BookingId = @BookingId
              AND A.IsDeleted = 0
              AND BD.IsDeleted = 0
              AND NOT EXISTS (
                  SELECT 1 FROM Tracket_Master_Pass P 
                  WHERE P.AttendeeId = A.AttendeeId 
                    AND P.BookingDateId = BD.BookingDateId 
                    AND P.IsDeleted = 0
              );

            SELECT @PassId = SCOPE_IDENTITY();
            SELECT 201 AS ResultStatus, ''Pass generated successfully.'' AS ResultMessage;
        END

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
            COALESCE(T.TicketName, EP.PassName, ''TICKET'') AS PassType, 
            CASE WHEN P.PassStatus = 1 THEN ''ACTIVE'' ELSE ''INACTIVE'' END AS Status,
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
        LEFT JOIN Tracket_Master_Event_Ticket T ON B.TicketTypeId = T.TicketId AND T.IsDeleted = 0
        LEFT JOIN Tracket_Master_Event_Pass EP ON B.PassTypeId = EP.EventPassId AND EP.IsDeleted = 0
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        LEFT JOIN Tracket_Master_Booking_Date BD ON P.BookingDateId = BD.BookingDateId
        LEFT JOIN Tracket_Master_Event_Slot S ON BD.SlotId = S.SlotId
        INNER JOIN Tracket_Master_Booking_Attendee A ON P.AttendeeId = A.AttendeeId
        LEFT JOIN Tracket_Master_Event_Zone_Seat ZS ON ZS.BookingId = B.BookingId AND ZS.SeatNumber = P.SeatNo AND ZS.IsDeleted = 0
        LEFT JOIN Tracket_Master_Event_Zone Z ON ZS.ZoneId = Z.ZoneId AND Z.IsDeleted = 0
        LEFT JOIN Tracket_Master_Event_Location L ON E.EventId = L.EventId
        WHERE P.BookingId = @BookingId;
    END;
    ')
    PRINT 'Updated USP_GenerateRegeneratePass stored procedure.';
END
GO
