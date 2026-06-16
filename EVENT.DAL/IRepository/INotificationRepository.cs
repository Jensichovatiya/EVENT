using EVENT.Business.BusinessClass;
using EVENT.Web.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EVENT.DAL.IRepository
{
    public interface INotificationRepository
    {
        Task<ApiResponseModel<List<NotificationResponse>>> GetNotificationsAsync(long userId);
        Task<ApiResponseModel<string>> MarkAsReadAsync(long notificationId);
    }
}
