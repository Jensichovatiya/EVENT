using EVENT.Business.BusinessClass;
using EVENT.Business.Helper;
using EVENT.DAL.IRepository;
using EVENT.Web.Models;
using INvoice.Models;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace EVENT.DAL.Repository
{
    public class PassRepository : IPassRepository
    {
        private readonly IGeneralFunctions _gf;
        private readonly IConfiguration _config;

        public PassRepository(IGeneralFunctions gf, IConfiguration config)
        {
            _gf = gf;
            _config = config;
        }

        public async Task<ApiResponseModel<PassResponse>> GenerateRegeneratePassAsync(PassGenerateRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GenerateRegeneratePass", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    if (status == 201 || status == 200)
                    {
                        var data = ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0
                            ? DataRowToObject.CreateItemFromRow<PassResponse>(ds.Tables[1].Rows[0])
                            : null;

                        return new ApiResponseModel<PassResponse>
                        {
                            Success = true,
                            StatusCode = status,
                            Message = message,
                            Data = data
                        };
                    }
                    return new ApiResponseModel<PassResponse>
                    {
                        Success = false,
                        StatusCode = status,
                        Message = message
                    };
                }
                return new ApiResponseModel<PassResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = "Failed to complete pass operation."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<PassResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<PassResponse>> GetPassByIdAsync(long passId, long? userId = null, int? userRole = null)
        {
            try
            {
                var parameters = new Dictionary<string, object> { { "@PassId", passId } };
                if (userId.HasValue)
                {
                    parameters.Add("@UserId", userId.Value);
                }
                if (userRole.HasValue)
                {
                    parameters.Add("@UserRole", userRole.Value);
                }
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetPassDetails", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    var pass = DataRowToObject.CreateItemFromRow<PassResponse>(ds.Tables[0].Rows[0]);
                    return new ApiResponseModel<PassResponse>
                    {
                        Success = true,
                        StatusCode = 200,
                        Message = "Pass details retrieved successfully.",
                        Data = pass
                    };
                }

                return new ApiResponseModel<PassResponse>
                {
                    Success = false,
                    StatusCode = 404,
                    Message = "Pass not found."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<PassResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<PassValidateResponse>> ValidatePassAsync(PassValidateRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_ValidatePass", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    var validation = DataRowToObject.CreateItemFromRow<PassValidateResponse>(ds.Tables[0].Rows[0]);
                    return new ApiResponseModel<PassValidateResponse>
                    {
                        Success = validation.IsValid,
                        StatusCode = validation.IsValid ? 200 : 400,
                        Message = validation.Message,
                        Data = validation
                    };
                }

                return new ApiResponseModel<PassValidateResponse>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Pass validation failed."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<PassValidateResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<ScanLogResponse>> ScanPassAsync(ScanRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_ScanPass", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    if (status == 200 || status == 201)
                    {
                        var data = ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0
                            ? DataRowToObject.CreateItemFromRow<ScanLogResponse>(ds.Tables[1].Rows[0])
                            : null;

                        return new ApiResponseModel<ScanLogResponse>
                        {
                            Success = true,
                            StatusCode = status,
                            Message = message,
                            Data = data
                        };
                    }

                    return new ApiResponseModel<ScanLogResponse>
                    {
                        Success = false,
                        StatusCode = status,
                        Message = message
                    };
                }

                return new ApiResponseModel<ScanLogResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = "No response from database."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<ScanLogResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<List<ScanLogResponse>>> GetScanHistoryAsync()
        {
            try
            {
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetScanReports");
                var list = new List<ScanLogResponse>();

                if (ds != null && ds.Tables.Count > 0)
                {
                    list = ds.Tables[0].AsEnumerable()
                        .Select(row => DataRowToObject.CreateItemFromRow<ScanLogResponse>(row))
                        .ToList();
                }

                return new ApiResponseModel<List<ScanLogResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Scan history retrieved successfully.",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<ScanLogResponse>>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<List<AttendanceReportResponse>>> GetAttendanceReportAsync()
        {
            try
            {
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetScanReports", new Dictionary<string, object> { { "@ReportType", "ATTENDANCE" } });
                var list = new List<AttendanceReportResponse>();

                if (ds != null && ds.Tables.Count > 0)
                {
                    list = ds.Tables[0].AsEnumerable()
                        .Select(row => DataRowToObject.CreateItemFromRow<AttendanceReportResponse>(row))
                        .ToList();
                }

                return new ApiResponseModel<List<AttendanceReportResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Attendance report retrieved successfully.",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<AttendanceReportResponse>>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<List<PassResponse>>> GetUserPassesAsync(long userId, int? userRole = null)
        {
            try
            {
                var parameters = new Dictionary<string, object> { { "@UserId", userId } };
                if (userRole.HasValue)
                {
                    parameters.Add("@UserRole", userRole.Value);
                }
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetUserPasses", parameters);
                var list = new List<PassResponse>();

                if (ds != null && ds.Tables.Count > 0)
                {
                    list = ds.Tables[0].AsEnumerable()
                        .Select(row => DataRowToObject.CreateItemFromRow<PassResponse>(row))
                        .ToList();
                }

                return new ApiResponseModel<List<PassResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "User passes retrieved successfully.",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<PassResponse>>
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
