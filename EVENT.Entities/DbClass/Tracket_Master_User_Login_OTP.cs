using System;

namespace EVENT.Entities.DbClass
{
    public class Tracket_Master_User_Login_OTP
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public bool IsSms { get; set; }
        public bool IsEmail { get; set; }
        public string Otp { get; set; } = string.Empty;
        public string? Purpose { get; set; }
        public string? RefKey { get; set; }
        public DateTime ExpiryDate { get; set; }
        public bool IsUsed { get; set; }
        public long? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string? CreatedFrom { get; set; }
        public long? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? UpdatedFrom { get; set; }
    }
}
