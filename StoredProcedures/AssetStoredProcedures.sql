-- ==========================================
-- MODULE 4: ASSET MANAGEMENT MODULE STORED PROCEDURES
-- ==========================================

-- 1. USP_AddEditAssetType
CREATE OR ALTER PROCEDURE USP_AddEditAssetType
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @AssetTypeId INT, @TypeName NVARCHAR(100), @Description NVARCHAR(255);

    SELECT 
        @AssetTypeId = AssetTypeId,
        @TypeName = TypeName,
        @Description = Description
    FROM OPENJSON(@JsonData)
    WITH (
        AssetTypeId INT '$.AssetTypeId',
        TypeName NVARCHAR(100) '$.TypeName',
        Description NVARCHAR(255) '$.Description'
    );

    IF @AssetTypeId = 0
    BEGIN
        IF EXISTS(SELECT 1 FROM Tracket_Master_Asset_Type WHERE TypeName = @TypeName AND IsDeleted = 0)
        BEGIN
            SELECT 409 AS ResultStatus, 'Asset type already exists.' AS ResultMessage;
            RETURN;
        END

        INSERT INTO Tracket_Master_Asset_Type (TypeName, Description, IsDeleted)
        VALUES (@TypeName, @Description, 0);

        SET @AssetTypeId = SCOPE_IDENTITY();
        SELECT 201 AS ResultStatus, 'Asset type created successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        IF EXISTS(SELECT 1 FROM Tracket_Master_Asset_Type WHERE TypeName = @TypeName AND AssetTypeId <> @AssetTypeId AND IsDeleted = 0)
        BEGIN
            SELECT 409 AS ResultStatus, 'Asset type already exists.' AS ResultMessage;
            RETURN;
        END

        UPDATE Tracket_Master_Asset_Type 
        SET TypeName = @TypeName, Description = @Description 
        WHERE AssetTypeId = @AssetTypeId;

        SELECT 200 AS ResultStatus, 'Asset type updated successfully.' AS ResultMessage;
    END

    SELECT AssetTypeId, TypeName, Description 
    FROM Tracket_Master_Asset_Type 
    WHERE AssetTypeId = @AssetTypeId;
END;
GO

-- 2. USP_GetAssetTypes
CREATE OR ALTER PROCEDURE USP_GetAssetTypes
AS
BEGIN
    SET NOCOUNT ON;

    SELECT AssetTypeId, TypeName, Description 
    FROM Tracket_Master_Asset_Type 
    WHERE IsDeleted = 0;
END;
GO

