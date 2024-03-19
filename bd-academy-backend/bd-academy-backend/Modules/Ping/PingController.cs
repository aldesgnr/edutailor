using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NuGet.Common;
using System.IdentityModel.Tokens.Jwt;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace bd_academy_backend.Modules.Ping
{
    [Route("")]
    [ApiController]
    public class PingController : ControllerBase
    {
        // GET: api/ping
        [HttpGet]
        [Route("ping")]
        public IActionResult Get()
        {
            return Ok(new { status = "alive" });
        }

        // GET api/protected-ping

        [HttpGet()]
        [Route("protected-ping")]
        [Authorize]
        public IActionResult GetProtected()
        {
            return Ok(new { status = "alive" });
        }

       
    }
}
