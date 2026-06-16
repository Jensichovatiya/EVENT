-- ==========================================
-- MODULE 1: AUTH MODULE STORED PROCEDURES
-- ==========================================

-- 1. USP_AddEditUser
CREATE OR ALTER PROCEDURE USP_AddEditUser
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @UserId INT, @Name NVARCHAR(100), @MobileNo NVARCHAR(20), @DialCode NVARCHAR(10),
            @EmailId NVARCHAR(100), @Password NVARCHAR(255), @UserRole INT, @RefferalCode NVARCHAR(50);
            
    SELECT 
        @Name = Name,
        @MobileNo = MobileNo,
        @DialCode = DialCode,
        @EmailId = EmailId,
        @Password = Password,
        @UserRole = UserRole,
        @RefferalCode = RefferalCode
    FROM OPENJSON(@JsonData)
    WITH (
        Name NVARCHAR(100) '$.Name',
        MobileNo NVARCHAR(20) '$.MobileNo',
        DialCode NVARCHAR(10) '$.DialCode',
        EmailId NVARCHAR(100) '$.EmailId',
        Password NVARCHAR(255) '$.Password',
        UserRole INT '$.UserRole',
        RefferalCode NVARCHAR(50) '$.RefferalCode'
    );

    IF EXISTS(SELECT 1 FROM Tracket_Master_User WHERE MobileNo = @MobileNo AND IsDeleted = 0)
    BEGIN
        SELECT 409 AS ResultStatus, 'Mobile number already exists.' AS ResultMessage;
        RETURN;
    END

    INSERT INTO Tracket_Master_User (Name, MobileNo, DialCode, EmailId, PasswordHash, UserRole, RefferalCode, IsActive, IsDeleted, CreatedDate)
    VALUES (@Name, @MobileNo, @DialCode, @EmailId, @Password, @UserRole, @RefferalCode, 1, 0, GETDATE());

    SET @UserId = SCOPE_IDENTITY();

    INSERT INTO Tracket_Master_User_Login (UserId, UserName, PasswordHash, IsVerified, IsApproved, IsDeleted, CreatedDate)
    VALUES (@UserId, @MobileNo, @Password, 1, 1, 0, GETDATE());

    INSERT INTO Tracket_Master_User_Profile (UserId, MobileNumber, IsActive, IsDeleted, CreatedDate)
    VALUES (@UserId, @MobileNo, 1, 0, GETDATE());

    SELECT 201 AS ResultStatus, 'User registered successfully.' AS ResultMessage;

    SELECT 
        U.UserId,
        U.Name,
        U.MobileNo,
        U.EmailId,
        U.UserRole,
        R.RoleName
    FROM Tracket_Master_User U
    LEFT JOIN Tracket_Master_Role R ON U.UserRole = R.RoleId
    WHERE U.UserId = @UserId;
END;
GO

-- 2. USP_Login
CREATE OR ALTER PROCEDURE USP_Login
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UserName NVARCHAR(100), @Password NVARCHAR(255);

    SELECT 
        @UserName = UserName,
        @Password = Password
    FROM OPENJSON(@JsonData)
    WITH (
        UserName NVARCHAR(100) '$.UserName',
        Password NVARCHAR(255) '$.Password'
    );

    DECLARE @UserId INT;

    SELECT @UserId = UserId 
    FROM Tracket_Master_User 
    WHERE (MobileNo = @UserName OR EmailId = @UserName) 
      AND PasswordHash = @Password 
      AND IsActive = 1 
      AND IsDeleted = 0;

    IF @UserId IS NULL
    BEGIN
        SELECT 401 AS ResultStatus, 'Invalid username or password.' AS ResultMessage;
        RETURN;
    END

    -- Return Status Table
    SELECT 200 AS ResultStatus, 'Login successful.' AS ResultMessage;

    -- Return Data Table
    SELECT 
        U.UserId,
        U.Name,
        U.MobileNo,
        U.EmailId,
        U.UserRole,
        R.RoleName,
        'SAMPLE_JWT_TOKEN' AS Token
    FROM Tracket_Master_User U
    LEFT JOIN Tracket_Master_Role R ON U.UserRole = R.RoleId
    WHERE U.UserId = @UserId;
END;
GO

-- 3. USP_GenerateVerifyOTP
CREATE OR ALTER PROCEDURE USP_GenerateVerifyOTP
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MobileNo NVARCHAR(20), @OTP NVARCHAR(10), @Purpose NVARCHAR(50);

    SELECT 
        @MobileNo = MobileNo,
        @OTP = OTP,
        @Purpose = Purpose
    FROM OPENJSON(@JsonData)
    WITH (
        MobileNo NVARCHAR(20) '$.MobileNo',
        OTP NVARCHAR(10) '$.OTP',
        Purpose NVARCHAR(50) '$.Purpose'
    );

    -- Simulating OTP verification: if OTP is '123456' it is valid
    IF @OTP = '123456'
    BEGIN
        SELECT 200 AS ResultStatus, 'OTP verified successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        SELECT 400 AS ResultStatus, 'Invalid OTP.' AS ResultMessage;
    END
END;
GO

