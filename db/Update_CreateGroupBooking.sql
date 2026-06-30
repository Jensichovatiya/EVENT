
-- 9. USP_CreateGroupBooking
ALTER PROCEDURE USP_CreateGroupBooking
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @BookingId BIGINT, @GroupName NVARCHAR(200), @CreatedBy NVARCHAR(200), @UpdatedBy NVARCHAR(200);

        SELECT 
            @BookingId = BookingId,
            @GroupName = GroupName,
            @CreatedBy = ISNULL(CreatedBy_P, CreatedBy_C),
            @UpdatedBy = ISNULL(UpdatedBy_P, UpdatedBy_C)
        FROM OPENJSON(@JsonData)
        WITH (
            BookingId BIGINT '$.BookingId',
            GroupName NVARCHAR(200) '$.GroupName',
            CreatedBy_P NVARCHAR(200) '$.CreatedBy',
            CreatedBy_C NVARCHAR(200) '$.createdBy',
            UpdatedBy_P NVARCHAR(200) '$.UpdatedBy',
            UpdatedBy_C NVARCHAR(200) '$.updatedBy'
        );

        IF NOT EXISTS(SELECT 1 FROM Tracket_Master_Booking WHERE BookingId = @BookingId AND IsDeleted = 0)
        BEGIN
            SELECT 404 AS ResultStatus, 'Booking transaction not found.' AS ResultMessage;
            ROLLBACK TRANSACTION;
            RETURN;
        END

        UPDATE Tracket_Master_Booking_Attendee SET IsDeleted = 1 WHERE BookingId = @BookingId;

        CREATE TABLE #TempAttendees (
            FullName NVARCHAR(200),
            Email NVARCHAR(200),
            MobileNo NVARCHAR(20),
            ZoneId BIGINT,
            SeatId BIGINT,
            EventDate DATE,
            SlotId BIGINT,
            AttendeeType NVARCHAR(50)
        );

        INSERT INTO #TempAttendees
        SELECT FullName, Email, MobileNo, ZoneId, SeatId, CAST(EventDate AS DATE), SlotId, AttendeeType
        FROM OPENJSON(@JsonData, '$.Attendees')
        WITH (
            FullName NVARCHAR(200) '$.FullName',
            Email NVARCHAR(200) '$.Email',
            MobileNo NVARCHAR(20) '$.MobileNo',
            ZoneId BIGINT '$.ZoneId',
            SeatId BIGINT '$.SeatId',
            EventDate NVARCHAR(30) '$.EventDate',
            SlotId BIGINT '$.SlotId',
            AttendeeType NVARCHAR(50) '$.AttendeeType'
        );

        INSERT INTO Tracket_Master_Booking_Attendee (
            BookingId, FullName, Email, MobileNo, SeatNo, IsCheckedIn, IsDeleted,
            BookingDateId, SeatId, ZoneId, AttendeeType, CreatedDate
        )
        SELECT 
            @BookingId,
            T.FullName,
            T.Email,
            T.MobileNo,
            S.SeatNumber,
            0,
            0,
            BD.BookingDateId,
            T.SeatId,
            T.ZoneId,
            ISNULL(T.AttendeeType, 'Member'),
            GETDATE()
        FROM #TempAttendees T
        INNER JOIN Tracket_Master_Booking_Date BD ON BD.BookingId = @BookingId AND BD.EventDate = T.EventDate AND BD.SlotId = T.SlotId AND BD.IsDeleted = 0
        INNER JOIN Tracket_Master_Event_Zone_Seat S ON T.SeatId = S.SeatId
        WHERE S.IsDeleted = 0;

        DECLARE @SubTotal DECIMAL(18,2) = 0.00;
        SELECT @SubTotal = SUM(S.Price)
        FROM Tracket_Master_Booking_Seat BS
        INNER JOIN Tracket_Master_Event_Zone_Seat S ON BS.SeatId = S.SeatId
        WHERE BS.BookingId = @BookingId AND BS.IsDeleted = 0;

        DECLARE @TaxPercentage DECIMAL(18,2) = 0.00;
        SELECT @TaxPercentage = ISNULL(SUM(TaxPercentage), 0.00) 
        FROM Tracket_Master_Tax 
        WHERE IsActive = 1 AND IsDeleted = 0;

        DECLARE @TaxAmount DECIMAL(18,2) = @SubTotal * (@TaxPercentage / 100.0);
        DECLARE @FinalAmount DECIMAL(18,2) = @SubTotal + @TaxAmount;

        UPDATE Tracket_Master_Booking
        SET TotalAmount = @SubTotal,
            TaxAmount = @TaxAmount,
            FinalAmount = @FinalAmount,
            UpdatedDate = GETDATE()
        WHERE BookingId = @BookingId;

        DECLARE @TotalMembers INT = (SELECT COUNT(*) FROM #TempAttendees);
        
        IF @TotalMembers > 1
        BEGIN
            IF EXISTS(SELECT 1 FROM Tracket_Master_Group_Booking WHERE BookingId = @BookingId AND IsDeleted = 0)
            BEGIN
                UPDATE Tracket_Master_Group_Booking
                SET GroupName = @GroupName,
                    TotalMembers = @TotalMembers,
                    UpdatedBy = @UpdatedBy,
                    UpdatedDate = GETDATE()
                WHERE BookingId = @BookingId;
            END
            ELSE
            BEGIN
                INSERT INTO Tracket_Master_Group_Booking (BookingId, GroupName, TotalMembers, IsActive, IsDeleted, CreatedBy, CreatedDate)
                VALUES (@BookingId, @GroupName, @TotalMembers, 1, 0, @CreatedBy, GETDATE());
            END
        END

        COMMIT TRANSACTION;

        SELECT 200 AS ResultStatus, 'Group booking details saved successfully.' AS ResultMessage;

        DROP TABLE #TempAttendees;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 500 AS ResultStatus, ERROR_MESSAGE() AS ResultMessage;
    END CATCH
END;

