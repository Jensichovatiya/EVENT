-- ==========================================
-- MODULE: DROPDOWN DATA SERVICES (DDL)
-- ==========================================

-- 1. USP_User_GetDDL
CREATE OR ALTER PROCEDURE USP_User_GetDDL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        SELECT 200 AS ResultStatus, 'User dropdowns fetched successfully' AS ResultMessage;

        -- Table 1: Roles
        SELECT RoleId, RoleName, RoleCode
        FROM Tracket_Master_Role WITH (NOLOCK)
        WHERE IsActive = 1 AND IsDeleted = 0
        ORDER BY RoleName;
    END TRY
    BEGIN CATCH
        SELECT 500 AS ResultStatus, ERROR_MESSAGE() AS ResultMessage;
    END CATCH
END;
GO

-- 2. USP_Event_GetDDL
CREATE OR ALTER PROCEDURE USP_Event_GetDDL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        SELECT 200 AS ResultStatus, 'Event dropdowns fetched successfully' AS ResultMessage;

        -- Table 1: Categories
        SELECT CategoryId, CategoryName
        FROM Tracket_Master_Event_Category WITH (NOLOCK)
        WHERE IsActive = 1 AND IsDeleted = 0
        ORDER BY CategoryName;

        -- Table 2: Organizers (Role 2)
        SELECT UserId, Name
        FROM Tracket_Master_User WITH (NOLOCK)
        WHERE UserRole = 2 AND IsActive = 1 AND IsDeleted = 0
        ORDER BY Name;
    END TRY
    BEGIN CATCH
        SELECT 500 AS ResultStatus, ERROR_MESSAGE() AS ResultMessage;
    END CATCH
END;
GO

-- 3. USP_Asset_GetDDL
CREATE OR ALTER PROCEDURE USP_Asset_GetDDL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        SELECT 200 AS ResultStatus, 'Asset dropdowns fetched successfully' AS ResultMessage;

        -- Table 1: Asset Types
        SELECT AssetTypeId, AssetTypeName AS TypeName
        FROM Tracket_Master_Asset_Type WITH (NOLOCK)
        WHERE IsDeleted = 0
        ORDER BY AssetTypeName;
    END TRY
    BEGIN CATCH
        SELECT 500 AS ResultStatus, ERROR_MESSAGE() AS ResultMessage;
    END CATCH
END;
GO

-- 4. USP_Booking_GetDDL
CREATE OR ALTER PROCEDURE USP_Booking_GetDDL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        SELECT 200 AS ResultStatus, 'Booking dropdowns fetched successfully' AS ResultMessage;

        -- Table 1: Events
        SELECT EventId, EventName, TicketPrice
        FROM Tracket_Master_Event WITH (NOLOCK)
        WHERE IsDeleted = 0
        ORDER BY EventName;
    END TRY
    BEGIN CATCH
        SELECT 500 AS ResultStatus, ERROR_MESSAGE() AS ResultMessage;
    END CATCH
END;
GO
