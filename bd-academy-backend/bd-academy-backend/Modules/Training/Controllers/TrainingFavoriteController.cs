using bd_academy_backend.Modules.TrainingNamespace.DTO;
using bd_academy_backend.Modules.TrainingNamespace.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace bd_academy_backend.Modules.TrainingNamespace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TrainingFavoriteController : ControllerBase
    {
        private readonly AppDBContext _context;

        public TrainingFavoriteController(AppDBContext context)
        {
            _context = context;
        }

        //// GET: api/Trainings/Favorite
        //[HttpGet]
        //public async Task<ActionResult<IEnumerable<TrainingFavoriteDTO>>> GetTraining()
        //{
        //    if (_context.TrainingFavorite == null)
        //    {
        //        return NotFound();
        //    }

        //    return await _context.TrainingFavorite.Select(trainingFavorite => trainingFavorite.toDTO()).ToListAsync();

        //}


        // POST: api/Training/Favorite
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<TrainingFavoriteDTO>> PostTrainingFavorite(TrainingFavoriteDTO trainingFavoriteDTO)
        {
            if (_context.Training == null)
            {
                return Problem("Entity set 'AppDBContext.Training'  is null.");
            }

            if (_context.TrainingFavorite == null)
            {
                return Problem("Entity set 'AppDBContext.TrainingFavorite'  is null.");
            }

            var trainingFavoriteModel = await _context.TrainingFavorite.Where(trainingFavorite => trainingFavorite.TrainingId == trainingFavoriteDTO.TrainingId && trainingFavorite.TrainingCreatorId == trainingFavoriteDTO.TrainingCreatorId).ToListAsync();

            if (trainingFavoriteModel.Count > 0)

            {
                foreach (TrainingFavorite trainingFavorite in trainingFavoriteModel)
                {
                    _context.TrainingFavorite.Remove(trainingFavorite);
                }
                await _context.SaveChangesAsync();
                return Content("Removed");
            }
            else
            {
                var newTrainingFavoriteModel = new TrainingFavorite().fromDTO(trainingFavoriteDTO);

                await _context.TrainingFavorite.AddAsync(newTrainingFavoriteModel);
            }

            await _context.SaveChangesAsync();

            return Content("Added");
        }
        [HttpDelete]
        public async Task<ActionResult<TrainingFavoriteDTO>> DeleteTrainingFavorite(TrainingFavoriteDTO trainingFavoriteDTO)
        {
            if (_context.Training == null)
            {
                return Problem("Entity set 'AppDBContext.Training'  is null.");
            }

            if (_context.TrainingFavorite == null)
            {
                return Problem("Entity set 'AppDBContext.TrainingFavorite'  is null.");
            }

            var trainingFavoriteModel = await _context.TrainingFavorite.FindAsync(trainingFavoriteDTO.Id);

            if (trainingFavoriteModel == null)
            {
                return Problem("There is no record");
            }


            _context.TrainingFavorite.Remove(trainingFavoriteModel);
            await _context.SaveChangesAsync();

            return NoContent();
        }

    }
}
