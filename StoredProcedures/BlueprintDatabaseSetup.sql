USE [EVENT_Master];
GO

-- ==========================================
-- CREATE TABLES
-- ==========================================

PRINT 'Creating Tracket_Master_Event_Blueprint Table...';
IF OBJECT_ID('Tracket_Master_Event_Blueprint', 'U') IS NULL
BEGIN
    CREATE TABLE Tracket_Master_Event_Blueprint (
        BlueprintId BIGINT IDENTITY(1,1) PRIMARY KEY,
        BlueprintRId NVARCHAR(50) NOT NULL,
        EventId BIGINT NOT NULL,
        BlueprintName NVARCHAR(200) NOT NULL,
        BlueprintImage NVARCHAR(500) NULL,
        BlueprintJson NVARCHAR(MAX) NULL,
        StagePosition NVARCHAR(50) NULL,
        TotalZones INT NULL DEFAULT 0,
        TotalSeats INT NULL DEFAULT 0,
        IsSeatBased BIT NOT NULL DEFAULT 1,
        IsPublished BIT NOT NULL DEFAULT 0,
        Remarks NVARCHAR(500) NULL,
        IsDeleted BIT NOT NULL DEFAULT 0,
        CreatedBy BIGINT NULL,
        CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
        CreatedFrom NVARCHAR(100) NULL,
        UpdatedBy BIGINT NULL,
        UpdatedDate DATETIME NULL,
        UpdatedFrom NVARCHAR(100) NULL
    );
END
GO

PRINT 'Creating Tracket_Master_Event_Zone Table...';
IF OBJECT_ID('Tracket_Master_Event_Zone', 'U') IS NULL
BEGIN
    CREATE TABLE Tracket_Master_Event_Zone (
        ZoneId BIGINT IDENTITY(1,1) PRIMARY KEY,
        ZoneRId NVARCHAR(50) NOT NULL,
        BlueprintId BIGINT NOT NULL,
        EventId BIGINT NOT NULL,
        ZoneName NVARCHAR(200) NOT NULL,
        ZoneCode NVARCHAR(50) NOT NULL,
        ZoneType NVARCHAR(100) NOT NULL,
        ColorCode NVARCHAR(20) NULL,
        Capacity INT NOT NULL DEFAULT 0,
        [RowCount] INT NOT NULL DEFAULT 0,
        ColumnCount INT NOT NULL DEFAULT 0,
        SeatPrice DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        IsVIP BIT NOT NULL DEFAULT 0,
        IsReserved BIT NOT NULL DEFAULT 0,
        IsSeatSelectionAllowed BIT NOT NULL DEFAULT 1,
        EntryGateId BIGINT NULL,
        SortOrder INT NULL DEFAULT 0,
        Remarks NVARCHAR(500) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        IsDeleted BIT NOT NULL DEFAULT 0,
        CreatedBy BIGINT NULL,
        CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
        CreatedFrom NVARCHAR(100) NULL,
        UpdatedBy BIGINT NULL,
        UpdatedDate DATETIME NULL,
        UpdatedFrom NVARCHAR(100) NULL
    );
END
GO

PRINT 'Creating Tracket_Master_Event_Zone_Seat Table...';
IF OBJECT_ID('Tracket_Master_Event_Zone_Seat', 'U') IS NULL
BEGIN
    CREATE TABLE Tracket_Master_Event_Zone_Seat (
        SeatId BIGINT IDENTITY(1,1) PRIMARY KEY,
        SeatRId NVARCHAR(50) NOT NULL,
        ZoneId BIGINT NOT NULL,
        EventId BIGINT NOT NULL,
        SeatNumber NVARCHAR(50) NOT NULL,
        RowName NVARCHAR(20) NULL,
        ColumnNo INT NULL,
        SeatStatus NVARCHAR(50) NOT NULL DEFAULT 'Available',
        IsBooked BIT NOT NULL DEFAULT 0,
        IsBlocked BIT NOT NULL DEFAULT 0,
        IsReserved BIT NOT NULL DEFAULT 0,
        BookingId BIGINT NULL,
        Price DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        QRCode NVARCHAR(500) NULL,
        Barcode NVARCHAR(500) NULL,
        Remarks NVARCHAR(500) NULL,
        IsDeleted BIT NOT NULL DEFAULT 0,
        CreatedBy BIGINT NULL,
        CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
        CreatedFrom NVARCHAR(100) NULL,
        UpdatedBy BIGINT NULL,
        UpdatedDate DATETIME NULL,
        UpdatedFrom NVARCHAR(100) NULL
    );
