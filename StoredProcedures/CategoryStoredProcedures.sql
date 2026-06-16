-- ==========================================
-- MODULE 2: EVENT CATEGORY MODULE STORED PROCEDURES
-- ==========================================

-- 1. USP_AddEditEventCategory
CREATE OR ALTER PROCEDURE USP_AddEditEventCategory
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CategoryId INT, @CategoryName NVARCHAR(100), @Description NVARCHAR(255), @IsActive BIT, @ParentCategoryId BIGINT,
            @CategoryRId NVARCHAR(50), @Slug NVARCHAR(300), @SeoTitle NVARCHAR(300), @SeoDescription NVARCHAR(MAX),
            @CategoryImageUrl NVARCHAR(500), @SortOrder INT, @ShowInMenu BIT, @IsFeatured BIT;

    SELECT 
        @CategoryId = CategoryId,
        @CategoryRId = CategoryRId,
        @CategoryName = CategoryName,
        @Slug = Slug,
        @Description = Description,
        @ParentCategoryId = ParentCategoryId,
        @SeoTitle = SeoTitle,
        @SeoDescription = SeoDescription,
        @CategoryImageUrl = CategoryImageUrl,
        @SortOrder = SortOrder,
        @ShowInMenu = ShowInMenu,
        @IsFeatured = IsFeatured,
        @IsActive = IsActive
    FROM OPENJSON(@JsonData)
    WITH (
        CategoryId INT '$.CategoryId',
        CategoryRId NVARCHAR(50) '$.CategoryRId',
        CategoryName NVARCHAR(100) '$.CategoryName',
        Slug NVARCHAR(300) '$.Slug',
        Description NVARCHAR(255) '$.Description',
        ParentCategoryId BIGINT '$.ParentCategoryId',
        SeoTitle NVARCHAR(300) '$.SeoTitle',
        SeoDescription NVARCHAR(MAX) '$.SeoDescription',
        CategoryImageUrl NVARCHAR(500) '$.CategoryImageUrl',
        SortOrder INT '$.SortOrder',
        ShowInMenu BIT '$.ShowInMenu',
        IsFeatured BIT '$.IsFeatured',
        IsActive BIT '$.IsActive'
    );

    IF @CategoryId = 0
    BEGIN
        IF EXISTS(SELECT 1 FROM Tracket_Master_Event_Category WHERE CategoryName = @CategoryName AND ParentCategoryId = ISNULL(@ParentCategoryId, 0) AND IsDeleted = 0)
        BEGIN
            SELECT 409 AS ResultStatus, 'Category name already exists.' AS ResultMessage;
            RETURN;
        END

        INSERT INTO Tracket_Master_Event_Category (
            CategoryRId, CategoryName, Slug, Description, ParentCategoryId, 
            SeoTitle, SeoDescription, CategoryImageUrl, SortOrder, 
            ShowInMenu, IsFeatured, IsActive, IsDeleted
        )
        VALUES (
            @CategoryRId, @CategoryName, @Slug, @Description, ISNULL(@ParentCategoryId, 0), 
            @SeoTitle, @SeoDescription, @CategoryImageUrl, ISNULL(@SortOrder, 0), 
            ISNULL(@ShowInMenu, 1), ISNULL(@IsFeatured, 0), ISNULL(@IsActive, 1), 0
        );

        SET @CategoryId = SCOPE_IDENTITY();
        SELECT 201 AS ResultStatus, 'Category created successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        IF EXISTS(SELECT 1 FROM Tracket_Master_Event_Category WHERE CategoryName = @CategoryName AND ParentCategoryId = ISNULL(@ParentCategoryId, 0) AND CategoryId <> @CategoryId AND IsDeleted = 0)
        BEGIN
            SELECT 409 AS ResultStatus, 'Category name already exists.' AS ResultMessage;
            RETURN;
        END

        UPDATE Tracket_Master_Event_Category 
        SET 
            CategoryRId = @CategoryRId,
            CategoryName = @CategoryName, 
            Slug = @Slug,
            Description = @Description, 
            ParentCategoryId = ISNULL(@ParentCategoryId, 0), 
            SeoTitle = @SeoTitle,
            SeoDescription = @SeoDescription,
            CategoryImageUrl = @CategoryImageUrl,
            SortOrder = ISNULL(@SortOrder, 0),
            ShowInMenu = ISNULL(@ShowInMenu, 1),
            IsFeatured = ISNULL(@IsFeatured, 0),
            IsActive = ISNULL(@IsActive, 1)
        WHERE CategoryId = @CategoryId;

        SELECT 200 AS ResultStatus, 'Category updated successfully.' AS ResultMessage;
    END

    SELECT 
        C.CategoryId, C.CategoryRId, C.CategoryName, C.Slug, C.Description, C.ParentCategoryId, 
        C.SeoTitle, C.SeoDescription, C.CategoryImageUrl, C.SortOrder, C.ShowInMenu, C.IsFeatured, C.IsActive,
        ISNULL(P.CategoryName, '') AS ParentCategoryName
    FROM Tracket_Master_Event_Category C
    LEFT JOIN Tracket_Master_Event_Category P ON C.ParentCategoryId = P.CategoryId
    WHERE C.CategoryId = @CategoryId;
END;
GO

-- 2. USP_GetEventCategories
CREATE OR ALTER PROCEDURE USP_GetEventCategories
    @CategoryId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        C.CategoryId, C.CategoryRId, C.CategoryName, C.Slug, C.Description, C.ParentCategoryId, 
        C.SeoTitle, C.SeoDescription, C.CategoryImageUrl, C.SortOrder, C.ShowInMenu, C.IsFeatured, C.IsActive,
        ISNULL(P.CategoryName, '') AS ParentCategoryName
    FROM Tracket_Master_Event_Category C
    LEFT JOIN Tracket_Master_Event_Category P ON C.ParentCategoryId = P.CategoryId
    WHERE (@CategoryId IS NULL OR C.CategoryId = @CategoryId)
      AND C.IsDeleted = 0;
END;
GO

-- 3. USP_UpdateEventCategoryStatus
CREATE OR ALTER PROCEDURE USP_UpdateEventCategoryStatus
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CategoryId INT, @IsActive BIT;

    SELECT 
        @CategoryId = CategoryId,
        @IsActive = IsActive
    FROM OPENJSON(@JsonData)
    WITH (
        CategoryId INT '$.CategoryId',
        IsActive BIT '$.IsActive'
    );

    IF EXISTS (SELECT 1 FROM Tracket_Master_Event_Category WHERE CategoryId = @CategoryId AND IsDeleted = 0)
    BEGIN
        UPDATE Tracket_Master_Event_Category SET IsActive = @IsActive WHERE CategoryId = @CategoryId;
        SELECT 200 AS ResultStatus, 'Category status updated successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        SELECT 404 AS ResultStatus, 'Category not found.' AS ResultMessage;
    END
END;
GO

-- 4. USP_DeleteEventCategory
CREATE OR ALTER PROCEDURE USP_DeleteEventCategory
    @CategoryId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Tracket_Master_Event_Category WHERE CategoryId = @CategoryId AND IsDeleted = 0)
    BEGIN
        UPDATE Tracket_Master_Event_Category 
        SET IsDeleted = 1 
        WHERE CategoryId = @CategoryId;

        SELECT 200 AS ResultStatus, 'Category deleted successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        SELECT 404 AS ResultStatus, 'Category not found.' AS ResultMessage;
    END
END;
GO
