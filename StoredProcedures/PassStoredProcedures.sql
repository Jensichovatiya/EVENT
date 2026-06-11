-- ==========================================
-- MODULE 7 & 8: PASS AND SCANNER STORED PROCEDURES
-- ==========================================

-- 1. USP_GenerateRegeneratePass
CREATE OR ALTER PROCEDURE USP_GenerateRegeneratePass
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @BookingId INT, @PassType NVARCHAR(50), @PassCode NVARCHAR(100), @PassId INT;

    SELECT 
        @BookingId = BookingId,
        @PassType = PassType
    FROM OPENJSON(@JsonData)
    WITH (
        BookingId INT '$.BookingId',
        PassType NVARCHAR(50) '$.PassType'
    );

    IF EXISTS (SELECT 1 FROM Tracket_Master_Pass WHERE BookingId = @BookingId AND IsDeleted = 0)
    BEGIN
        SELECT @PassId = PassId FROM Tracket_Master_Pass WHERE BookingId = @BookingId AND IsDeleted = 0;
        SELECT 200 AS ResultStatus, 'Pass already exists.' AS ResultMessage;
    END
    ELSE
    BEGIN
        SET @PassCode = 'PASS-' + UPPER(SUBSTRING(CONVERT(NVARCHAR(36), NEWID()), 1, 12));

        INSERT INTO Tracket_Master_Pass (PassCode, BookingId, PassType, Status, GeneratedDate, IsDeleted)
        VALUES (@PassCode, @BookingId, @PassType, 'ACTIVE', GETDATE(), 0);

        SET @PassId = SCOPE_IDENTITY();
        SELECT 201 AS ResultStatus, 'Pass generated successfully.' AS ResultMessage;
    END

    SELECT 
        P.PassId, P.PassCode, P.BookingId, E.EventName, A.AttendeeName, P.PassType, P.Status, P.GeneratedDate
    FROM Tracket_Master_Pass P
    INNER JOIN Tracket_Master_Booking B ON P.BookingId = B.BookingId
    INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
    INNER JOIN Tracket_Master_Booking_Attendee A ON B.BookingId = A.BookingId
    WHERE P.PassId = @PassId;
END;
GO

-- 2. USP_GetPassDetails
CREATE OR ALTER PROCEDURE USP_GetPassDetails
    @PassId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        P.PassId, P.PassCode, P.BookingId, E.EventName, A.AttendeeName, P.PassType, P.Status, P.GeneratedDate
    FROM Tracket_Master_Pass P
    INNER JOIN Tracket_Master_Booking B ON P.BookingId = B.BookingId
    INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
    INNER JOIN Tracket_Master_Booking_Attendee A ON B.BookingId = A.BookingId
    WHERE P.PassId = @PassId AND P.IsDeleted = 0;
END;
GO

-- 3. USP_ValidatePass
CREATE OR ALTER PROCEDURE USP_ValidatePass
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @PassCode NVARCHAR(100);

    SELECT @PassCode = PassCode FROM OPENJSON(@JsonData) WITH (PassCode NVARCHAR(100) '$.PassCode');

    DECLARE @PassId INT, @Status NVARCHAR(50), @AttendeeName NVARCHAR(100), @EventName NVARCHAR(150);

    SELECT 
        @PassId = P.PassId,
        @Status = P.Status,
        @AttendeeName = A.AttendeeName,
        @EventName = E.EventName
    FROM Tracket_Master_Pass P
    INNER JOIN Tracket_Master_Booking B ON P.BookingId = B.BookingId
    INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
    INNER JOIN Tracket_Master_Booking_Attendee A ON B.BookingId = A.BookingId
    WHERE P.PassCode = @PassCode AND P.IsDeleted = 0;

    IF @PassId IS NULL
    BEGIN
        SELECT 
            CAST(0 AS BIT) AS IsValid, 
            'Pass not found or invalid.' AS Message,
            '' AS AttendeeName,
            '' AS EventName;
    END
    ELSE IF @Status <> 'ACTIVE'
    BEGIN
        SELECT 
            CAST(0 AS BIT) AS IsValid, 
            'Pass is already used or cancelled.' AS Message,
            @AttendeeName AS AttendeeName,
            @EventName AS EventName;
    END
    ELSE
    BEGIN
        SELECT 
            CAST(1 AS BIT) AS IsValid, 
            'Pass is valid.' AS Message,
            @AttendeeName AS AttendeeName,
            @EventName AS EventName;
    END
