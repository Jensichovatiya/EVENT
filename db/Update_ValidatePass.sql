
-- 3. USP_ValidatePass
ALTER PROCEDURE USP_ValidatePass
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @PassCode NVARCHAR(100);

    SELECT @PassCode = PassCode FROM OPENJSON(@JsonData) WITH (PassCode NVARCHAR(100) '$.PassCode');

    DECLARE @PassId INT, @PassStatus INT, @IsUsed BIT, @AttendeeName NVARCHAR(100), @EventName NVARCHAR(150),
            @BookingId INT, @EventId INT, @SlotId INT, @SlotDate DATETIME, @StartTime TIME, @HolderEmail NVARCHAR(100),
            @VenueName NVARCHAR(300), @AddressLine1 NVARCHAR(500), @AddressLine2 NVARCHAR(500), @City NVARCHAR(100),
            @State NVARCHAR(100), @Country NVARCHAR(100), @GoogleMapLink NVARCHAR(MAX);

    SELECT 
        @PassId = P.PassId,
        @PassStatus = P.PassStatus,
        @IsUsed = P.IsUsed,
        @AttendeeName = A.FullName,
        @EventName = E.EventName,
        @BookingId = P.BookingId,
        @EventId = B.EventId,
        @SlotId = BD.SlotId,
        @SlotDate = ES.StartDate,
        @StartTime = ES.StartTime,
        @HolderEmail = A.Email,
        @VenueName = L.VenueName,
        @AddressLine1 = L.AddressLine1,
        @AddressLine2 = L.AddressLine2,
        @City = L.CityId,
        @State = L.StateId,
        @Country = L.CountryId,
        @GoogleMapLink = L.GoogleMapLink
    FROM Tracket_Master_Pass P
    INNER JOIN Tracket_Master_Booking B ON P.BookingId = B.BookingId
    INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
    INNER JOIN Tracket_Master_Booking_Attendee A ON P.AttendeeId = A.AttendeeId
    LEFT JOIN Tracket_Master_Booking_Date BD ON P.BookingDateId = BD.BookingDateId
    LEFT JOIN Tracket_Master_Event_Slot ES ON BD.SlotId = ES.SlotId
    LEFT JOIN Tracket_Master_Event_Location L ON E.EventId = L.EventId
    WHERE (P.PassNo = @PassCode OR P.QRCode = @PassCode) AND P.IsDeleted = 0;

    IF @PassId IS NULL
    BEGIN
        SELECT 
            CAST(0 AS BIT) AS IsValid, 
            'Pass not found or invalid.' AS Message,
            0 AS PassId,
            @PassCode AS PassCode,
            0 AS BookingId,
            0 AS EventId,
            '' AS EventName,
            0 AS SlotId,
            GETDATE() AS SlotDate,
            CAST('00:00:00' AS TIME) AS StartTime,
            '' AS HolderName,
            '' AS HolderEmail,
            '' AS VenueName,
            '' AS AddressLine1,
            '' AS AddressLine2,
            '' AS City,
            '' AS State,
            '' AS Country,
            '' AS GoogleMapLink;
    END
    ELSE IF @PassStatus <> 1 OR @IsUsed = 1
    BEGIN
        SELECT 
            CAST(0 AS BIT) AS IsValid, 
            'Pass is already used or cancelled.' AS Message,
            @PassId AS PassId,
            @PassCode AS PassCode,
            @BookingId AS BookingId,
            @EventId AS EventId,
            @EventName AS EventName,
            @SlotId AS SlotId,
            @SlotDate AS SlotDate,
            @StartTime AS StartTime,
            @AttendeeName AS HolderName,
            @HolderEmail AS HolderEmail,
            @VenueName AS VenueName,
            @AddressLine1 AS AddressLine1,
            @AddressLine2 AS AddressLine2,
            @City AS City,
            @State AS State,
            @Country AS Country,
            @GoogleMapLink AS GoogleMapLink;
    END
    ELSE
    BEGIN
        SELECT 
            CAST(1 AS BIT) AS IsValid, 
            'Pass is valid.' AS Message,
            @PassId AS PassId,
            @PassCode AS PassCode,
            @BookingId AS BookingId,
            @EventId AS EventId,
            @EventName AS EventName,
            @SlotId AS SlotId,
            @SlotDate AS SlotDate,
            @StartTime AS StartTime,
            @AttendeeName AS HolderName,
            @HolderEmail AS HolderEmail,
            @VenueName AS VenueName,
            @AddressLine1 AS AddressLine1,
            @AddressLine2 AS AddressLine2,
            @City AS City,
            @State AS State,
            @Country AS Country,
            @GoogleMapLink AS GoogleMapLink;
    END
END;

