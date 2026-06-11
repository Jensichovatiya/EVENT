using EVENT.Business.BusinessClass;
using EVENT.Business.Helper;
using EVENT.DAL.IRepository;
using EVENT.Web.Models;
using Newtonsoft.Json;
using INvoice.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace EVENT.DAL.Repository
{
    public class SettingsRepository : ISettingsRepository
    {
        private readonly IGeneralFunctions _gf;

        public SettingsRepository(IGeneralFunctions gf)
        {
            _gf = gf;
        }

        public async Task<ApiResponseModel<List<CurrencyResponse>>> GetCurrenciesAsync()
        {
            try
            {
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetCurrencies");
                var list = new List<CurrencyResponse>();

                if (ds != null && ds.Tables.Count > 0)
                {
                    list = ds.Tables[0].AsEnumerable()
                        .Select(row => DataRowToObject.CreateItemFromRow<CurrencyResponse>(row))
                        .ToList();
                }

                return new ApiResponseModel<List<CurrencyResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Currencies retrieved successfully.",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<CurrencyResponse>>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<string>> AddEditCurrencyAsync(CurrencyRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_AddEditCurrency", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    return new ApiResponseModel<string>
                    {
                        Success = (status == 200 || status == 201),
                        StatusCode = status,
                        Message = message,
                        Data = message
                    };
                }

                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = "Failed to complete currency operation."
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