END
GO

PRINT 'Creating Tracket_Master_Event_Entry_Gate Table...';
IF OBJECT_ID('Tracket_Master_Event_Entry_Gate', 'U') IS NULL
BEGIN
    CREATE TABLE Tracket_Master_Event_Entry_Gate (
        EntryGateId BIGINT IDENTITY(1,1) PRIMARY KEY,
        EntryGateRId NVARCHAR(50) NOT NULL,
        EventId BIGINT NOT NULL,
        GateName NVARCHAR(200) NOT NULL,
        GateCode NVARCHAR(50) NOT NULL,
        GateType NVARCHAR(100) NOT NULL,
        Latitude NVARCHAR(100) NULL,
        Longitude NVARCHAR(100) NULL,
        ScannerUserId BIGINT NULL,
        Remarks NVARCHAR(500) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        IsDeleted BIT NOT NULL DEFAULT 0,
        CreatedBy BIGINT NULL,
        CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
        CreatedFrom NVARCHAR(100) NULL,
        UpdatedBy BIGINT NULL,
        UpdatedDate DATETIME NULL,
        UpdatedFrom NVARCHAR(100) NULL
    );
END
GO

PRINT 'Creating Tracket_Master_Event_Zone_Pricing Table...';
IF OBJECT_ID('Tracket_Master_Event_Zone_Pricing', 'U') IS NULL
BEGIN
    CREATE TABLE Tracket_Master_Event_Zone_Pricing (
        ZonePricingId BIGINT IDENTITY(1,1) PRIMARY KEY,
        ZonePricingRId NVARCHAR(50) NOT NULL,
        EventId BIGINT NOT NULL,
        ZoneId BIGINT NOT NULL,
        SlotId BIGINT NULL,
        Price DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        TaxPercentage DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        FinalPrice DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        IsEarlyBird BIT NOT NULL DEFAULT 0,
        ValidFrom DATETIME NULL,
        ValidTo DATETIME NULL,
        Remarks NVARCHAR(500) NULL,
        IsDeleted BIT NOT NULL DEFAULT 0,
        CreatedBy BIGINT NULL,
        CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
        CreatedFrom NVARCHAR(100) NULL,
        UpdatedBy BIGINT NULL,
        UpdatedDate DATETIME NULL,
        UpdatedFrom NVARCHAR(100) NULL
    );
END
GO


-- ==========================================
-- STORED PROCEDURES
-- ==========================================

