USE EVENT_Master;
GO

IF OBJECT_ID('dbo.USP_GetAssetTypeById', 'P') IS NOT NULL
    DROP PROCEDURE dbo.USP_GetAssetTypeById;
GO

CREATE PROCEDURE dbo.USP_GetAssetTypeById
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

    SELECT
        200 AS ResultStatus,
        'Success' AS ResultMessage;

    SELECT
        AssetTypeId,
        AssetTypeRId,
        AssetTypeName,
        AssetTypeName AS TypeName,
        ISNULL(Description, '') AS Description,
        ISNULL(IconUrl, '') AS IconUrl,
        ISNULL(CreatedBy, '') AS CreatedBy,
        ISNULL(CreatedFrom, '') AS CreatedFrom,
        ISNULL(UpdatedBy, '') AS UpdatedBy,
        ISNULL(UpdatedFrom, '') AS UpdatedFrom
    FROM dbo.Tracket_Master_Asset_Type
    WHERE AssetTypeId = @AssetTypeId
    AND IsDeleted = 0;
END;
GO
