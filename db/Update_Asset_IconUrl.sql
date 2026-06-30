USE EVENT_Master;
GO

-- =============================================================
-- FIXED Migration: IconUrl at AssetType level
-- Actual table names confirmed from DB:
--   Asset table:     Tracket_Master_Asset      (NO IsActive, NO TypeName)
--   AssetType table: Tracket_Master_Asset_Type (has IsActive, has AssetTypeName)
-- =============================================================

-- ----------------------------------------------------------------
-- STEP 1: Add IconUrl to Tracket_Master_Asset_Type
-- ----------------------------------------------------------------
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Tracket_Master_Asset_Type' AND COLUMN_NAME = 'IconUrl'
)
BEGIN
    ALTER TABLE dbo.Tracket_Master_Asset_Type
    ADD IconUrl NVARCHAR(500) NULL;
    PRINT 'IconUrl column added to Tracket_Master_Asset_Type.';
END
ELSE
    PRINT 'IconUrl already exists in Tracket_Master_Asset_Type.';
GO

-- ----------------------------------------------------------------
-- STEP 2: USP_AddEditAssetType — save IconUrl
-- ----------------------------------------------------------------
IF OBJECT_ID('dbo.USP_AddEditAssetType', 'P') IS NOT NULL
    DROP PROCEDURE dbo.USP_AddEditAssetType;
GO

CREATE PROCEDURE dbo.USP_AddEditAssetType
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE
        @AssetTypeId   BIGINT,
        @AssetTypeName NVARCHAR(200),
        @Description   NVARCHAR(500),
        @IconUrl       NVARCHAR(500),
        @CreatedBy     NVARCHAR(100),
        @CreatedFrom   NVARCHAR(100),
        @UpdatedBy     NVARCHAR(100),
        @UpdatedFrom   NVARCHAR(100);

    SELECT
        @AssetTypeId   = CAST(NULLIF(JSON_VALUE(@JsonData, '$.AssetTypeId'), '') AS BIGINT),
        @AssetTypeName = ISNULL(JSON_VALUE(@JsonData, '$.AssetTypeName'), JSON_VALUE(@JsonData, '$.TypeName')),
        @Description   = JSON_VALUE(@JsonData, '$.Description'),
        @IconUrl       = JSON_VALUE(@JsonData, '$.IconUrl'),
        @CreatedBy     = ISNULL(JSON_VALUE(@JsonData, '$.CreatedBy'), 'system'),
        @CreatedFrom   = ISNULL(JSON_VALUE(@JsonData, '$.CreatedFrom'), 'API'),
        @UpdatedBy     = ISNULL(JSON_VALUE(@JsonData, '$.UpdatedBy'), 'system'),
        @UpdatedFrom   = ISNULL(JSON_VALUE(@JsonData, '$.UpdatedFrom'), 'API');

    IF @AssetTypeId IS NULL OR @AssetTypeId = 0
    BEGIN
        INSERT INTO dbo.Tracket_Master_Asset_Type
            (AssetTypeName, Description, IconUrl, IsActive, IsDeleted, CreatedBy, CreatedDate, CreatedFrom)
        VALUES
            (@AssetTypeName, @Description, @IconUrl, 1, 0, @CreatedBy, GETDATE(), @CreatedFrom);

        SET @AssetTypeId = SCOPE_IDENTITY();
        SELECT 201 AS ResultStatus, 'Asset type created successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        UPDATE dbo.Tracket_Master_Asset_Type
        SET
            AssetTypeName = ISNULL(@AssetTypeName, AssetTypeName),
            Description   = ISNULL(@Description, Description),
            IconUrl       = @IconUrl,   -- Allow clearing icon (set to NULL if empty)
            UpdatedBy     = @UpdatedBy,
            UpdatedDate   = GETDATE(),
            UpdatedFrom   = @UpdatedFrom
        WHERE AssetTypeId = @AssetTypeId AND IsDeleted = 0;

        SELECT 200 AS ResultStatus, 'Asset type updated successfully.' AS ResultMessage;
    END

    -- Return updated row (all columns so response DTO is fully populated)
    SELECT
        AssetTypeId,
        AssetTypeName,
        ISNULL(AssetTypeRId, '')  AS AssetTypeRId,
        ISNULL(Description,  '')  AS Description,
        ISNULL(IconUrl,      '')  AS IconUrl,
        ISNULL(CreatedBy,    '')  AS CreatedBy,
        ISNULL(CreatedFrom,  '')  AS CreatedFrom,
        ISNULL(UpdatedBy,    '')  AS UpdatedBy,
        ISNULL(UpdatedFrom,  '')  AS UpdatedFrom
    FROM dbo.Tracket_Master_Asset_Type
    WHERE AssetTypeId = @AssetTypeId;
