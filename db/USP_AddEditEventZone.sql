-- ============================================================
-- USP_AddEditEventZone
-- Altered to remove EventId from Tracket_Master_Event_Zone table
-- ============================================================
USE EVENT_Master;
GO

IF OBJECT_ID('dbo.USP_AddEditEventZone', 'P') IS NOT NULL
    DROP PROCEDURE dbo.USP_AddEditEventZone;
GO

CREATE PROCEDURE dbo.USP_AddEditEventZone
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ZoneId BIGINT, @ZoneRId NVARCHAR(50), @BlueprintId BIGINT, @ZoneName NVARCHAR(200),
            @ZoneCode NVARCHAR(50), @ZoneType NVARCHAR(100), @ColorCode NVARCHAR(20), @Capacity INT,
            @RowCount INT, @ColumnCount INT, @SeatPrice DECIMAL(18,2), @IsVIP BIT, @IsReserved BIT,
            @IsSeatSelectionAllowed BIT, @EntryGateId BIGINT, @SortOrder INT, @Remarks NVARCHAR(500), @IsActive BIT,
            @CreatedBy BIGINT, @CreatedFrom NVARCHAR(100), @UpdatedBy BIGINT, @UpdatedFrom NVARCHAR(100);

    SELECT 
        @ZoneId = ZoneId, @ZoneRId = ZoneRId, @BlueprintId = BlueprintId, @ZoneName = ZoneName,
        @ZoneCode = ZoneCode, @ZoneType = ZoneType, @ColorCode = ColorCode, @Capacity = Capacity,
        @RowCount = [RowCount], @ColumnCount = ColumnCount, @SeatPrice = SeatPrice, @IsVIP = IsVIP, @IsReserved = IsReserved,
        @IsSeatSelectionAllowed = IsSeatSelectionAllowed, @EntryGateId = EntryGateId, @SortOrder = SortOrder,
        @Remarks = Remarks, @IsActive = IsActive, @CreatedBy = CreatedBy, @CreatedFrom = CreatedFrom, @UpdatedBy = UpdatedBy, @UpdatedFrom = UpdatedFrom
    FROM OPENJSON(@JsonData)
    WITH (
        ZoneId BIGINT '$.ZoneId',
        ZoneRId NVARCHAR(50) '$.ZoneRId',
        BlueprintId BIGINT '$.BlueprintId',
        ZoneName NVARCHAR(200) '$.ZoneName',
        ZoneCode NVARCHAR(50) '$.ZoneCode',
        ZoneType NVARCHAR(100) '$.ZoneType',
        ColorCode NVARCHAR(20) '$.ColorCode',
        Capacity INT '$.Capacity',
        [RowCount] INT '$.RowCount',
        ColumnCount INT '$.ColumnCount',
        SeatPrice DECIMAL(18,2) '$.SeatPrice',
        IsVIP BIT '$.IsVIP',
        IsReserved BIT '$.IsReserved',
        IsSeatSelectionAllowed BIT '$.IsSeatSelectionAllowed',
        EntryGateId BIGINT '$.EntryGateId',
        SortOrder INT '$.SortOrder',
        Remarks NVARCHAR(500) '$.Remarks',
        IsActive BIT '$.IsActive',
        CreatedBy BIGINT '$.CreatedBy',
        CreatedFrom NVARCHAR(100) '$.CreatedFrom',
        UpdatedBy BIGINT '$.UpdatedBy',
        UpdatedFrom NVARCHAR(100) '$.UpdatedFrom'
    );

    IF NOT EXISTS (SELECT 1 FROM Tracket_Master_Event_Zone WHERE ZoneId = @ZoneId)
    BEGIN
        SET @ZoneRId = REPLACE(NEWID(), '-', '');
        INSERT INTO Tracket_Master_Event_Zone
            (ZoneRId, BlueprintId, ZoneName, ZoneCode, ZoneType, ColorCode, Capacity, [RowCount], ColumnCount, SeatPrice, IsVIP, IsReserved, IsSeatSelectionAllowed, EntryGateId, SortOrder, Remarks, IsActive, IsDeleted, CreatedBy, CreatedDate, CreatedFrom)
        VALUES
            (@ZoneRId, @BlueprintId, @ZoneName, @ZoneCode, @ZoneType, @ColorCode, @Capacity, @RowCount, @ColumnCount, @SeatPrice, ISNULL(@IsVIP, 0), ISNULL(@IsReserved, 0), ISNULL(@IsSeatSelectionAllowed, 1), @EntryGateId, @SortOrder, @Remarks, ISNULL(@IsActive, 1), 0, @CreatedBy, GETDATE(), @CreatedFrom);

        SELECT 201 AS ResultStatus, 'Zone created successfully.' AS ResultMessage, SCOPE_IDENTITY() AS ZoneId;
    END
    ELSE
    BEGIN
        UPDATE Tracket_Master_Event_Zone
        SET ZoneName = @ZoneName,
            ZoneCode = @ZoneCode,
            ZoneType = @ZoneType,
            ColorCode = @ColorCode,
            Capacity = @Capacity,
            [RowCount] = @RowCount,
            ColumnCount = @ColumnCount,
            SeatPrice = @SeatPrice,
            IsVIP = @IsVIP,
            IsReserved = @IsReserved,
            IsSeatSelectionAllowed = @IsSeatSelectionAllowed,
            EntryGateId = @EntryGateId,
            SortOrder = @SortOrder,
            Remarks = @Remarks,
            IsActive = @IsActive,
            UpdatedBy = @UpdatedBy,
            UpdatedDate = GETDATE(),
            UpdatedFrom = @UpdatedFrom
        WHERE ZoneId = @ZoneId;

        SELECT 200 AS ResultStatus, 'Zone updated successfully.' AS ResultMessage, @ZoneId AS ZoneId;
    END
END;
GO

PRINT 'USP_AddEditEventZone altered successfully.';
GO
