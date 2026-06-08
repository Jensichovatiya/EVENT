using Dapper;
using Microsoft.Extensions.Options;
using EVENT.Business.Settings;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.DAL {
    public abstract class BaseRepository {
        public readonly IOptions<ApplicationSettings> _connectionString;

        public BaseRepository(IOptions<ApplicationSettings> connectionString) {
            _connectionString = connectionString;
        }

        public async Task<T> QueryFirstOrDefaultAsync<T>(string sql, object param = null, IDbTransaction transaction = null, int? commandTimeout = null, CommandType? commandType = null) {
            using (SqlConnection con = new SqlConnection(_connectionString.Value.ConnectionString)) {
                await con.OpenAsync();
                var result = await con.QueryFirstOrDefaultAsync<T>(sql, param, commandType: commandType);
                await con.CloseAsync();
                return result;
            }
        }

        public async Task<IEnumerable<T>> QueryAsync<T>(string sql, object param = null, IDbTransaction transaction = null, int? commandTimeout = null, CommandType? commandType = null) {
            using (SqlConnection con = new SqlConnection(_connectionString.Value.ConnectionString)) {
                await con.OpenAsync();
                var result = await con.QueryAsync<T>(sql, param, commandType: commandType);
                await con.CloseAsync();
                return result;
            }
        }

        public async Task<object> ExecuteScalarAsync<T>(string sql, object param = null, IDbTransaction transaction = null, int? commandTimeout = null, CommandType? commandType = null) {
            using (SqlConnection con = new SqlConnection(_connectionString.Value.ConnectionString)) {
                await con.OpenAsync();
                var result = await con.ExecuteScalarAsync<object>(sql, param, commandType: commandType);
                await con.CloseAsync();
                return result;
            }
        }

        public async Task<int> ExecuteAsync<T>(string sql, object param = null, IDbTransaction transaction = null, int? commandTimeout = null, CommandType? commandType = null) {
            using (SqlConnection con = new SqlConnection(_connectionString.Value.ConnectionString)) {
                await con.OpenAsync();
                var result = await con.ExecuteAsync(sql, param, commandType: commandType);
                await con.CloseAsync();
                return result;
            }
        }

        public async Task<SqlMapper.GridReader> QueryMultipleAsync<T>(string sql, object param = null, IDbTransaction transaction = null, int? commandTimeout = null, CommandType? commandType = null) {
            using (SqlConnection con = new SqlConnection(_connectionString.Value.ConnectionString)) {
                await con.OpenAsync();
                var result = await con.QueryMultipleAsync(sql, param, commandType: commandType);
                await con.CloseAsync();
                return result;
            }
        }

        public async Task<DataSet> ExecuteReaderAsync(string sql, object param = null, IDbTransaction transaction = null, int? commandTimeout = null, CommandType? commandType = null) {
            using (SqlConnection con = new SqlConnection(_connectionString.Value.ConnectionString)) {
                await con.OpenAsync();
                var result = await con.ExecuteReaderAsync(sql, param, commandType: commandType);

                DataSet ds = new DataSet();
                int i = 0;
                while (!result.IsClosed) {
                    ds.Tables.Add("Table" + (i + 1));
                    ds.EnforceConstraints = false;
                    ds.Tables[i].Load(result);
                    i++;
                }

                await con.CloseAsync();
                return ds;
            }
        }

        public async Task<IEnumerable<T>> QueryAsyncForExternalDb<T>(string connectionString, string sql, object param = null, IDbTransaction transaction = null, int? commandTimeout = null, CommandType? commandType = null) {
            using (SqlConnection con = new SqlConnection(connectionString)) {
                await con.OpenAsync();
                var result = await con.QueryAsync<T>(sql, param, commandType: commandType);
                await con.CloseAsync();
                return result;
            }
        }

        public async Task<int> ExecuteAsyncForExternalDb<T>(string connectionString, string sql, object param = null, IDbTransaction transaction = null, int? commandTimeout = null, CommandType? commandType = null) {
            using (SqlConnection con = new SqlConnection(connectionString)) {
                await con.OpenAsync();
                var result = await con.ExecuteAsync(sql, param, commandType: commandType);
                await con.CloseAsync();
                return result;
            }
        }

        public async Task<T> QueryFirstOrDefaultAsyncForExternalDb<T>(string connectionString, string sql, object param = null, IDbTransaction transaction = null, int? commandTimeout = null, CommandType? commandType = null) {
            using (SqlConnection con = new SqlConnection(connectionString)) {
                await con.OpenAsync();
                var result = await con.QueryFirstOrDefaultAsync<T>(sql, param, commandType: commandType);
                await con.CloseAsync();
                return result;
            }
        }
    }
}