-- 3. USP_AddEditAsset
CREATE OR ALTER PROCEDURE USP_AddEditAsset
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @AssetId INT, @AssetRId NVARCHAR(50), @AssetName NVARCHAR(100), @AssetTypeId INT, @AssetCode NVARCHAR(100),
            @Description NVARCHAR(MAX), @TotalQty INT, @AvailableQty INT, @DamageQty INT, @UnitPrice DECIMAL(18,2), @PurchaseDate DATE, @VendorName NVARCHAR(300),
            @CreatedBy NVARCHAR(200), @CreatedFrom NVARCHAR(100), @UpdatedBy NVARCHAR(200), @UpdatedFrom NVARCHAR(100);

    SELECT 
        @AssetId = AssetId,
        @AssetRId = AssetRId,
        @AssetName = AssetName,
        @AssetTypeId = AssetTypeId,
        @AssetCode = AssetCode,
        @Description = Description,
        @TotalQty = TotalQty,
        @AvailableQty = AvailableQty,
        @DamageQty = DamageQty,
        @UnitPrice = UnitPrice,
        @PurchaseDate = PurchaseDate,
        @VendorName = VendorName,
        @CreatedBy = CreatedBy,
        @CreatedFrom = CreatedFrom,
        @UpdatedBy = UpdatedBy,
        @UpdatedFrom = UpdatedFrom
    FROM OPENJSON(@JsonData)
    WITH (
        AssetId INT '$.AssetId',
        AssetRId NVARCHAR(50) '$.AssetRId',
        AssetName NVARCHAR(100) '$.AssetName',
        AssetTypeId INT '$.AssetTypeId',
        AssetCode NVARCHAR(100) '$.AssetCode',
        Description NVARCHAR(MAX) '$.Description',
        TotalQty INT '$.TotalQty',
        AvailableQty INT '$.AvailableQty',
        DamageQty INT '$.DamageQty',
        UnitPrice DECIMAL(18,2) '$.UnitPrice',
        PurchaseDate DATE '$.PurchaseDate',
        VendorName NVARCHAR(300) '$.VendorName',
        CreatedBy NVARCHAR(200) '$.CreatedBy',
        CreatedFrom NVARCHAR(100) '$.CreatedFrom',
        UpdatedBy NVARCHAR(200) '$.UpdatedBy',
        UpdatedFrom NVARCHAR(100) '$.UpdatedFrom'
    );

    -- Fallbacks
    IF @AssetCode IS NULL OR @AssetCode = ''
    BEGIN
        SELECT @AssetCode = SerialNumber FROM OPENJSON(@JsonData) WITH (SerialNumber NVARCHAR(100) '$.SerialNumber');
    END
    IF @TotalQty IS NULL OR @TotalQty = 0
    BEGIN
        SELECT @TotalQty = TotalQuantity FROM OPENJSON(@JsonData) WITH (TotalQuantity INT '$.TotalQuantity');
    END
    IF @AvailableQty IS NULL OR @AvailableQty = 0
    BEGIN
        SELECT @AvailableQty = AvailableQuantity FROM OPENJSON(@JsonData) WITH (AvailableQuantity INT '$.AvailableQuantity');
    END

    -- If availableQty is still NULL/0, default it to TotalQty - DamageQty
    IF @AvailableQty IS NULL OR @AvailableQty = 0
    BEGIN
        SET @AvailableQty = ISNULL(@TotalQty, 0) - ISNULL(@DamageQty, 0);
    END

    IF @AssetId = 0 AND @AssetRId IS NOT NULL AND @AssetRId <> ''
    BEGIN
        SELECT @AssetId = AssetId 
        FROM Tracket_Master_Asset 
        WHERE AssetRId = @AssetRId AND IsDeleted = 0;
    END

    SET @AssetRId = ISNULL(NULLIF(@AssetRId, ''), LOWER(REPLACE(CAST(NEWID() AS VARCHAR(36)), '-', '')));

    IF @AssetId IS NULL OR @AssetId = 0
    BEGIN
        IF EXISTS(SELECT 1 FROM Tracket_Master_Asset WHERE AssetCode = @AssetCode AND IsDeleted = 0)
        BEGIN
            SELECT 409 AS ResultStatus, 'Asset with code already exists.' AS ResultMessage;
            RETURN;
        END

        INSERT INTO Tracket_Master_Asset (
            AssetRId, AssetName, AssetTypeId, AssetCode, Description, 
            TotalQty, AvailableQty, DamageQty, UnitPrice, PurchaseDate, 
            VendorName, IsDeleted, CreatedBy, CreatedDate, CreatedFrom
        )
        VALUES (
            @AssetRId, @AssetName, @AssetTypeId, @AssetCode, @Description, 
            @TotalQty, @AvailableQty, ISNULL(@DamageQty, 0), @UnitPrice, @PurchaseDate, 
            @VendorName, 0, @CreatedBy, GETDATE(), @CreatedFrom
        );

        SET @AssetId = SCOPE_IDENTITY();
        SELECT 201 AS ResultStatus, 'Asset registered successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        UPDATE Tracket_Master_Asset 
        SET 
            AssetRId = @AssetRId,
            AssetName = @AssetName, 
            AssetTypeId = @AssetTypeId, 
            AssetCode = @AssetCode, 
            Description = @Description,
            TotalQty = @TotalQty, 
            AvailableQty = @AvailableQty,
            DamageQty = ISNULL(@DamageQty, 0),
            UnitPrice = @UnitPrice,
            PurchaseDate = @PurchaseDate,
            VendorName = @VendorName,
            UpdatedBy = @UpdatedBy,
            UpdatedDate = GETDATE(),
            UpdatedFrom = @UpdatedFrom
        WHERE AssetId = @AssetId;

        SELECT 200 AS ResultStatus, 'Asset updated successfully.' AS ResultMessage;
    END

    SELECT A.AssetId, A.AssetRId, A.AssetName, A.AssetTypeId, T.AssetTypeName, T.AssetTypeName AS TypeName, A.AssetCode, A.AssetCode AS SerialNumber, 
           A.Description, A.TotalQty, A.TotalQty AS TotalQuantity, A.AvailableQty, A.AvailableQty AS AvailableQuantity, A.DamageQty, A.UnitPrice, A.PurchaseDate, A.VendorName,
           A.CreatedBy, A.CreatedDate, A.CreatedFrom, A.UpdatedBy, A.UpdatedDate, A.UpdatedFrom
    FROM Tracket_Master_Asset A
    INNER JOIN Tracket_Master_Asset_Type T ON A.AssetTypeId = T.AssetTypeId
    WHERE A.AssetId = @AssetId;
END;
GO

-- 4. USP_GetAssets
CREATE OR ALTER PROCEDURE USP_GetAssets
AS
BEGIN
    SET NOCOUNT ON;

    SELECT A.AssetId, A.AssetRId, A.AssetName, A.AssetTypeId, T.AssetTypeName, T.AssetTypeName AS TypeName, A.AssetCode, A.AssetCode AS SerialNumber, 
           A.Description, A.TotalQty, A.TotalQty AS TotalQuantity, A.AvailableQty, A.AvailableQty AS AvailableQuantity, A.DamageQty, A.UnitPrice, A.PurchaseDate, A.VendorName,
           A.CreatedBy, A.CreatedDate, A.CreatedFrom, A.UpdatedBy, A.UpdatedDate, A.UpdatedFrom
    FROM Tracket_Master_Asset A
    INNER JOIN Tracket_Master_Asset_Type T ON A.AssetTypeId = T.AssetTypeId
    WHERE A.IsDeleted = 0;
