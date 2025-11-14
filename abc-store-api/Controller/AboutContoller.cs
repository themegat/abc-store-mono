using System.Reflection;
using Microsoft.AspNetCore.Mvc;

namespace ABCStoreAPI.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class AboutController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            var asm = Assembly.GetExecutingAssembly();
            var runtimeVersion = asm.GetName().Version;
            var buidlVersion = Environment.GetEnvironmentVariable("BUILD_VERSION");

            return Ok("Runtime ABC Store API Version: " + runtimeVersion + " Build Version: " + buidlVersion);
        }
    }
}
