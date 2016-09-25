using System;
using System.Collections.Generic;
using Npgsql;
using OwnRadio.Web.Api.Models;

namespace OwnRadio.Web.Api.Repository
{
    public class UsersRepository
    {

        // Строка подключения к БД
        private string connectionString;

        // Конструктор - инициализация данных
        public UsersRepository(string connectionString)
        {
            this.connectionString = connectionString;
        }


        public List<User> GetAll()
        {
            var result = new List<User>();

            using (var npgSqlConnection = new NpgsqlConnection(connectionString))
            {
                // Создаем комманду
                var npgSqlCommand = new NpgsqlCommand("Select * From ownuser");
                // Указываем подключение
                npgSqlCommand.Connection = npgSqlConnection;
                // Открываем соединение
                npgSqlConnection.Open();
                // Выполняем 
                var reader = npgSqlCommand.ExecuteReader();

                while (reader.Read())
                {
                    var user = new User();
                    
                    user.Id = Guid.Parse(reader[0].ToString());
                    user.Name = reader[1].ToString();

                    result.Add(user);
                }
            }

            return result;
        }
    }
}