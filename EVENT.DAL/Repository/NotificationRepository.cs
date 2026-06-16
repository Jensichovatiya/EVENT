using EVENT.Business.BusinessClass;
using EVENT.Business.Helper;
using EVENT.DAL.IRepository;
using EVENT.Web.Models;
using INvoice.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace EVENT.DAL.Repository
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly IGeneralFunctions _gf;
        private readonly IConfiguration _config;

        public NotificationRepository(IGeneralFunctions gf, IConfiguration config)
        {
            _gf = gf;
            _config = config;
        }

        public async Task<ApiResponseModel<List<NotificationResponse>>> GetNotificationsAsync(long userId)
        {
            try
            {
                var parameters = new Dictionary<string, object> { { "@UserId", userId } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetNotifications", parameters);
                var list = new List<NotificationResponse>();

                if (ds != null && ds.Tables.Count > 0)
                {
                    list = ds.Tables[0].AsEnumerable()
                        .Select(row => DataRowToObject.CreateItemFromRow<NotificationResponse>(row))
                        .ToList();
                }

                return new ApiResponseModel<List<NotificationResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Notifications retrieved successfully.",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<NotificationResponse>>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<string>> MarkAsReadAsync(long notificationId)
        {
            try
            {
                var parameters = new Dictionary<string, object> { { "@NotificationId", notificationId } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_MarkNotificationAsRead", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    return new ApiResponseModel<string>
                    {
                        Success = status == 200,
                        StatusCode = status,
                        Message = message,
                        Data = status == 200 ? "Notification marked as read successfully" : null
                    };
                }

                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Failed to mark notification as read."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }
    }
}
