using EVENT.Business.BusinessClass;
using EVENT.Web.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EVENT.DAL.IRepository
{
    public interface ISettingsRepository
    {
        Task<ApiResponseModel<List<CurrencyResponse>>> GetCurrenciesAsync();
        Task<ApiResponseModel<string>> AddEditCurrencyAsync(CurrencyRequest request);
    }
}
