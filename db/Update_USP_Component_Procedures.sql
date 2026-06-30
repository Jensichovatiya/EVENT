USE EVENT_Master;
GO

-- =========================================================================
-- 1. Alter USP_GetComponentById to resolve lookup strings and output aliased columns
-- =========================================================================
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
        C.ComponentId,
        C.ComponentRId,
        C.ComponentName,
        C.ComponentCode,
        C.CategoryId,
        Cat.CategoryName AS Category,
        C.Description,
        C.IconUrl,

        C.IsBookable AS AllowBooking,
        C.BookableAsId,
        V_Bookable.Description AS BookableAs,

        C.AccessibilityId,
        V_Access.Description AS Accessibility,
        
        C.AccessTypeId,
        V_AccessType.Description AS AccessType,

        C.ShapeTypeId,
        V_Shape.Description AS Shape,

        C.Width AS DefaultWidth,
        C.Height AS DefaultHeight,
        C.RotationAngle AS Rotation,

        C.BackgroundColor AS DefaultColor,
        C.BorderColor,
        C.BorderWidth,
        C.Opacity,

        C.CurrencyId,
        Curr.Code AS Currency,
        C.DefaultBookingPrice AS DefaultPrice,

        C.SnapToGrid,
        C.IsStackable,
        C.IsMovable,
        C.IsResizable,

        C.DefaultLabel,
        C.LabelPositionId,
        V_LabelPos.Description AS LabelPosition,
        C.ShowLabel,

        C.ZIndex,
        C.Notes,

        C.IsActive,
        C.IsDeleted,

        C.CreatedBy,
        C.CreatedDate,
        C.CreatedFrom,

        C.UpdatedBy,
        C.UpdatedDate,
        C.UpdatedFrom
    FROM dbo.Tracket_Master_Component C
    LEFT JOIN dbo.Tracket_Master_Component_Category Cat ON C.CategoryId = Cat.CategoryId
    LEFT JOIN dbo.Tracket_Master_GeneralMasterValue V_Shape ON C.ShapeTypeId = V_Shape.ValueId
    LEFT JOIN dbo.Tracket_Master_GeneralMasterValue V_Bookable ON C.BookableAsId = V_Bookable.ValueId
    LEFT JOIN dbo.Tracket_Master_GeneralMasterValue V_Access ON C.AccessibilityId = V_Access.ValueId
    LEFT JOIN dbo.Tracket_Master_GeneralMasterValue V_AccessType ON C.AccessTypeId = V_AccessType.ValueId
    LEFT JOIN dbo.Tracket_Master_GeneralMasterValue V_LabelPos ON C.LabelPositionId = V_LabelPos.ValueId
    LEFT JOIN dbo.Tracket_Master_Settings_Currencies Curr ON C.CurrencyId = Curr.CurrencyId
    WHERE C.ComponentId = @ComponentId
      AND C.IsDeleted = 0;
END;
GO

