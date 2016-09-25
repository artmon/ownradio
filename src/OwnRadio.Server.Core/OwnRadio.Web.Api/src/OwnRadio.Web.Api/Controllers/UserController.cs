using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using OwnRadio.Web.Api.Infrastructure;
using OwnRadio.Web.Api.Models;
using OwnRadio.Web.Api.Repositories;

namespace OwnRadio.Web.Api.Controllers
{
    [Route("api/[controller]/[action]")]
    public class UserController : Controller
    {
        public Settings settings { get; }

        public UserController(IOptions<Settings> settings)
        {
            this.settings = settings.Value;
        }


        // Возвращает всех пользователей
        // GET api/user/GetAllUsers
        [HttpGet()]
        public List<User> GetAllUsers()
        {
            var userRepos = new UsersRepository(settings.connectionString);
            var result = userRepos.GetAll();
            return result;
        }
    }
}