using Microsoft.AspNetCore.Mvc;

namespace MyApp.Namespace
{
    [Route("api/[controller]")]
    [ApiController]
    public class AboutController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok("This is the About controller responding to a GET request. The new connection string works.");
        }
    }
}
