using System;
using System.Collections.Generic;

namespace EVENT.Business.BusinessClass
{
    public class RegisterRequest
    {
        public string Name { get; set; } = string.Empty;
        public string MobileNo { get; set; } = string.Empty;
        public string DialCode { get; set; } = string.Empty;
        public string EmailId { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public long UserRole { get; set; }
        public string? RefferalCode { get; set; }
    }

    public class LoginRequest
    {
        public string UserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponse
    {
        public long UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string MobileNo { get; set; } = string.Empty;
        public string EmailId { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public long UserRole { get; set; }
        public string RoleName { get; set; } = string.Empty;
    }

    public class OTPVerifyRequest
    {
        public string MobileNo { get; set; } = string.Empty;
        public string OTP { get; set; } = string.Empty;
        public string Purpose { get; set; } = "Login"; // "Login", "Register", "Reset"
    }

    public class ResetPasswordRequest
    {
        public string MobileNo { get; set; } = string.Empty;
        public string OldPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
        public bool IsReset { get; set; } // true if forgotten, false if normal change
    }

    public class UserResponse
    {
        public long UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string MobileNo { get; set; } = string.Empty;
        public string EmailId { get; set; } = string.Empty;
        public long UserRole { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class UserStatusUpdateRequest
    {
        public long UserId { get; set; }
        public bool IsActive { get; set; }
    }

    public class RoleRequest
    {
        public long RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public string RoleDescription { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class RoleResponse
    {
        public long RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public string RoleDescription { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}
