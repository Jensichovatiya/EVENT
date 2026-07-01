USE EVENT_Master;
GO

IF OBJECT_ID('dbo.USP_DeleteAssetType', 'P') IS NOT NULL
    DROP PROCEDURE dbo.USP_DeleteAssetType;
GO

CREATE PROCEDURE dbo.USP_DeleteAssetType
(
    @AssetTypeId BIGINT
)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.Tracket_Master_Asset_Type
        WHERE AssetTypeId = @AssetTypeId
        AND IsDeleted = 0
    )
    BEGIN
        SELECT
            404 AS ResultStatus,
            'Asset Type not found.' AS ResultMessage;
        RETURN;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.Tracket_Master_Asset
        WHERE AssetTypeId = @AssetTypeId
        AND IsDeleted = 0
    )
    BEGIN
        SELECT
            409 AS ResultStatus,
            'Asset Type is currently mapped to one or more assets and cannot be deleted.' AS ResultMessage;
        RETURN;
    END;

    UPDATE dbo.Tracket_Master_Asset_Type
    SET
        IsDeleted = 1,
        IsActive = 0,
        UpdatedDate = GETDATE()
    WHERE AssetTypeId = @AssetTypeId;

    SELECT
        200 AS ResultStatus,
        'Asset Type deleted successfully.' AS ResultMessage;
END;
GO