END;
GO

-- ----------------------------------------------------------------
-- STEP 3: USP_GetAssetTypes — return IconUrl
-- ----------------------------------------------------------------
IF OBJECT_ID('dbo.USP_GetAssetTypes', 'P') IS NOT NULL
    DROP PROCEDURE dbo.USP_GetAssetTypes;
GO

CREATE PROCEDURE dbo.USP_GetAssetTypes
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        AssetTypeId,
        AssetTypeName,
        AssetTypeRId,
        Description,
        ISNULL(IconUrl, '') AS IconUrl
    FROM dbo.Tracket_Master_Asset_Type
    WHERE IsDeleted = 0 AND IsActive = 1
    ORDER BY AssetTypeName;
END;
GO

-- ----------------------------------------------------------------
-- STEP 4: USP_AddEditAsset — no IsActive, no IconUrl
-- ----------------------------------------------------------------
IF OBJECT_ID('dbo.USP_AddEditAsset', 'P') IS NOT NULL
    DROP PROCEDURE dbo.USP_AddEditAsset;
GO

CREATE PROCEDURE dbo.USP_AddEditAsset
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE
        @AssetId      BIGINT,
        @AssetName    NVARCHAR(200),
        @AssetTypeId  BIGINT,
        @AssetCode    NVARCHAR(100),
        @Description  NVARCHAR(500),
        @TotalQty     INT,
        @AvailableQty INT,
        @DamageQty    INT,
        @UnitPrice    DECIMAL(18,2),
        @PurchaseDate DATE,
        @VendorName   NVARCHAR(200),
        @CreatedBy    NVARCHAR(100),
        @CreatedFrom  NVARCHAR(100),
        @UpdatedBy    NVARCHAR(100),
        @UpdatedFrom  NVARCHAR(100);

    SELECT
        @AssetId      = CAST(NULLIF(JSON_VALUE(@JsonData, '$.AssetId'), '') AS BIGINT),
        @AssetName    = JSON_VALUE(@JsonData, '$.AssetName'),
        @AssetTypeId  = CAST(NULLIF(JSON_VALUE(@JsonData, '$.AssetTypeId'), '') AS BIGINT),
        @AssetCode    = JSON_VALUE(@JsonData, '$.AssetCode'),
        @Description  = JSON_VALUE(@JsonData, '$.Description'),
        @TotalQty     = ISNULL(CAST(NULLIF(JSON_VALUE(@JsonData, '$.TotalQty'), '') AS INT), 0),
        @AvailableQty = ISNULL(CAST(NULLIF(JSON_VALUE(@JsonData, '$.AvailableQty'), '') AS INT), 0),
        @DamageQty    = ISNULL(CAST(NULLIF(JSON_VALUE(@JsonData, '$.DamageQty'), '') AS INT), 0),
        @UnitPrice    = TRY_CAST(NULLIF(JSON_VALUE(@JsonData, '$.UnitPrice'), '') AS DECIMAL(18,2)),
        @PurchaseDate = TRY_CAST(NULLIF(JSON_VALUE(@JsonData, '$.PurchaseDate'), '') AS DATE),
        @VendorName   = JSON_VALUE(@JsonData, '$.VendorName'),
        @CreatedBy    = ISNULL(JSON_VALUE(@JsonData, '$.CreatedBy'), 'system'),
        @CreatedFrom  = ISNULL(JSON_VALUE(@JsonData, '$.CreatedFrom'), 'API'),
        @UpdatedBy    = ISNULL(JSON_VALUE(@JsonData, '$.UpdatedBy'), 'system'),
        @UpdatedFrom  = ISNULL(JSON_VALUE(@JsonData, '$.UpdatedFrom'), 'API');

    IF @AssetId IS NULL OR @AssetId = 0
    BEGIN
        -- Tracket_Master_Asset has NO IsActive column
        INSERT INTO dbo.Tracket_Master_Asset
            (AssetTypeId, AssetName, AssetCode, Description, TotalQty, AvailableQty, DamageQty,
             UnitPrice, PurchaseDate, VendorName, IsDeleted, CreatedBy, CreatedDate, CreatedFrom)
        VALUES
            (@AssetTypeId, @AssetName, @AssetCode, @Description, @TotalQty, @AvailableQty, @DamageQty,
             @UnitPrice, @PurchaseDate, @VendorName, 0, @CreatedBy, GETDATE(), @CreatedFrom);

        SET @AssetId = SCOPE_IDENTITY();
        SELECT 201 AS ResultStatus, 'Asset created successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        UPDATE dbo.Tracket_Master_Asset
        SET
            AssetName    = ISNULL(@AssetName, AssetName),
            AssetTypeId  = ISNULL(@AssetTypeId, AssetTypeId),
            AssetCode    = ISNULL(@AssetCode, AssetCode),
            Description  = ISNULL(@Description, Description),
            TotalQty     = ISNULL(@TotalQty, TotalQty),
            AvailableQty = ISNULL(@AvailableQty, AvailableQty),
            DamageQty    = ISNULL(@DamageQty, DamageQty),
            UnitPrice    = ISNULL(@UnitPrice, UnitPrice),
            PurchaseDate = ISNULL(@PurchaseDate, PurchaseDate),
            VendorName   = ISNULL(@VendorName, VendorName),
            UpdatedBy    = @UpdatedBy,
            UpdatedDate  = GETDATE(),
            UpdatedFrom  = @UpdatedFrom
        WHERE AssetId = @AssetId AND IsDeleted = 0;

        SELECT 200 AS ResultStatus, 'Asset updated successfully.' AS ResultMessage;
    END

    -- Return updated row — JOIN AssetType for IconUrl
    SELECT
        a.AssetId,
        a.AssetRId,
        a.AssetName,
        a.AssetTypeId,
        ISNULL(t.AssetTypeName, '') AS AssetTypeName,
        a.AssetCode,
        a.Description,
        a.TotalQty,
        a.AvailableQty,
        ISNULL(a.DamageQty, 0) AS DamageQty,
        a.UnitPrice,
        a.PurchaseDate,
        a.VendorName,
        ISNULL(t.IconUrl, '') AS IconUrl    -- Sourced from Asset_Type
    FROM dbo.Tracket_Master_Asset a
    LEFT JOIN dbo.Tracket_Master_Asset_Type t ON a.AssetTypeId = t.AssetTypeId
    WHERE a.AssetId = @AssetId;