-- 4. USP_ChangeResetPassword
CREATE OR ALTER PROCEDURE USP_ChangeResetPassword
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MobileNo NVARCHAR(20), @OldPassword NVARCHAR(255), @NewPassword NVARCHAR(255), @IsReset BIT;

    SELECT 
        @MobileNo = MobileNo,
        @OldPassword = OldPassword,
        @NewPassword = NewPassword,
        @IsReset = IsReset
    FROM OPENJSON(@JsonData)
    WITH (
        MobileNo NVARCHAR(20) '$.MobileNo',
        OldPassword NVARCHAR(255) '$.OldPassword',
        NewPassword NVARCHAR(255) '$.NewPassword',
        IsReset BIT '$.IsReset'
    );

    IF @IsReset = 1
    BEGIN
        UPDATE Tracket_Master_User 
        SET PasswordHash = @NewPassword 
        WHERE MobileNo = @MobileNo AND IsDeleted = 0;

        SELECT 200 AS ResultStatus, 'Password reset successful.' AS ResultMessage;
    END
    ELSE
    BEGIN
        IF EXISTS (SELECT 1 FROM Tracket_Master_User WHERE MobileNo = @MobileNo AND PasswordHash = @OldPassword AND IsDeleted = 0)
        BEGIN
            UPDATE Tracket_Master_User 
            SET PasswordHash = @NewPassword 
            WHERE MobileNo = @MobileNo AND IsDeleted = 0;

            SELECT 200 AS ResultStatus, 'Password changed successfully.' AS ResultMessage;
        END
        ELSE
        BEGIN
            SELECT 400 AS ResultStatus, 'Incorrect old password.' AS ResultMessage;
        END
    END
END;
GO

-- 5. USP_GetUsers
CREATE OR ALTER PROCEDURE USP_GetUsers
    @UserId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        U.UserId,
        U.Name,
        U.MobileNo,
        U.EmailId,
        U.UserRole,
        R.RoleName,
        U.IsActive
    FROM Tracket_Master_User U
    LEFT JOIN Tracket_Master_Role R ON U.UserRole = R.RoleId
    WHERE (@UserId IS NULL OR U.UserId = @UserId)
      AND U.IsDeleted = 0;
END;
GO

-- 6. USP_UpdateUserStatus
CREATE OR ALTER PROCEDURE USP_UpdateUserStatus
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UserId INT, @IsActive BIT;

    SELECT 
        @UserId = UserId,
        @IsActive = IsActive
    FROM OPENJSON(@JsonData)
    WITH (
        UserId INT '$.UserId',
        IsActive BIT '$.IsActive'
    );

    IF EXISTS (SELECT 1 FROM Tracket_Master_User WHERE UserId = @UserId AND IsDeleted = 0)
    BEGIN
        UPDATE Tracket_Master_User 
        SET IsActive = @IsActive 
        WHERE UserId = @UserId;

        SELECT 200 AS ResultStatus, 'User status updated successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        SELECT 404 AS ResultStatus, 'User not found.' AS ResultMessage;
    END
END;
GO

-- 7. USP_AddEditRole
CREATE OR ALTER PROCEDURE USP_AddEditRole
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @RoleId INT, @RoleName NVARCHAR(100), @RoleDescription NVARCHAR(255), @IsActive BIT;

    SELECT 
        @RoleId = RoleId,
        @RoleName = RoleName,
        @RoleDescription = RoleDescription,
        @IsActive = IsActive
    FROM OPENJSON(@JsonData)
    WITH (
        RoleId INT '$.RoleId',
        RoleName NVARCHAR(100) '$.RoleName',
        RoleDescription NVARCHAR(255) '$.RoleDescription',
        IsActive BIT '$.IsActive'
    );

    IF @RoleId = 0
    BEGIN
        INSERT INTO Tracket_Master_Role (RoleName, RoleDescription, IsActive, IsDeleted)
        VALUES (@RoleName, @RoleDescription, 1, 0);

        SET @RoleId = SCOPE_IDENTITY();
        SELECT 201 AS ResultStatus, 'Role created successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        UPDATE Tracket_Master_Role 
        SET RoleName = @RoleName, RoleDescription = @RoleDescription, IsActive = @IsActive 
        WHERE RoleId = @RoleId;

        SELECT 200 AS ResultStatus, 'Role updated successfully.' AS ResultMessage;
    END

    SELECT RoleId, RoleName, RoleDescription, IsActive 
    FROM Tracket_Master_Role 
    WHERE RoleId = @RoleId;
END;
GO

-- 8. USP_GetRoles
CREATE OR ALTER PROCEDURE USP_GetRoles
AS
BEGIN
    SET NOCOUNT ON;

    SELECT RoleId, RoleName, RoleDescription, IsActive 
    FROM Tracket_Master_Role 
    WHERE IsDeleted = 0;
END;
GO

-- 9. USP_DeleteRole
CREATE OR ALTER PROCEDURE USP_DeleteRole
    @RoleId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Tracket_Master_Role WHERE RoleId = @RoleId AND IsDeleted = 0)
    BEGIN
        UPDATE Tracket_Master_Role 
        SET IsDeleted = 1 
        WHERE RoleId = @RoleId;

        SELECT 200 AS ResultStatus, 'Role deleted successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        SELECT 404 AS ResultStatus, 'Role not found.' AS ResultMessage;
    END
END;
GO
