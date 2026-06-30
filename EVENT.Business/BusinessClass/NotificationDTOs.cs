using System;

namespace EVENT.Business.BusinessClass
{
    public class NotificationResponse
    {
        public long NotificationId { get; set; }
        public Guid NotificationPublicId { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string MessageBody { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
    }
}
