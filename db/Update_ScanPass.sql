
-- 4. USP_ScanPass
ALTER PROCEDURE USP_ScanPass
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @PassCode NVARCHAR(100), @DeviceIdentifier NVARCHAR(100), @ScannerUserId INT;

        SELECT 
            @PassCode = PassCode,
            @DeviceIdentifier = DeviceIdentifier,
            @ScannerUserId = ScannerUserId
        FROM OPENJSON(@JsonData)
        WITH (
            PassCode NVARCHAR(100) '$.PassCode',
            DeviceIdentifier NVARCHAR(100) '$.DeviceIdentifier',
            ScannerUserId INT '$.ScannerUserId'
        );

        DECLARE @PassId INT, @PassStatus INT, @IsUsed BIT, @AttendeeName NVARCHAR(100), @EventName NVARCHAR(150), @BookingId INT;

        SELECT 
            @PassId = P.PassId,
            @PassStatus = P.PassStatus,
            @IsUsed = P.IsUsed,
            @AttendeeName = A.FullName,
            @EventName = E.EventName,
            @BookingId = P.BookingId
        FROM Tracket_Master_Pass P
        INNER JOIN Tracket_Master_Booking B ON P.BookingId = B.BookingId
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        INNER JOIN Tracket_Master_Booking_Attendee A ON P.AttendeeId = A.AttendeeId
        WHERE (P.PassNo = @PassCode OR P.QRCode = @PassCode) AND P.IsDeleted = 0;

        IF @PassId IS NULL
        BEGIN
            SELECT 404 AS ResultStatus, 'Pass not found.' AS ResultMessage;
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF @IsUsed = 1
        BEGIN
            SELECT 400 AS ResultStatus, 'Pass already scanned.' AS ResultMessage;
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Mark pass as used
        UPDATE Tracket_Master_Pass SET IsUsed = 1, UsedDate = GETDATE() WHERE PassId = @PassId;

        -- Record scanner log
        INSERT INTO Tracket_Master_Scanner_Log (PassId, BookingId, EventId, SlotId, ScanType, ScannerDevice, ScannedBy, ScanDate, IsValid, ValidationMessage, CreatedDate, CreatedBy)
        VALUES (@PassId, @BookingId, 
                (SELECT EventId FROM Tracket_Master_Booking WHERE BookingId = @BookingId), 
                (SELECT SlotId FROM Tracket_Master_Booking_Date BD INNER JOIN Tracket_Master_Pass P ON BD.BookingDateId = P.BookingDateId WHERE P.PassId = @PassId), 
                'ENTRY', @DeviceIdentifier, @ScannerUserId, GETDATE(), 1, 'Pass scanned successfully', GETDATE(), @ScannerUserId);

        DECLARE @LogId INT = SCOPE_IDENTITY();

        -- Queue Attendance Marked Notification
        INSERT INTO Tracket_Master_Notification (
            Notification_Public_Id, Module_Name, Reference_Public_Id, User_Public_Id, Notification_Type, Recipient_To, Subject, Message_Body, Status, Retry_Count, Created_At, Is_Active, Is_Deleted
        )
        SELECT 
            NEWID(),
            'ATTENDANCE',
            CAST(SUBSTRING(B.BookingRId, 1, 8) + '-' + SUBSTRING(B.BookingRId, 9, 4) + '-' + SUBSTRING(B.BookingRId, 13, 4) + '-' + SUBSTRING(B.BookingRId, 17, 4) + '-' + SUBSTRING(B.BookingRId, 21, 12) AS uniqueidentifier),
            U.UniqueScanCode,
            'EMAIL',
            U.EmailId,
            'Attendance Marked - Event: ' + E.EventName,
            'Dear ' + U.Name + ', your pass (' + @PassCode + ') for the event ' + E.EventName + ' has been successfully scanned. Welcome to the event!',
            'QUEUED',
            0,
            GETDATE(),
            1,
            0
        FROM Tracket_Master_Booking B
        INNER JOIN Tracket_Master_User U ON B.UserId = U.UserId
        INNER JOIN Tracket_Master_Event E ON B.EventId = E.EventId
        WHERE B.BookingId = @BookingId;

        COMMIT TRANSACTION;
        SELECT 200 AS ResultStatus, 'Pass scanned successfully.' AS ResultMessage;

        SELECT 
            @LogId AS LogId,
            @PassCode AS PassCode,
            @AttendeeName AS AttendeeName,
            @AttendeeName AS HolderName,
            @EventName AS EventName,
            GETDATE() AS ScanTime,
            GETDATE() AS ScanDate,
            'SUCCESS' AS ScanStatus,
            1 AS Status,
            (SELECT ISNULL(Name, 'System') FROM Tracket_Master_User WHERE UserId = @ScannerUserId) AS ScannerUserName,
            'Pass scanned successfully' AS ValidationMessage;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 500 AS ResultStatus, ERROR_MESSAGE() AS ResultMessage;
    END CATCH
END;

