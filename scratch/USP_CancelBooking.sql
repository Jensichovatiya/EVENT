
-- 3. USP_CancelBooking
CREATE   PROCEDURE USP_CancelBooking
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @BookingId INT, @BookingRId NVARCHAR(50), @Reason NVARCHAR(255);

    SELECT 
        @BookingId = BookingId,
        @BookingRId = BookingRId,
        @Reason = Reason
    FROM OPENJSON(@JsonData)
    WITH (
        BookingId INT '$.BookingId',
        BookingRId NVARCHAR(50) '$.BookingRId',
        Reason NVARCHAR(255) '$.Reason'
    );

    IF @BookingId = 0 AND @BookingRId IS NOT NULL AND @BookingRId <> ''
    BEGIN
        SELECT @BookingId = BookingId 
        FROM Tracket_Master_Booking 
        WHERE BookingRId = @BookingRId AND IsDeleted = 0;
    END

    IF EXISTS (SELECT 1 FROM Tracket_Master_Booking WHERE BookingId = @BookingId AND IsDeleted = 0)
    BEGIN
        UPDATE Tracket_Master_Booking 
        SET BookingStatus = 4 
        WHERE BookingId = @BookingId;

        -- Update seat status and IsBooked in Tracket_Master_Event_Zone_Seat
        UPDATE Tracket_Master_Event_Zone_Seat
        SET IsBooked = 0,
            SeatStatus = 'Available',
            BookingId = NULL
        WHERE BookingId = @BookingId;

        UPDATE Tracket_Master_Booking_Date
        SET IsDeleted = 1
        WHERE BookingId = @BookingId;

        UPDATE Tracket_Master_Group_Booking
        SET IsActive = 0, IsDeleted = 1
        WHERE BookingId = @BookingId;

        -- Queue Booking Cancelled Notification
        INSERT INTO Tracket_Master_Notification (
            Notification_Public_Id, Module_Name, Reference_Public_Id, User_Public_Id, Notification_Type, Recipient_To, Subject, Message_Body, Status, Retry_Count, Created_At, Is_Active, Is_Deleted
        )
        SELECT 
            NEWID(),
            'BOOKING',
            CAST(SUBSTRING(B.BookingRId, 1, 8) + '-' + SUBSTRING(B.BookingRId, 9, 4) + '-' + SUBSTRING(B.BookingRId, 13, 4) + '-' + SUBSTRING(B.BookingRId, 17, 4) + '-' + SUBSTRING(B.BookingRId, 21, 12) AS uniqueidentifier),
            U.UniqueScanCode,
            'EMAIL',
            U.EmailId,
            'Booking Cancelled - Ref: ' + B.BookingNo,
            'Dear ' + U.Name + ', your booking reference ' + B.BookingNo + ' has been cancelled, and the held seats have been released.',
            'QUEUED',
            0,
            GETDATE(),
            1,
            0
        FROM Tracket_Master_Booking B
        INNER JOIN Tracket_Master_User U ON B.UserId = U.UserId
        WHERE B.BookingId = @BookingId;

        SELECT 200 AS ResultStatus, 'Booking cancelled successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        SELECT 404 AS ResultStatus, 'Booking not found.' AS ResultMessage;
    END
END;
