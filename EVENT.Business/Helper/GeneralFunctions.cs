using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using System.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace INvoice.Models {
    public interface IGeneralFunctions
    {
        Task<DataSet> GetDataSetFromQueryAsync(string query);
        Task<DataSet> GetDataSetFromParamsAsync(string spName, Dictionary<string, string> parameters);
        Task<DataSet> GetDataSetFromSPAsync(string spName, Dictionary<string, object>? parameters = null);
        Task<int> ExecuteSPAsync(string spName, Dictionary<string, object>? parameters = null);
    }

    public class GeneralFunctions : IGeneralFunctions
    {
        private readonly string _connectionString;

        public GeneralFunctions(IConfiguration configuration)
        {
            _connectionString = configuration["ApplicationSettings:ConnectionString"] ?? "";
        }

        public async Task<DataSet> GetDataSetFromQueryAsync(string query)
        {
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand(query, conn))
                {
                    using (var da = new SqlDataAdapter(cmd))
                    {
                        var ds = new DataSet();
                        await conn.OpenAsync();
                        da.Fill(ds);
                        return ds;
                    }
                }
            }
        }

        public async Task<DataSet> GetDataSetFromParamsAsync(string spName, Dictionary<string, string> parameters)
        {
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand(spName, conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    foreach (var param in parameters)
                    {
                        cmd.Parameters.AddWithValue(param.Key, param.Value);
                    }
                    using (var da = new SqlDataAdapter(cmd))
                    {
                        var ds = new DataSet();
                        await conn.OpenAsync();
                        da.Fill(ds);
                        return ds;
                    }
                }
            }
        }

        public async Task<DataSet> GetDataSetFromSPAsync(string spName, Dictionary<string, object>? parameters = null)
        {
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand(spName, conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    if (parameters != null)
                    {
                        foreach (var param in parameters)
                        {
                            cmd.Parameters.AddWithValue(param.Key, param.Value ?? DBNull.Value);
                        }
                    }
                    using (var da = new SqlDataAdapter(cmd))
                    {
                        var ds = new DataSet();
                        await conn.OpenAsync();
                        da.Fill(ds);
                        return ds;
                    }
                }
            }
        }

        public async Task<int> ExecuteSPAsync(string spName, Dictionary<string, object>? parameters = null)
        {
            using (var conn = new SqlConnection(_connectionString))
            {
                using (var cmd = new SqlCommand(spName, conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    if (parameters != null)
                    {
                        foreach (var param in parameters)
                        {
                            cmd.Parameters.AddWithValue(param.Key, param.Value ?? DBNull.Value);
                        }
                    }
                    await conn.OpenAsync();
                    return await cmd.ExecuteNonQueryAsync();
                }
            }
        }
    }
}