-- 1. USP_AddEditEventBlueprint
CREATE OR ALTER PROCEDURE USP_AddEditEventBlueprint
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @BlueprintId BIGINT, @BlueprintRId NVARCHAR(50), @EventId BIGINT, @BlueprintName NVARCHAR(200),
            @BlueprintImage NVARCHAR(500), @BlueprintJson NVARCHAR(MAX), @StagePosition NVARCHAR(50),
            @TotalZones INT, @TotalSeats INT, @IsSeatBased BIT, @IsPublished BIT, @Remarks NVARCHAR(500),
            @CreatedBy BIGINT, @CreatedFrom NVARCHAR(100), @UpdatedBy BIGINT, @UpdatedFrom NVARCHAR(100);

    SELECT 
        @BlueprintId = BlueprintId, @BlueprintRId = BlueprintRId, @EventId = EventId, @BlueprintName = BlueprintName,
        @BlueprintImage = BlueprintImage, @BlueprintJson = BlueprintJson, @StagePosition = StagePosition,
        @TotalZones = TotalZones, @TotalSeats = TotalSeats, @IsSeatBased = IsSeatBased, @IsPublished = IsPublished,
        @Remarks = Remarks, @CreatedBy = CreatedBy, @CreatedFrom = CreatedFrom, @UpdatedBy = UpdatedBy, @UpdatedFrom = UpdatedFrom
    FROM OPENJSON(@JsonData)
    WITH (
        BlueprintId BIGINT '$.BlueprintId',
        BlueprintRId NVARCHAR(50) '$.BlueprintRId',
        EventId BIGINT '$.EventId',
        BlueprintName NVARCHAR(200) '$.BlueprintName',
        BlueprintImage NVARCHAR(500) '$.BlueprintImage',
        BlueprintJson NVARCHAR(MAX) '$.BlueprintJson',
        StagePosition NVARCHAR(50) '$.StagePosition',
        TotalZones INT '$.TotalZones',
        TotalSeats INT '$.TotalSeats',
        IsSeatBased BIT '$.IsSeatBased',
        IsPublished BIT '$.IsPublished',
        Remarks NVARCHAR(500) '$.Remarks',
        CreatedBy BIGINT '$.CreatedBy',
        CreatedFrom NVARCHAR(100) '$.CreatedFrom',
        UpdatedBy BIGINT '$.UpdatedBy',
        UpdatedFrom NVARCHAR(100) '$.UpdatedFrom'
    );

    IF @BlueprintId = 0
    BEGIN
        SET @BlueprintRId = REPLACE(NEWID(), '-', '');
        INSERT INTO Tracket_Master_Event_Blueprint 
            (BlueprintRId, EventId, BlueprintName, BlueprintImage, BlueprintJson, StagePosition, TotalZones, TotalSeats, IsSeatBased, IsPublished, Remarks, IsDeleted, CreatedBy, CreatedDate, CreatedFrom)
        VALUES 
            (@BlueprintRId, @EventId, @BlueprintName, @BlueprintImage, @BlueprintJson, @StagePosition, @TotalZones, @TotalSeats, ISNULL(@IsSeatBased, 1), ISNULL(@IsPublished, 0), @Remarks, 0, @CreatedBy, GETDATE(), @CreatedFrom);

        SELECT 201 AS ResultStatus, 'Blueprint created successfully.' AS ResultMessage, SCOPE_IDENTITY() AS BlueprintId;
    END
    ELSE
    BEGIN
        UPDATE Tracket_Master_Event_Blueprint
        SET BlueprintName = @BlueprintName,
            BlueprintImage = ISNULL(@BlueprintImage, BlueprintImage),
            BlueprintJson = ISNULL(@BlueprintJson, BlueprintJson),
            StagePosition = @StagePosition,
            TotalZones = @TotalZones,
            TotalSeats = @TotalSeats,
            IsSeatBased = @IsSeatBased,
            IsPublished = @IsPublished,
            Remarks = @Remarks,
            UpdatedBy = @UpdatedBy,
            UpdatedDate = GETDATE(),
            UpdatedFrom = @UpdatedFrom
        WHERE BlueprintId = @BlueprintId;

        SELECT 200 AS ResultStatus, 'Blueprint updated successfully.' AS ResultMessage, @BlueprintId AS BlueprintId;
    END
END;
GO

-- 2. USP_GetEventBlueprintById
CREATE OR ALTER PROCEDURE USP_GetEventBlueprintById
    @BlueprintId BIGINT = NULL,
    @BlueprintRId NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM Tracket_Master_Event_Blueprint
    WHERE (BlueprintId = @BlueprintId OR @BlueprintId IS NULL)
      AND (BlueprintRId = @BlueprintRId OR @BlueprintRId IS NULL)
      AND IsDeleted = 0;
END;
GO

-- 3. USP_GetEventBlueprintList
CREATE OR ALTER PROCEDURE USP_GetEventBlueprintList
    @EventId BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM Tracket_Master_Event_Blueprint
    WHERE EventId = @EventId AND IsDeleted = 0;
END;
GO

-- 4. USP_DeleteEventBlueprint
CREATE OR ALTER PROCEDURE USP_DeleteEventBlueprint
    @BlueprintId BIGINT = NULL,
    @BlueprintRId NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Tracket_Master_Event_Blueprint
    SET IsDeleted = 1
    WHERE (BlueprintId = @BlueprintId OR @BlueprintId IS NULL)
      AND (BlueprintRId = @BlueprintRId OR @BlueprintRId IS NULL);

    SELECT 200 AS ResultStatus, 'Blueprint deleted successfully.' AS ResultMessage;
END;
GO

