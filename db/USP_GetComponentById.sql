USE EVENT_Master;
GO

CREATE OR ALTER PROCEDURE dbo.USP_GetComponentById
(
    @ComponentId BIGINT
)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.Tracket_Master_Component
        WHERE ComponentId = @ComponentId
        AND IsDeleted = 0
    )
    BEGIN
        SELECT
            404 AS ResultStatus,
            'Component not found.' AS ResultMessage;
        RETURN;
    END;

    SELECT
        200 AS ResultStatus,
        'Success' AS ResultMessage;

    SELECT
        ComponentId,
        ComponentRId,
        ComponentName,
        ComponentCode,
        CategoryId,
        Description,
        IconUrl,

        IsBookable,
        BookableAsId,

        AccessibilityId,
        AccessTypeId,

        ShapeTypeId,

        Width,
        Height,
        RotationAngle,

        BackgroundColor,
        BorderColor,
        BorderWidth,
        Opacity,

        CurrencyId,
        DefaultBookingPrice,

        SnapToGrid,
        IsStackable,
        IsMovable,
        IsResizable,

        DefaultLabel,
        LabelPositionId,
        ShowLabel,

        ZIndex,
        Notes,

        IsActive,
        IsDeleted,

        CreatedBy,
        CreatedDate,
        CreatedFrom,

        UpdatedBy,
        UpdatedDate,
        UpdatedFrom
    FROM dbo.Tracket_Master_Component
    WHERE ComponentId = @ComponentId
      AND IsDeleted = 0;
END
GO