END;
GO

-- 5. USP_AllocateReturnAsset
CREATE OR ALTER PROCEDURE USP_AllocateReturnAsset
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @AssetId INT, @EventId INT, @Quantity INT, @ActionType NVARCHAR(50), @RequestedQty INT, @ApprovedQty INT, @AllocationStatus NVARCHAR(50);

    SELECT 
        @AssetId = AssetId,
        @EventId = EventId,
        @Quantity = Quantity,
        @ActionType = ActionType,
        @RequestedQty = RequestedQty,
        @ApprovedQty = ApprovedQty,
        @AllocationStatus = AllocationStatus
    FROM OPENJSON(@JsonData)
    WITH (
        AssetId INT '$.AssetId',
        EventId INT '$.EventId',
        Quantity INT '$.Quantity',
        ActionType NVARCHAR(50) '$.ActionType',
        RequestedQty INT '$.RequestedQty',
        ApprovedQty INT '$.ApprovedQty',
        AllocationStatus NVARCHAR(50) '$.AllocationStatus'
    );

    IF @ActionType = 'ALLOCATE'
    BEGIN
        DECLARE @Avail INT;
        SELECT @Avail = AvailableQty FROM Tracket_Master_Asset WHERE AssetId = @AssetId;

        IF @Avail < @Quantity
        BEGIN
            SELECT 400 AS ResultStatus, 'Insufficient assets available.' AS ResultMessage;
            RETURN;
        END

        UPDATE Tracket_Master_Asset SET AvailableQty = AvailableQty - @Quantity WHERE AssetId = @AssetId;

        IF EXISTS (SELECT 1 FROM Tracket_Master_Event_Asset WHERE EventId = @EventId AND AssetId = @AssetId)
        BEGIN
            UPDATE Tracket_Master_Event_Asset 
            SET AllocatedQty = AllocatedQty + @Quantity,
                RequestedQty = ISNULL(@RequestedQty, AllocatedQty + @Quantity),
                ApprovedQty = ISNULL(@ApprovedQty, AllocatedQty + @Quantity),
                AllocationStatus = ISNULL(@AllocationStatus, 'APPROVED')
            WHERE EventId = @EventId AND AssetId = @AssetId;
        END
        ELSE
        BEGIN
            INSERT INTO Tracket_Master_Event_Asset (EventId, AssetId, AllocatedQty, RequestedQty, ApprovedQty, AllocationStatus, IsDeleted)
            VALUES (@EventId, @AssetId, @Quantity, ISNULL(@RequestedQty, @Quantity), ISNULL(@ApprovedQty, @Quantity), ISNULL(@AllocationStatus, 'APPROVED'), 0);
        END

        SELECT 200 AS ResultStatus, 'Asset allocated successfully.' AS ResultMessage;
    END
    ELSE IF @ActionType = 'RETURN'
    BEGIN
        DECLARE @Allocated INT;
        SELECT @Allocated = AllocatedQty FROM Tracket_Master_Event_Asset WHERE EventId = @EventId AND AssetId = @AssetId;

        IF @Allocated < @Quantity
        BEGIN
            SELECT 400 AS ResultStatus, 'Cannot return more assets than allocated.' AS ResultMessage;
            RETURN;
        END

        UPDATE Tracket_Master_Asset SET AvailableQty = AvailableQty + @Quantity WHERE AssetId = @AssetId;
        
        UPDATE Tracket_Master_Event_Asset 
        SET AllocatedQty = AllocatedQty - @Quantity,
            ReturnQty = ReturnQty + @Quantity,
            IsReturned = CASE WHEN AllocatedQty - @Quantity = 0 THEN 1 ELSE 0 END,
            ReturnDate = GETDATE()
        WHERE EventId = @EventId AND AssetId = @AssetId;

        SELECT 200 AS ResultStatus, 'Asset returned successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        SELECT 400 AS ResultStatus, 'Invalid action type.' AS ResultMessage;
    END
END;
GO

-- 6. USP_GetAssetInventory
CREATE OR ALTER PROCEDURE USP_GetAssetInventory
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        A.AssetId,
        A.AssetName,
        T.TypeName,
        A.TotalQuantity,
        (A.TotalQuantity - A.AvailableQuantity) AS AllocatedQuantity,
        A.AvailableQuantity
    FROM Tracket_Master_Asset A
    INNER JOIN Tracket_Master_Asset_Type T ON A.AssetTypeId = T.AssetTypeId
    WHERE A.IsDeleted = 0;
END;
GO