-- 5. USP_AddEditEventZone
CREATE OR ALTER PROCEDURE USP_AddEditEventZone
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ZoneId BIGINT, @ZoneRId NVARCHAR(50), @BlueprintId BIGINT, @EventId BIGINT, @ZoneName NVARCHAR(200),
            @ZoneCode NVARCHAR(50), @ZoneType NVARCHAR(100), @ColorCode NVARCHAR(20), @Capacity INT,
            @RowCount INT, @ColumnCount INT, @SeatPrice DECIMAL(18,2), @IsVIP BIT, @IsReserved BIT,
            @IsSeatSelectionAllowed BIT, @EntryGateId BIGINT, @SortOrder INT, @Remarks NVARCHAR(500), @IsActive BIT,
            @CreatedBy BIGINT, @CreatedFrom NVARCHAR(100), @UpdatedBy BIGINT, @UpdatedFrom NVARCHAR(100);

    SELECT 
        @ZoneId = ZoneId, @ZoneRId = ZoneRId, @BlueprintId = BlueprintId, @EventId = EventId, @ZoneName = ZoneName,
        @ZoneCode = ZoneCode, @ZoneType = ZoneType, @ColorCode = ColorCode, @Capacity = Capacity,
        @RowCount = [RowCount], @ColumnCount = ColumnCount, @SeatPrice = SeatPrice, @IsVIP = IsVIP, @IsReserved = IsReserved,
        @IsSeatSelectionAllowed = IsSeatSelectionAllowed, @EntryGateId = EntryGateId, @SortOrder = SortOrder,
        @Remarks = Remarks, @IsActive = IsActive, @CreatedBy = CreatedBy, @CreatedFrom = CreatedFrom, @UpdatedBy = UpdatedBy, @UpdatedFrom = UpdatedFrom
    FROM OPENJSON(@JsonData)
    WITH (
        ZoneId BIGINT '$.ZoneId',
        ZoneRId NVARCHAR(50) '$.ZoneRId',
        BlueprintId BIGINT '$.BlueprintId',
        EventId BIGINT '$.EventId',
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

    IF @ZoneId = 0
    BEGIN
        SET @ZoneRId = REPLACE(NEWID(), '-', '');
        INSERT INTO Tracket_Master_Event_Zone
            (ZoneRId, BlueprintId, EventId, ZoneName, ZoneCode, ZoneType, ColorCode, Capacity, [RowCount], ColumnCount, SeatPrice, IsVIP, IsReserved, IsSeatSelectionAllowed, EntryGateId, SortOrder, Remarks, IsActive, IsDeleted, CreatedBy, CreatedDate, CreatedFrom)
        VALUES
            (@ZoneRId, @BlueprintId, @EventId, @ZoneName, @ZoneCode, @ZoneType, @ColorCode, @Capacity, @RowCount, @ColumnCount, @SeatPrice, ISNULL(@IsVIP, 0), ISNULL(@IsReserved, 0), ISNULL(@IsSeatSelectionAllowed, 1), @EntryGateId, @SortOrder, @Remarks, ISNULL(@IsActive, 1), 0, @CreatedBy, GETDATE(), @CreatedFrom);

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

-- 6. USP_GetEventZoneById
CREATE OR ALTER PROCEDURE USP_GetEventZoneById
    @ZoneId BIGINT = NULL,
    @ZoneRId NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM Tracket_Master_Event_Zone
    WHERE (ZoneId = @ZoneId OR @ZoneId IS NULL)
      AND (ZoneRId = @ZoneRId OR @ZoneRId IS NULL)
      AND IsDeleted = 0;
END;
GO

-- 7. USP_GetEventZoneList
CREATE OR ALTER PROCEDURE USP_GetEventZoneList
    @BlueprintId BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Z.*, G.GateName
    FROM Tracket_Master_Event_Zone Z
    LEFT JOIN Tracket_Master_Event_Entry_Gate G ON Z.EntryGateId = G.EntryGateId
    WHERE Z.BlueprintId = @BlueprintId AND Z.IsDeleted = 0;
END;
GO

-- 8. USP_DeleteEventZone
CREATE OR ALTER PROCEDURE USP_DeleteEventZone
    @ZoneId BIGINT = NULL,
    @ZoneRId NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Tracket_Master_Event_Zone
    SET IsDeleted = 1
    WHERE (ZoneId = @ZoneId OR @ZoneId IS NULL)
      AND (ZoneRId = @ZoneRId OR @ZoneRId IS NULL);

    SELECT 200 AS ResultStatus, 'Zone deleted successfully.' AS ResultMessage;
END;
GO

-- 9. USP_AddEditEventZoneSeat
CREATE OR ALTER PROCEDURE USP_AddEditEventZoneSeat
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Parse seats array and execute bulk insert/update
    -- Temporary Table for parsing
    CREATE TABLE #TempSeats (
        SeatId BIGINT, SeatRId NVARCHAR(50), ZoneId BIGINT, EventId BIGINT, SeatNumber NVARCHAR(50),
        RowName NVARCHAR(20), ColumnNo INT, SeatStatus NVARCHAR(50), IsBooked BIT, IsBlocked BIT, IsReserved BIT,
        Price DECIMAL(18,2), QRCode NVARCHAR(500), Barcode NVARCHAR(500), Remarks NVARCHAR(500), CreatedBy BIGINT
    );

    INSERT INTO #TempSeats
    SELECT 
        SeatId, SeatRId, ZoneId, EventId, SeatNumber, RowName, ColumnNo, SeatStatus, IsBooked, IsBlocked, IsReserved,
        Price, QRCode, Barcode, Remarks, CreatedBy
    FROM OPENJSON(@JsonData)
    WITH (
        SeatId BIGINT '$.SeatId',
        SeatRId NVARCHAR(50) '$.SeatRId',
        ZoneId BIGINT '$.ZoneId',
        EventId BIGINT '$.EventId',
        SeatNumber NVARCHAR(50) '$.SeatNumber',
        RowName NVARCHAR(20) '$.RowName',
        ColumnNo INT '$.ColumnNo',
        SeatStatus NVARCHAR(50) '$.SeatStatus',
        IsBooked BIT '$.IsBooked',
        IsBlocked BIT '$.IsBlocked',
        IsReserved BIT '$.IsReserved',
        Price DECIMAL(18,2) '$.Price',
        QRCode NVARCHAR(500) '$.QRCode',
        Barcode NVARCHAR(500) '$.Barcode',
        Remarks NVARCHAR(500) '$.Remarks',
        CreatedBy BIGINT '$.CreatedBy'
    );

    -- Insert new seats
    INSERT INTO Tracket_Master_Event_Zone_Seat
        (SeatRId, ZoneId, EventId, SeatNumber, RowName, ColumnNo, SeatStatus, IsBooked, IsBlocked, IsReserved, Price, QRCode, Barcode, Remarks, IsDeleted, CreatedBy, CreatedDate, CreatedFrom)
    SELECT 
        ISNULL(SeatRId, REPLACE(NEWID(), '-', '')), ZoneId, EventId, SeatNumber, RowName, ColumnNo, ISNULL(SeatStatus, 'Available'), ISNULL(IsBooked, 0), ISNULL(IsBlocked, 0), ISNULL(IsReserved, 0), Price, QRCode, Barcode, Remarks, 0, CreatedBy, GETDATE(), 'WebUI'
    FROM #TempSeats
    WHERE SeatId = 0 OR SeatId IS NULL;

    -- Update existing seats
    UPDATE S
    SET S.SeatNumber = T.SeatNumber,
        S.RowName = T.RowName,
        S.ColumnNo = T.ColumnNo,
        S.SeatStatus = T.SeatStatus,
        S.IsBooked = T.IsBooked,
        S.IsBlocked = T.IsBlocked,
        S.IsReserved = T.IsReserved,
        S.Price = T.Price,
        S.Remarks = T.Remarks,
        S.UpdatedDate = GETDATE()
    FROM Tracket_Master_Event_Zone_Seat S
    INNER JOIN #TempSeats T ON S.SeatId = T.SeatId
    WHERE T.SeatId > 0;

    DROP TABLE #TempSeats;

    SELECT 200 AS ResultStatus, 'Seats saved successfully.' AS ResultMessage;