-- =========================================================================
-- 2. Alter USP_AddEditComponent to output aliased columns matching DTO properties
-- =========================================================================
CREATE OR ALTER PROCEDURE dbo.USP_AddEditComponent
(
    @JsonData NVARCHAR(MAX)
)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ComponentId BIGINT = 0;
    DECLARE @ComponentRId NVARCHAR(50) = '';
    DECLARE @ComponentName NVARCHAR(200) = '';
    DECLARE @ComponentCode NVARCHAR(100) = '';
    DECLARE @CategoryId INT = NULL;
    DECLARE @CategoryName NVARCHAR(200) = '';
    DECLARE @Description NVARCHAR(MAX) = '';
    DECLARE @IconUrl NVARCHAR(MAX) = '';

    -- Shape & Size
    DECLARE @ShapeName NVARCHAR(100) = '';
    DECLARE @ShapeTypeId BIGINT = NULL;
    DECLARE @Width DECIMAL(18,2) = 3.00;
    DECLARE @Height DECIMAL(18,2) = 3.00;
    DECLARE @RotationAngle INT = 0;

    -- Appearance
    DECLARE @BackgroundColor NVARCHAR(50) = '#A47BFA';
    DECLARE @BorderColor NVARCHAR(50) = '#6D2DD9';
    DECLARE @BorderWidth INT = 1;
    DECLARE @Opacity INT = 100;

    -- Booking & Access
    DECLARE @IsBookable BIT = 1;
    DECLARE @BookableAsName NVARCHAR(100) = '';
    DECLARE @BookableAsId BIGINT = NULL;
    DECLARE @AccessibilityName NVARCHAR(100) = '';
    DECLARE @AccessibilityId BIGINT = NULL;
    DECLARE @AccessTypeName NVARCHAR(100) = '';
    DECLARE @AccessTypeId BIGINT = NULL;

    -- Placement & Behaviour
    DECLARE @SnapToGrid BIT = 1;
    DECLARE @IsStackable BIT = 0;
    DECLARE @IsMovable BIT = 1;
    DECLARE @IsResizable BIT = 1;

    -- Additional
    DECLARE @DefaultLabel NVARCHAR(200) = '';
    DECLARE @LabelPositionName NVARCHAR(100) = '';
    DECLARE @LabelPositionId BIGINT = NULL;
    DECLARE @ShowLabel BIT = 1;
    DECLARE @ZIndex INT = 1;
    DECLARE @DefaultBookingPrice DECIMAL(18,2) = 0.00;
    DECLARE @CurrencyCode NVARCHAR(50) = 'INR';
    DECLARE @CurrencyId BIGINT = NULL;
    DECLARE @Notes NVARCHAR(MAX) = '';

    DECLARE @CreatedBy NVARCHAR(200) = '';
    DECLARE @CreatedFrom NVARCHAR(200) = '';
    DECLARE @UpdatedBy NVARCHAR(200) = '';
    DECLARE @UpdatedFrom NVARCHAR(200) = '';

    -- Parse JSON fields
    SELECT
        @ComponentId = ComponentId,
        @ComponentRId = ComponentRId,
        @ComponentName = ComponentName,
        @ComponentCode = ComponentCode,
        @CategoryId = CategoryId,
        @CategoryName = Category,
        @Description = Description,
        @IconUrl = IconUrl,

        @ShapeName = Shape,
        @ShapeTypeId = ShapeTypeId,
        @Width = DefaultWidth,
        @Height = DefaultHeight,
        @RotationAngle = Rotation,

        @BackgroundColor = DefaultColor,
        @BorderColor = BorderColor,
        @BorderWidth = BorderWidth,
        @Opacity = Opacity,

        @IsBookable = AllowBooking,
        @BookableAsName = BookableAs,
        @BookableAsId = BookableAsId,
        @AccessibilityName = Accessibility,
        @AccessibilityId = AccessibilityId,
        @AccessTypeName = AccessType,
        @AccessTypeId = AccessTypeId,

        @SnapToGrid = SnapToGrid,
        @IsStackable = Stackable,
        @IsMovable = Movable,
        @IsResizable = Resizable,

        @DefaultLabel = DefaultLabel,
        @LabelPositionName = LabelPosition,
        @LabelPositionId = LabelPositionId,
        @ShowLabel = ShowLabel,
        @ZIndex = ZIndex,
        @DefaultBookingPrice = DefaultPrice,
        @CurrencyCode = Currency,
        @CurrencyId = CurrencyId,
        @Notes = Notes,

        @CreatedBy = CreatedBy,
        @CreatedFrom = CreatedFrom,
        @UpdatedBy = UpdatedBy,
        @UpdatedFrom = UpdatedFrom
    FROM OPENJSON(@JsonData)
    WITH
    (
        ComponentId BIGINT '$.ComponentId',
        ComponentRId NVARCHAR(50) '$.ComponentRId',
        ComponentName NVARCHAR(200) '$.ComponentName',
        ComponentCode NVARCHAR(100) '$.ComponentCode',
        CategoryId INT '$.CategoryId',
        Category NVARCHAR(200) '$.Category',
        Description NVARCHAR(MAX) '$.Description',
        IconUrl NVARCHAR(MAX) '$.IconUrl',

        Shape NVARCHAR(100) '$.Shape',
        ShapeTypeId BIGINT '$.ShapeTypeId',
        DefaultWidth DECIMAL(18,2) '$.DefaultWidth',
        DefaultHeight DECIMAL(18,2) '$.DefaultHeight',
        Rotation INT '$.Rotation',

        DefaultColor NVARCHAR(50) '$.DefaultColor',
        BorderColor NVARCHAR(50) '$.BorderColor',
        BorderWidth INT '$.BorderWidth',
        Opacity INT '$.Opacity',

        AllowBooking BIT '$.AllowBooking',
        BookableAs NVARCHAR(100) '$.BookableAs',
        BookableAsId BIGINT '$.BookableAsId',
        Accessibility NVARCHAR(100) '$.Accessibility',
        AccessibilityId BIGINT '$.AccessibilityId',
        AccessType NVARCHAR(100) '$.AccessType',
        AccessTypeId BIGINT '$.AccessTypeId',

        SnapToGrid BIT '$.SnapToGrid',
        Stackable BIT '$.Stackable',
        Movable BIT '$.Movable',
        Resizable BIT '$.Resizable',

        DefaultLabel NVARCHAR(200) '$.DefaultLabel',
        LabelPosition NVARCHAR(100) '$.LabelPosition',
        LabelPositionId BIGINT '$.LabelPositionId',
        ShowLabel BIT '$.ShowLabel',
        ZIndex INT '$.ZIndex',
        DefaultPrice DECIMAL(18,2) '$.DefaultPrice',
        Currency NVARCHAR(50) '$.Currency',
        CurrencyId BIGINT '$.CurrencyId',
        Notes NVARCHAR(MAX) '$.Notes',

        CreatedBy NVARCHAR(200) '$.CreatedBy',
        CreatedFrom NVARCHAR(200) '$.CreatedFrom',
        UpdatedBy NVARCHAR(200) '$.UpdatedBy',
        UpdatedFrom NVARCHAR(200) '$.UpdatedFrom'
    );

    -- Category ID fallback from name
    IF (@CategoryId IS NULL OR @CategoryId = 0) AND (ISNULL(@CategoryName, '') <> '')
    BEGIN
        SELECT TOP 1 @CategoryId = CategoryId
        FROM dbo.Tracket_Master_Component_Category
        WHERE CategoryName = @CategoryName AND IsDeleted = 0;
    END

    -- General Master fallbacks
    IF (@ShapeTypeId IS NULL) AND (ISNULL(@ShapeName, '') <> '')
    BEGIN
        SELECT TOP 1 @ShapeTypeId = V.ValueId 
        FROM dbo.Tracket_Master_GeneralMasterValue V
        INNER JOIN dbo.Tracket_Master_GeneralMasterCategory Cat ON V.CategoryId = Cat.CategoryId
        WHERE Cat.DDL_ID = 'SHAPETYPE' AND V.Description = @ShapeName;
    END

    IF (@BookableAsId IS NULL) AND (ISNULL(@BookableAsName, '') <> '')
    BEGIN
        SELECT TOP 1 @BookableAsId = V.ValueId 
        FROM dbo.Tracket_Master_GeneralMasterValue V
        INNER JOIN dbo.Tracket_Master_GeneralMasterCategory Cat ON V.CategoryId = Cat.CategoryId
        WHERE Cat.DDL_ID = 'BOOKABLEAS' AND V.Description = @BookableAsName;
    END

    IF (@AccessibilityId IS NULL) AND (ISNULL(@AccessibilityName, '') <> '')
    BEGIN
        SELECT TOP 1 @AccessibilityId = V.ValueId 
        FROM dbo.Tracket_Master_GeneralMasterValue V
        INNER JOIN dbo.Tracket_Master_GeneralMasterCategory Cat ON V.CategoryId = Cat.CategoryId
        WHERE Cat.DDL_ID = 'ACCESSIBILITY' AND V.Description = @AccessibilityName;
    END

    IF (@AccessTypeId IS NULL) AND (ISNULL(@AccessTypeName, '') <> '')
    BEGIN
        SELECT TOP 1 @AccessTypeId = V.ValueId 
        FROM dbo.Tracket_Master_GeneralMasterValue V
        INNER JOIN dbo.Tracket_Master_GeneralMasterCategory Cat ON V.CategoryId = Cat.CategoryId
        WHERE Cat.DDL_ID = 'ListingType' AND V.Description = @AccessTypeName;
    END

    IF (@LabelPositionId IS NULL) AND (ISNULL(@LabelPositionName, '') <> '')
    BEGIN
        SELECT TOP 1 @LabelPositionId = V.ValueId 
        FROM dbo.Tracket_Master_GeneralMasterValue V
        INNER JOIN dbo.Tracket_Master_GeneralMasterCategory Cat ON V.CategoryId = Cat.CategoryId
        WHERE Cat.DDL_ID = 'LABELPOSITION' AND V.Description = @LabelPositionName;
    END

    -- Currency fallback
    IF (@CurrencyId IS NULL) AND (ISNULL(@CurrencyCode, '') <> '')
    BEGIN
        SELECT TOP 1 @CurrencyId = CurrencyId FROM dbo.Tracket_Master_Settings_Currencies
        WHERE Code = @CurrencyCode AND IsDeleted = 0;
    END

    -- Insert or Update logic
    IF ISNULL(@ComponentId, 0) = 0
    BEGIN
        INSERT INTO dbo.Tracket_Master_Component
        (
            ComponentRId, ComponentName, ComponentCode, CategoryId, Description, IconUrl,
            IsBookable, BookableAsId, AccessibilityId, AccessTypeId, ShapeTypeId,
            Width, Height, RotationAngle, BackgroundColor, BorderColor, BorderWidth, Opacity,
            CurrencyId, DefaultBookingPrice, SnapToGrid, IsStackable, IsMovable, IsResizable,
            DefaultLabel, LabelPositionId, ShowLabel, ZIndex, Notes, IsActive, IsDeleted,
            CreatedBy, CreatedDate, CreatedFrom
        )
        VALUES
        (
            NEWID(), @ComponentName, @ComponentCode, @CategoryId, @Description, @IconUrl,
            @IsBookable, @BookableAsId, @AccessibilityId, @AccessTypeId, @ShapeTypeId,
            @Width, @Height, @RotationAngle, @BackgroundColor, @BorderColor, @BorderWidth, @Opacity,
            @CurrencyId, @DefaultBookingPrice, @SnapToGrid, @IsStackable, @IsMovable, @IsResizable,
            @DefaultLabel, @LabelPositionId, @ShowLabel, @ZIndex, @Notes, 1, 0,
            @CreatedBy, GETDATE(), @CreatedFrom
        );

        SET @ComponentId = SCOPE_IDENTITY();

        SELECT 201 AS ResultStatus,
               'Component created successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        UPDATE dbo.Tracket_Master_Component
        SET
            ComponentName=@ComponentName,
            ComponentCode=@ComponentCode,
            CategoryId=@CategoryId,
            Description=@Description,
            IconUrl=CASE WHEN ISNULL(@IconUrl, '') = '' THEN IconUrl ELSE @IconUrl END,
            IsBookable=@IsBookable,
            BookableAsId=@BookableAsId,
            AccessibilityId=@AccessibilityId,
            AccessTypeId=@AccessTypeId,
            ShapeTypeId=@ShapeTypeId,
            Width=@Width,
            Height=@Height,
            RotationAngle=@RotationAngle,
            BackgroundColor=@BackgroundColor,
            BorderColor=@BorderColor,
            BorderWidth=@BorderWidth,
            Opacity=@Opacity,
            CurrencyId=@CurrencyId,
            DefaultBookingPrice=@DefaultBookingPrice,
            SnapToGrid=@SnapToGrid,
            IsStackable=@IsStackable,
            IsMovable=@IsMovable,
            IsResizable=@IsResizable,
            DefaultLabel=@DefaultLabel,
            LabelPositionId=@LabelPositionId,
            ShowLabel=@ShowLabel,
            ZIndex=@ZIndex,
            Notes=@Notes,
            UpdatedBy=@UpdatedBy,
            UpdatedDate=GETDATE(),
            UpdatedFrom=@UpdatedFrom
        WHERE ComponentId=@ComponentId;

        SELECT 200 AS ResultStatus,
               'Component updated successfully.' AS ResultMessage;
    END

    -- Return full data mapped with strings
    SELECT
        C.ComponentId,
        C.ComponentRId,
        C.ComponentName,
        C.ComponentCode,
        C.CategoryId,
        Cat.CategoryName AS Category,
        C.Description,
        C.IconUrl,

        C.IsBookable AS AllowBooking,
        C.BookableAsId,
        V_Bookable.Description AS BookableAs,

        C.AccessibilityId,
        V_Access.Description AS Accessibility,
        
        C.AccessTypeId,
        V_AccessType.Description AS AccessType,

        C.ShapeTypeId,
        V_Shape.Description AS Shape,

        C.Width AS DefaultWidth,
        C.Height AS DefaultHeight,
        C.RotationAngle AS Rotation,

        C.BackgroundColor AS DefaultColor,
        C.BorderColor,
        C.BorderWidth,
        C.Opacity,

        C.CurrencyId,
        Curr.Code AS Currency,
        C.DefaultBookingPrice AS DefaultPrice,

        C.SnapToGrid,
        C.IsStackable,
        C.IsMovable,
        C.IsResizable,

        C.DefaultLabel,
        C.LabelPositionId,
        V_LabelPos.Description AS LabelPosition,
        C.ShowLabel,

        C.ZIndex,
        C.Notes,

        C.IsActive,
        C.IsDeleted,

        C.CreatedBy,
        C.CreatedDate,
        C.CreatedFrom,

        C.UpdatedBy,
        C.UpdatedDate,
        C.UpdatedFrom
    FROM dbo.Tracket_Master_Component C
    LEFT JOIN dbo.Tracket_Master_Component_Category Cat ON C.CategoryId = Cat.CategoryId
    LEFT JOIN dbo.Tracket_Master_GeneralMasterValue V_Shape ON C.ShapeTypeId = V_Shape.ValueId
    LEFT JOIN dbo.Tracket_Master_GeneralMasterValue V_Bookable ON C.BookableAsId = V_Bookable.ValueId
    LEFT JOIN dbo.Tracket_Master_GeneralMasterValue V_Access ON C.AccessibilityId = V_Access.ValueId
    LEFT JOIN dbo.Tracket_Master_GeneralMasterValue V_AccessType ON C.AccessTypeId = V_AccessType.ValueId
    LEFT JOIN dbo.Tracket_Master_GeneralMasterValue V_LabelPos ON C.LabelPositionId = V_LabelPos.ValueId
    LEFT JOIN dbo.Tracket_Master_Settings_Currencies Curr ON C.CurrencyId = Curr.CurrencyId
    WHERE C.ComponentId = @ComponentId;
