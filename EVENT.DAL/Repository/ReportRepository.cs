using EVENT.Business.BusinessClass;
using EVENT.Business.Helper;
using EVENT.DAL.IRepository;
using EVENT.Web.Models;
using INvoice.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace EVENT.DAL.Repository
{
    public class ReportRepository : IReportRepository
    {
        private readonly IGeneralFunctions _gf;

        public ReportRepository(IGeneralFunctions gf)
        {
            _gf = gf;
        }

        public async Task<ApiResponseModel<List<RevenueReportResponse>>> GetRevenueReportAsync()
        {
            try
            {
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetRevenueReport");
                var list = new List<RevenueReportResponse>();

                if (ds != null && ds.Tables.Count > 0)
                {
                    list = ds.Tables[0].AsEnumerable()
                        .Select(row => DataRowToObject.CreateItemFromRow<RevenueReportResponse>(row))
                        .ToList();
                }

                return new ApiResponseModel<List<RevenueReportResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Revenue report retrieved successfully.",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<RevenueReportResponse>>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<List<BookingReportResponse>>> GetBookingReportAsync()
        {
            try
            {
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetBookingReport");
                var list = new List<BookingReportResponse>();

                if (ds != null && ds.Tables.Count > 0)
                {
                    list = ds.Tables[0].AsEnumerable()
                        .Select(row => DataRowToObject.CreateItemFromRow<BookingReportResponse>(row))
                        .ToList();
                }

                return new ApiResponseModel<List<BookingReportResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Booking report retrieved successfully.",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<BookingReportResponse>>
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
