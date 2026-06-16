using EVENT.Business.BusinessClass;
using EVENT.DAL.IRepository;
using EVENT.Web.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace EVENT.WebAPI.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationRepository _notificationRepository;

        public NotificationController(INotificationRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }

        [HttpGet("notifications")]
        public async Task<IActionResult> GetNotifications([FromQuery] long userId)
        {
            var result = await _notificationRepository.GetNotificationsAsync(userId);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPut("notifications/{id}/read")]
        public async Task<IActionResult> MarkAsRead(long id)
        {
            var result = await _notificationRepository.MarkAsReadAsync(id);
            return StatusCode(result.StatusCode, result);
        }
    }
}
