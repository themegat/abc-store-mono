using System.Diagnostics.CodeAnalysis;
using ABCStoreAPI.Service;
using ABCStoreAPI.Service.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ABCStoreAPI.Controller
{
    [ExcludeFromCodeCoverage]
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserDetailsController : ControllerBase
    {
        private readonly UserDetailsService _userDetailsService;
        public UserDetailsController(UserDetailsService userDetailsService)
        {
            _userDetailsService = userDetailsService;
        }
        [HttpGet]
        public async Task<ActionResult<UserDetailsDto>> GetUserDetails([FromQuery] string userId)
        {
            var userDetails = _userDetailsService.GetUserDetails(userId);
            return Ok(userDetails);
        }

        [HttpPost]
        [Route("update-create")]
        public async Task<ActionResult<UserDetailsDto>> UpdateCreateUserDetails([FromBody] UserDetailsDto userDetails)
        {
            _userDetailsService.UpdateCreateUserDetails(userDetails);
            return Ok(userDetails);
        }
    }
}
