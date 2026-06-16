using System;

namespace EVENT.Entities.DbClass
{
    public class Tracket_Master_User_Login
    {
        public long LoginId { get; set; }
        public long UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public bool IsVerified { get; set; }
        public bool IsApproved { get; set; }
        public bool IsFreezed { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsLocked { get; set; }
        public int FailedPasswordCount { get; set; }
        public string? Token { get; set; }
        public DateTime? LastActivityTime { get; set; }
        public string? OTP { get; set; }
        public DateTime? OTPExpiryDate { get; set; }
        public string? DeviceId { get; set; }
        public string? FCM_Token { get; set; }
        public long? PartnerId { get; set; }
        public long? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string? CreatedFrom { get; set; }
        public long? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? UpdatedFrom { get; set; }
    }
}