END;
GO

-- 10. USP_GetEventZoneSeatList
CREATE OR ALTER PROCEDURE USP_GetEventZoneSeatList
    @ZoneId BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM Tracket_Master_Event_Zone_Seat
    WHERE ZoneId = @ZoneId AND IsDeleted = 0;
END;
GO

-- 11. USP_AddEditEventEntryGate
CREATE OR ALTER PROCEDURE USP_AddEditEventEntryGate
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @EntryGateId BIGINT, @EntryGateRId NVARCHAR(50), @EventId BIGINT, @GateName NVARCHAR(200),
            @GateCode NVARCHAR(50), @GateType NVARCHAR(100), @Latitude NVARCHAR(100), @Longitude NVARCHAR(100),
            @ScannerUserId BIGINT, @Remarks NVARCHAR(500), @IsActive BIT,
            @CreatedBy BIGINT, @CreatedFrom NVARCHAR(100), @UpdatedBy BIGINT, @UpdatedFrom NVARCHAR(100);

    SELECT 
        @EntryGateId = EntryGateId, @EntryGateRId = EntryGateRId, @EventId = EventId, @GateName = GateName,
        @GateCode = GateCode, @GateType = GateType, @Latitude = Latitude, @Longitude = Longitude,
        @ScannerUserId = ScannerUserId, @Remarks = Remarks, @IsActive = IsActive,
        @CreatedBy = CreatedBy, @CreatedFrom = CreatedFrom, @UpdatedBy = UpdatedBy, @UpdatedFrom = UpdatedFrom
    FROM OPENJSON(@JsonData)
    WITH (
        EntryGateId BIGINT '$.EntryGateId',
        EntryGateRId NVARCHAR(50) '$.EntryGateRId',
        EventId BIGINT '$.EventId',
        GateName NVARCHAR(200) '$.GateName',
        GateCode NVARCHAR(50) '$.GateCode',
        GateType NVARCHAR(100) '$.GateType',
        Latitude NVARCHAR(100) '$.Latitude',
        Longitude NVARCHAR(100) '$.Longitude',
        ScannerUserId BIGINT '$.ScannerUserId',
        Remarks NVARCHAR(500) '$.Remarks',
        IsActive BIT '$.IsActive',
        CreatedBy BIGINT '$.CreatedBy',
        CreatedFrom NVARCHAR(100) '$.CreatedFrom',
        UpdatedBy BIGINT '$.UpdatedBy',
        UpdatedFrom NVARCHAR(100) '$.UpdatedFrom'
    );

    IF @EntryGateId = 0
    BEGIN
        SET @EntryGateRId = REPLACE(NEWID(), '-', '');
        INSERT INTO Tracket_Master_Event_Entry_Gate
            (EntryGateRId, EventId, GateName, GateCode, GateType, Latitude, Longitude, ScannerUserId, Remarks, IsActive, IsDeleted, CreatedBy, CreatedDate, CreatedFrom)
        VALUES
            (@EntryGateRId, @EventId, @GateName, @GateCode, @GateType, @Latitude, @Longitude, @ScannerUserId, @Remarks, ISNULL(@IsActive, 1), 0, @CreatedBy, GETDATE(), @CreatedFrom);

        SELECT 201 AS ResultStatus, 'Entry gate created successfully.' AS ResultMessage, SCOPE_IDENTITY() AS EntryGateId;
    END
    ELSE
    BEGIN
        UPDATE Tracket_Master_Event_Entry_Gate
        SET GateName = @GateName,
            GateCode = @GateCode,
            GateType = @GateType,
            Latitude = @Latitude,
            Longitude = @Longitude,
            ScannerUserId = @ScannerUserId,
            Remarks = @Remarks,
            IsActive = @IsActive,
            UpdatedBy = @UpdatedBy,
            UpdatedDate = GETDATE(),
            UpdatedFrom = @UpdatedFrom
        WHERE EntryGateId = @EntryGateId;

        SELECT 200 AS ResultStatus, 'Entry gate updated successfully.' AS ResultMessage, @EntryGateId AS EntryGateId;
    END
