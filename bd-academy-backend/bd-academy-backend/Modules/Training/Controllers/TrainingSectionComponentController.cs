using bd_academy_backend.Modules.TrainingNamespace.DTO;
using Microsoft.AspNetCore.Mvc;

namespace bd_academy_backend.Modules.TrainingNamespace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TrainingSectionComponentController : ControllerBase
    {
        private readonly AppDBContext _context;

        public TrainingSectionComponentController(AppDBContext context)
        {
            _context = context;
        }


        // GET: api/TrainingSectionComponent/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TrainingSectionComponentDTO>> GetTrainingSectionComponent(Guid id)
        {
            if (_context.TrainingSectionComponent == null)
            {
                return NotFound();
            }

            var existingTrainingSectionComponent = await _context.TrainingSectionComponent.FindAsync(id);
            if (existingTrainingSectionComponent == null) return NotFound();

            return existingTrainingSectionComponent.toDTO();
        }

    }
}
