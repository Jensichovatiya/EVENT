using EVENT.Business.BusinessClass;
using EVENT.Web.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EVENT.DAL.IRepository
{
    public interface IReportRepository
    {
        Task<ApiResponseModel<List<RevenueReportResponse>>> GetRevenueReportAsync();
        Task<ApiResponseModel<List<BookingReportResponse>>> GetBookingReportAsync();
    }
}