END;
GO

-- ----------------------------------------------------------------
-- STEP 5: USP_GetAssets — JOIN IconUrl from Tracket_Master_Asset_Type
-- ----------------------------------------------------------------
IF OBJECT_ID('dbo.USP_GetAssets', 'P') IS NOT NULL
    DROP PROCEDURE dbo.USP_GetAssets;
GO

CREATE PROCEDURE dbo.USP_GetAssets
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        a.AssetId,
        a.AssetRId,
        a.AssetName,
        a.AssetTypeId,
        ISNULL(t.AssetTypeName, '') AS AssetTypeName,
        a.AssetCode,
        a.Description,
        a.TotalQty,
        a.AvailableQty,
        ISNULL(a.DamageQty, 0) AS DamageQty,
        a.UnitPrice,
        a.PurchaseDate,
        a.VendorName,
        ISNULL(t.IconUrl, '') AS IconUrl    -- Sourced from Asset_Type (shared per type)
    FROM dbo.Tracket_Master_Asset a
    LEFT JOIN dbo.Tracket_Master_Asset_Type t ON a.AssetTypeId = t.AssetTypeId
    WHERE a.IsDeleted = 0
    ORDER BY a.AssetName;
END;
GO

PRINT 'All SPs updated successfully. Correct table names used: Tracket_Master_Asset_Type.';
GO
