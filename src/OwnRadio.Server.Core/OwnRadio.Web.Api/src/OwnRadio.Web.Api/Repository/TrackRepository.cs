using System;
using System.Collections.Generic;
using System.Data;
using Npgsql;
using OwnRadio.Web.Api.Models;

namespace OwnRadio.Web.Api.Repository
{
	public class TrackRepository
    {
		// Строка подключения к БД
		private string connectionString;

		// Конструктор - инициализация данных
		public TrackRepository(string connectionString)
		{
			this.connectionString = connectionString;
		}

		// Получает путь на сервере к треку по его идентификатору
		internal string GetTrackPath(Guid trackID)
		{
			var trackPath = string.Empty;

			using (var npgSqlConnection = new NpgsqlConnection(connectionString))
			{
				// Создаем комманду - с регистром имени функции проблема: не видит
				var npgSqlCommand = new NpgsqlCommand();
				// Указываем имя хранимой процедуры (функции)
				npgSqlCommand.CommandText = "gettrackpathbyid";
				// Указываем подключение
				npgSqlCommand.Connection = npgSqlConnection;
				// Уточняем тип комманды - хранимая процедура
				npgSqlCommand.CommandType = CommandType.StoredProcedure;
				// Добавляем параметры
				npgSqlCommand.Parameters.AddWithValue("i_trackid", trackID);
				// Открываем соединение
				npgSqlConnection.Open();
				// Выполняем хранимую процедуру (функцию)
				trackPath = (string)npgSqlCommand.ExecuteScalar();
			}

			return trackPath;
		}

        // Получает все треки по его идентификатору пользователя
        internal List<Track> GetAllTracksByUserID(Guid userID)
        {

            var result = new List<Track>();

            using (var npgSqlConnection = new NpgsqlConnection(connectionString))
            {
                var npgSqlCommand = new NpgsqlCommand("Select id, path, uploaddatetime from track where uploaduserid = :userID");
                npgSqlCommand.Parameters.AddWithValue("userID", userID);
                npgSqlCommand.Connection = npgSqlConnection;
                npgSqlConnection.Open();
                // Выполняем 
                var reader = npgSqlCommand.ExecuteReader();

                while (reader.Read())
                {
                    var track = new Track();

                    track.Id = Guid.Parse(reader[0].ToString());
                    track.Path = reader[1].ToString();
                    track.Uploaded = DateTime.Parse(reader[2].ToString());

                    result.Add(track);
                }
            }

            return result;
        }


        // Получает идентификатор следующего трека для заданного идентификатором устройства
        internal Guid GetNextTrackID(Guid deviceID)
		{
			var nextTrackID = Guid.Empty;
			using (var npgSqlConnection = new NpgsqlConnection(connectionString))
			{
				// Создаем комманду - с регистром имени функции проблема: не видит
				var npgSqlCommand = new NpgsqlCommand();
				// Указываем имя хранимой процедуры (функции)
				npgSqlCommand.CommandText = "getnexttrackid";
				// Указываем подключение
				npgSqlCommand.Connection = npgSqlConnection;
				// Уточняем тип комманды - хранимая процедура
				npgSqlCommand.CommandType = CommandType.StoredProcedure;
				// Добавляем параметры
				npgSqlCommand.Parameters.AddWithValue("i_deviceid", deviceID);
				// Открываем соединение
				npgSqlConnection.Open();
				// Выполняем хранимую процедуру (функцию)
				nextTrackID = (Guid)npgSqlCommand.ExecuteScalar();
			}
			return nextTrackID;
		}

		// Устанавливает статус прослушивания трека
		internal int SetStatusTrack(Guid DeviceID, Guid TrackID, int IsListen, DateTime DateTimeListen)
		{
			var rowCount = 0;
			using (var npgSqlConnection = new NpgsqlConnection(connectionString))
			{
				// Создаем комманду - с регистром имени функции проблема: не видит
				var npgSqlCommand = new NpgsqlCommand();
				// Указываем имя хранимой процедуры (функции)
				npgSqlCommand.CommandText = "setstatustrack";
				// Указываем подключение
				npgSqlCommand.Connection = npgSqlConnection;
				// Уточняем тип комманды - хранимая процедура
				npgSqlCommand.CommandType = CommandType.StoredProcedure;
				// Добавляем параметры
				npgSqlCommand.Parameters.AddWithValue("i_deviceid", DeviceID);
				npgSqlCommand.Parameters.AddWithValue("i_trackid", TrackID);
				npgSqlCommand.Parameters.AddWithValue("i_islisten", IsListen);
				npgSqlCommand.Parameters.AddWithValue("i_datetimelisten", DateTimeListen);
				// Открываем соединение
				npgSqlConnection.Open();
				// Выполняем хранимую процедуру (функцию)
				rowCount = npgSqlCommand.ExecuteNonQuery();
			}
			return rowCount;
		}
	}
}
