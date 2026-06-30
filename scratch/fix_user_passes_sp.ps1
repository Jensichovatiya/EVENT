$conn = New-Object System.Data.SqlClient.SqlConnection("Server=(localdb)\MSSQLLocalDB;Database=EVENT_Master;Integrated Security=True")
$conn.Open()
$cmd = $conn.CreateCommand()

$spSql = @"
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
        -- Organizer: get passes for bookings of their own events (filtered by event's UserId)
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
"@

$cmd.CommandText = $spSql
$cmd.ExecuteNonQuery() | Out-Null
Write-Output "Successfully fixed USP_GetUserPasses (EventDate -> StartDate)."
$conn.Close()