END;
GO

-- 12. USP_GetEventEntryGateList
CREATE OR ALTER PROCEDURE USP_GetEventEntryGateList
    @EventId BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM Tracket_Master_Event_Entry_Gate
    WHERE EventId = @EventId AND IsDeleted = 0;
END;
GO

-- 13. USP_AddEditEventZonePricing
CREATE OR ALTER PROCEDURE USP_AddEditEventZonePricing
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ZonePricingId BIGINT, @ZonePricingRId NVARCHAR(50), @EventId BIGINT, @ZoneId BIGINT,
            @SlotId BIGINT, @Price DECIMAL(18,2), @TaxPercentage DECIMAL(18,2), @FinalPrice DECIMAL(18,2),
            @IsEarlyBird BIT, @ValidFrom DATETIME, @ValidTo DATETIME, @Remarks NVARCHAR(500),
            @CreatedBy BIGINT, @CreatedFrom NVARCHAR(100), @UpdatedBy BIGINT, @UpdatedFrom NVARCHAR(100);

    SELECT 
        @ZonePricingId = ZonePricingId, @ZonePricingRId = ZonePricingRId, @EventId = EventId, @ZoneId = ZoneId,
        @SlotId = SlotId, @Price = Price, @TaxPercentage = TaxPercentage, @FinalPrice = FinalPrice,
        @IsEarlyBird = IsEarlyBird, @ValidFrom = ValidFrom, @ValidTo = ValidTo, @Remarks = Remarks,
        @CreatedBy = CreatedBy, @CreatedFrom = CreatedFrom, @UpdatedBy = UpdatedBy, @UpdatedFrom = UpdatedFrom
    FROM OPENJSON(@JsonData)
    WITH (
        ZonePricingId BIGINT '$.ZonePricingId',
        ZonePricingRId NVARCHAR(50) '$.ZonePricingRId',
        EventId BIGINT '$.EventId',
        ZoneId BIGINT '$.ZoneId',
        SlotId BIGINT '$.SlotId',
        Price DECIMAL(18,2) '$.Price',
        TaxPercentage DECIMAL(18,2) '$.TaxPercentage',
        FinalPrice DECIMAL(18,2) '$.FinalPrice',
        IsEarlyBird BIT '$.IsEarlyBird',
        ValidFrom DATETIME '$.ValidFrom',
        ValidTo DATETIME '$.ValidTo',
        Remarks NVARCHAR(500) '$.Remarks',
        CreatedBy BIGINT '$.CreatedBy',
        CreatedFrom NVARCHAR(100) '$.CreatedFrom',
        UpdatedBy BIGINT '$.UpdatedBy',
        UpdatedFrom NVARCHAR(100) '$.UpdatedFrom'
    );

    IF @ZonePricingId = 0
    BEGIN
        SET @ZonePricingRId = REPLACE(NEWID(), '-', '');
        INSERT INTO Tracket_Master_Event_Zone_Pricing
            (ZonePricingRId, EventId, ZoneId, SlotId, Price, TaxPercentage, FinalPrice, IsEarlyBird, ValidFrom, ValidTo, Remarks, IsDeleted, CreatedBy, CreatedDate, CreatedFrom)
        VALUES
            (@ZonePricingRId, @EventId, @ZoneId, @SlotId, @Price, @TaxPercentage, @FinalPrice, ISNULL(@IsEarlyBird, 0), @ValidFrom, @ValidTo, @Remarks, 0, @CreatedBy, GETDATE(), @CreatedFrom);

        SELECT 201 AS ResultStatus, 'Zone pricing created successfully.' AS ResultMessage, SCOPE_IDENTITY() AS ZonePricingId;
    END
    ELSE
    BEGIN
        UPDATE Tracket_Master_Event_Zone_Pricing
        SET Price = @Price,
            TaxPercentage = @TaxPercentage,
            FinalPrice = @FinalPrice,
            IsEarlyBird = @IsEarlyBird,
            ValidFrom = @ValidFrom,
            ValidTo = @ValidTo,
            Remarks = @Remarks,
            UpdatedBy = @UpdatedBy,
            UpdatedDate = GETDATE(),
            UpdatedFrom = @UpdatedFrom
        WHERE ZonePricingId = @ZonePricingId;

        SELECT 200 AS ResultStatus, 'Zone pricing updated successfully.' AS ResultMessage, @ZonePricingId AS ZonePricingId;
    END
END;
GO

-- 14. USP_GetEventZonePricingList
CREATE OR ALTER PROCEDURE USP_GetEventZonePricingList
    @EventId BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM Tracket_Master_Event_Zone_Pricing
    WHERE EventId = @EventId AND IsDeleted = 0;
END;
GO

PRINT 'BlueprintDatabaseSetup run completed successfully.';
GO