END;
GO

-- =========================================================================
-- 3. Alter USP_GetAllComponent to resolve lookup strings and output aliased columns
-- =========================================================================
CREATE OR ALTER PROCEDURE [dbo].[USP_GetAllComponent]
(
    @SearchText NVARCHAR(200)=NULL,
    @PageNumber INT=1,
    @PageSize INT=20
)
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH ComponentData AS
    (
        SELECT
            C.ComponentId,
            C.ComponentRId,
            C.ComponentName,
            C.ComponentCode,
            C.CategoryId,
            Cat.CategoryName AS Category,
            C.Description,
            C.IconUrl,

            C.IsBookable AS AllowBooking,
            C.BookableAsId,
            V_Bookable.Description AS BookableAs,

            C.AccessibilityId,
            V_Access.Description AS Accessibility,
            
            C.AccessTypeId,
            V_AccessType.Description AS AccessType,

            C.ShapeTypeId,
            V_Shape.Description AS Shape,

            C.Width AS DefaultWidth,
            C.Height AS DefaultHeight,
            C.RotationAngle AS Rotation,

            C.BackgroundColor AS DefaultColor,
            C.BorderColor,
            C.BorderWidth,
            C.Opacity,

            C.CurrencyId,
            Curr.Code AS Currency,
            C.DefaultBookingPrice AS DefaultPrice,

            C.SnapToGrid,
            C.IsStackable,
            C.IsMovable,
            C.IsResizable,

            C.DefaultLabel,
            C.LabelPositionId,
            V_LabelPos.Description AS LabelPosition,
            C.ShowLabel,

            C.ZIndex,
            C.Notes,

            C.IsActive,
            C.IsDeleted,

            C.CreatedBy,
            C.CreatedDate,
            C.CreatedFrom,

            C.UpdatedBy,
            C.UpdatedDate,
            C.UpdatedFrom,
            COUNT(*) OVER() AS TotalCount
        FROM dbo.Tracket_Master_Component C
        LEFT JOIN dbo.Tracket_Master_Component_Category Cat ON C.CategoryId = Cat.CategoryId
        LEFT JOIN dbo.Tracket_Master_GeneralMasterValue V_Shape ON C.ShapeTypeId = V_Shape.ValueId
        LEFT JOIN dbo.Tracket_Master_GeneralMasterValue V_Bookable ON C.BookableAsId = V_Bookable.ValueId
        LEFT JOIN dbo.Tracket_Master_GeneralMasterValue V_Access ON C.AccessibilityId = V_Access.ValueId
        LEFT JOIN dbo.Tracket_Master_GeneralMasterValue V_AccessType ON C.AccessTypeId = V_AccessType.ValueId
        LEFT JOIN dbo.Tracket_Master_GeneralMasterValue V_LabelPos ON C.LabelPositionId = V_LabelPos.ValueId
        LEFT JOIN dbo.Tracket_Master_Settings_Currencies Curr ON C.CurrencyId = Curr.CurrencyId
        WHERE C.IsDeleted = 0
        AND
        (
            @SearchText IS NULL
            OR C.ComponentName LIKE '%' + @SearchText + '%'
            OR C.ComponentCode LIKE '%' + @SearchText + '%'
        )
    )
    SELECT *
    FROM ComponentData
    ORDER BY ComponentId DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;
GO