END;
GO

-- 4. USP_ScanPass
CREATE OR ALTER PROCEDURE USP_ScanPass
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @PassCode NVARCHAR(100), @DeviceIdentifier NVARCHAR(100);

        SELECT 
            @PassCode = PassCode,
            @DeviceIdentifier = DeviceIdentifier
        FROM OPENJSON(@JsonData)
        WITH (
            PassCode NVARCHAR(100) '$.PassCode',
            DeviceIdentifier NVARCHAR(100) '$.DeviceIdentifier'
        );

        DECLARE @PassId INT, @Status NVARCHAR(50), @AttendeeName NVARCHAR(100), @EventName NVARCHAR(150), @BookingId INT;

        SELECT 
            @PassId = P.PassId,
            @Status = P.Status,
            @AttendeeName = A.AttendeeName,
            @EventName = E.EventName,
            @BookingId = P.BookingId
        FROM Tracket_Master_Pass P
        INNER JOIN Tracket_Master_Booking B ON P.BookingId = B.BookingId
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        INNER JOIN Tracket_Master_Booking_Attendee A ON B.BookingId = A.BookingId
        WHERE P.PassCode = @PassCode AND P.IsDeleted = 0;

        IF @PassId IS NULL
        BEGIN
            SELECT 404 AS ResultStatus, 'Pass not found.' AS ResultMessage;
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF @Status = 'USED'
        BEGIN
            SELECT 400 AS ResultStatus, 'Pass already scanned.' AS ResultMessage;
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Mark pass as used
        UPDATE Tracket_Master_Pass SET Status = 'USED' WHERE PassId = @PassId;

        -- Record scanner log
        INSERT INTO Tracket_Master_Scanner_Log (PassCode, DeviceIdentifier, ScanStatus, ScanTime, IsDeleted)
        VALUES (@PassCode, @DeviceIdentifier, 'SUCCESS', GETDATE(), 0);

        DECLARE @LogId INT = SCOPE_IDENTITY();

        COMMIT TRANSACTION;
        SELECT 200 AS ResultStatus, 'Pass scanned successfully.' AS ResultMessage;

        SELECT 
            @LogId AS LogId,
            @PassCode AS PassCode,
            @AttendeeName AS AttendeeName,
            @EventName AS EventName,
            GETDATE() AS ScanTime,
            'SUCCESS' AS ScanStatus;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 500 AS ResultStatus, ERROR_MESSAGE() AS ResultMessage;
    END CATCH
END;
GO

-- 5. USP_GetScanReports
CREATE OR ALTER PROCEDURE USP_GetScanReports
    @ReportType NVARCHAR(50) = 'HISTORY'
AS
BEGIN
    SET NOCOUNT ON;

    IF @ReportType = 'HISTORY'
    BEGIN
        SELECT 
            L.LogId,
            L.PassCode,
            A.AttendeeName,
            E.EventName,
            L.ScanTime,
            L.ScanStatus
        FROM Tracket_Master_Scanner_Log L
        INNER JOIN Tracket_Master_Pass P ON L.PassCode = P.PassCode
        INNER JOIN Tracket_Master_Booking B ON P.BookingId = B.BookingId
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        INNER JOIN Tracket_Master_Booking_Attendee A ON B.BookingId = A.BookingId
        WHERE L.IsDeleted = 0;
    END
    ELSE IF @ReportType = 'ATTENDANCE'
    BEGIN
        SELECT 
            E.EventId,
            E.EventName,
            SUM(B.TotalTickets) AS TotalBooked,
            SUM(CASE WHEN P.Status = 'USED' THEN 1 ELSE 0 END) AS ScannedIn,
            SUM(CASE WHEN P.Status = 'ACTIVE' THEN 1 ELSE 0 END) AS Pending
        FROM Tracket_Master_Event E
        LEFT JOIN Tracket_Master_Booking B ON E.EventId = B.EventId AND B.IsDeleted = 0
        LEFT JOIN Tracket_Master_Pass P ON B.BookingId = P.BookingId AND P.IsDeleted = 0
        WHERE E.IsDeleted = 0
        GROUP BY E.EventId, E.EventName;
    END
END;
GO
