-- Seed SuperAdmin User (Role 1)
IF NOT EXISTS (SELECT 1 FROM Tracket_Master_User WHERE EmailId = 'superadmin@gmail.com')
BEGIN
    DECLARE @SuperAdminId INT;
    INSERT INTO Tracket_Master_User (Name, UserType, UserRole, MobileNo, EmailId, PasswordHash, DialCode, MobileConfirmation, EmailConfirmation, IsActive, IsDeleted, CreatedDate)
    VALUES ('Super Admin User', 1, 1, '9999999991', 'superadmin@gmail.com', '123456', '+91', 1, 1, 1, 0, GETDATE());
    SET @SuperAdminId = SCOPE_IDENTITY();

    INSERT INTO Tracket_Master_User_Login (UserId, UserName, PasswordHash, IsVerified, IsApproved, IsDeleted, CreatedDate)
    VALUES (@SuperAdminId, 'superadmin@gmail.com', '123456', 1, 1, 0, GETDATE());

    INSERT INTO Tracket_Master_User_Profile (UserId, MobileNumber, IsActive, IsDeleted, CreatedDate)
    VALUES (@SuperAdminId, '9999999991', 1, 0, GETDATE());
END

-- Seed Organizer User (Role 2)
IF NOT EXISTS (SELECT 1 FROM Tracket_Master_User WHERE EmailId = 'organizer@gmail.com')
BEGIN
    DECLARE @OrganizerId INT;
    INSERT INTO Tracket_Master_User (Name, UserType, UserRole, MobileNo, EmailId, PasswordHash, DialCode, MobileConfirmation, EmailConfirmation, IsActive, IsDeleted, CreatedDate)
    VALUES ('Organizer User', 2, 2, '9999999992', 'organizer@gmail.com', '123456', '+91', 1, 1, 1, 0, GETDATE());
    SET @OrganizerId = SCOPE_IDENTITY();

    INSERT INTO Tracket_Master_User_Login (UserId, UserName, PasswordHash, IsVerified, IsApproved, IsDeleted, CreatedDate)
    VALUES (@OrganizerId, 'organizer@gmail.com', '123456', 1, 1, 0, GETDATE());

    INSERT INTO Tracket_Master_User_Profile (UserId, MobileNumber, IsActive, IsDeleted, CreatedDate)
    VALUES (@OrganizerId, '9999999992', 1, 0, GETDATE());
END

-- Seed Employee User (Role 3)
IF NOT EXISTS (SELECT 1 FROM Tracket_Master_User WHERE EmailId = 'employee@gmail.com')
BEGIN
    DECLARE @EmployeeId INT;
    INSERT INTO Tracket_Master_User (Name, UserType, UserRole, MobileNo, EmailId, PasswordHash, DialCode, MobileConfirmation, EmailConfirmation, IsActive, IsDeleted, CreatedDate)
    VALUES ('Employee User', 3, 3, '9999999993', 'employee@gmail.com', '123456', '+91', 1, 1, 1, 0, GETDATE());
    SET @EmployeeId = SCOPE_IDENTITY();

    INSERT INTO Tracket_Master_User_Login (UserId, UserName, PasswordHash, IsVerified, IsApproved, IsDeleted, CreatedDate)
    VALUES (@EmployeeId, 'employee@gmail.com', '123456', 1, 1, 0, GETDATE());

    INSERT INTO Tracket_Master_User_Profile (UserId, MobileNumber, IsActive, IsDeleted, CreatedDate)
    VALUES (@EmployeeId, '9999999993', 1, 0, GETDATE());
END

-- Seed Visitor User (Role 4)
IF NOT EXISTS (SELECT 1 FROM Tracket_Master_User WHERE EmailId = 'visitor@gmail.com')
BEGIN
    DECLARE @VisitorId INT;
    INSERT INTO Tracket_Master_User (Name, UserType, UserRole, MobileNo, EmailId, PasswordHash, DialCode, MobileConfirmation, EmailConfirmation, IsActive, IsDeleted, CreatedDate)
    VALUES ('Visitor User', 4, 4, '9999999994', 'visitor@gmail.com', '123456', '+91', 1, 1, 1, 0, GETDATE());
    SET @VisitorId = SCOPE_IDENTITY();

    INSERT INTO Tracket_Master_User_Login (UserId, UserName, PasswordHash, IsVerified, IsApproved, IsDeleted, CreatedDate)
    VALUES (@VisitorId, 'visitor@gmail.com', '123456', 1, 1, 0, GETDATE());

    INSERT INTO Tracket_Master_User_Profile (UserId, MobileNumber, IsActive, IsDeleted, CreatedDate)
    VALUES (@VisitorId, '9999999994', 1, 0, GETDATE());
END

-- Seed Scanner User (Role 5)
IF NOT EXISTS (SELECT 1 FROM Tracket_Master_User WHERE EmailId = 'scanner@gmail.com')
BEGIN
    DECLARE @ScannerId INT;
    INSERT INTO Tracket_Master_User (Name, UserType, UserRole, MobileNo, EmailId, PasswordHash, DialCode, MobileConfirmation, EmailConfirmation, IsActive, IsDeleted, CreatedDate)
    VALUES ('Scanner User', 5, 5, '9999999995', 'scanner@gmail.com', '123456', '+91', 1, 1, 1, 0, GETDATE());
    SET @ScannerId = SCOPE_IDENTITY();

    INSERT INTO Tracket_Master_User_Login (UserId, UserName, PasswordHash, IsVerified, IsApproved, IsDeleted, CreatedDate)
    VALUES (@ScannerId, 'scanner@gmail.com', '123456', 1, 1, 0, GETDATE());

    INSERT INTO Tracket_Master_User_Profile (UserId, MobileNumber, IsActive, IsDeleted, CreatedDate)
    VALUES (@ScannerId, '9999999995', 1, 0, GETDATE());
END
