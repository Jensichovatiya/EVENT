using EVENT.Business.BusinessClass;
using EVENT.Web.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EVENT.DAL.IRepository
{
    public interface IPassRepository
    {
        Task<ApiResponseModel<PassResponse>> GenerateRegeneratePassAsync(PassGenerateRequest request);
        Task<ApiResponseModel<PassResponse>> GetPassByIdAsync(long passId);
        Task<ApiResponseModel<PassValidateResponse>> ValidatePassAsync(PassValidateRequest request);
        Task<ApiResponseModel<ScanLogResponse>> ScanPassAsync(ScanRequest request);
        Task<ApiResponseModel<List<ScanLogResponse>>> GetScanHistoryAsync();
        Task<ApiResponseModel<List<AttendanceReportResponse>>> GetAttendanceReportAsync();
    }
}
