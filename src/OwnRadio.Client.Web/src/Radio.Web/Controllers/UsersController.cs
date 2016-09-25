using System.Linq;
using Microsoft.AspNet.Mvc;

namespace Radio.Web.Controllers
{
    public class UsersController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}