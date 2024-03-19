using bd_academy_backend.Modules.TrainingNamespace.DTO;
using bd_academy_backend.Modules.TrainingNamespace.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace bd_academy_backend.Modules.TrainingNamespace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TrainingsController : ControllerBase
    {
        private readonly AppDBContext _context;

        public TrainingsController(AppDBContext context)
        {
            _context = context;
        }

        // GET: api/Trainings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TrainingDTO>>> GetTraining()
        {
            if (_context.Training == null)
            {
                return NotFound();
            }

            foreach (Training training in _context.Training.ToList())
            {
                var existingTrainingValues = await _context.TrainingValue.Where(trainingValue => trainingValue.TrainingId == training.Id).ToListAsync();
                training.TrainingValue = existingTrainingValues;

                var existingTrainingSections = await _context.TrainingSection.Where(trainingValue => trainingValue.TrainingId == training.Id).ToListAsync();

                foreach (TrainingSection existingTrainingSection in existingTrainingSections)
                {
                    var existingTrainingSectionComponents = await _context.TrainingSectionComponent.Where(trainingSectionComponent => trainingSectionComponent.TrainingSectionId == existingTrainingSection.Id).ToListAsync();
                    existingTrainingSection.TrainingSectionComponents = existingTrainingSectionComponents;

                }

                training.TrainingSections = existingTrainingSections;

                //training.TrainingFavorite = await _context.TrainingFavorite.Where(trainingFavorite => trainingFavorite.TrainingId == training.Id).ToListAsync();

            }



            //return await _context.Set<Training>().Select(training => training.toDTO()).ToListAsync();
            var favTrainings = await _context.TrainingFavorite.Where(trainingFavorite => trainingFavorite.TrainingCreatorId == new Guid("2013c774-01e7-47e6-81cf-15356c1885e1")).ToListAsync();
            var trainingsDTOS = await _context.Training.Select(training => training.toDTO()).ToListAsync();
            trainingsDTOS.FindAll(trainingDTO => favTrainings.Exists(trainingFavorite => trainingFavorite.TrainingId == trainingDTO.Id)).ForEach(trainingDTO => trainingDTO.Favorite = true);
            return trainingsDTOS;
        }

        // GET: api/Trainings/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TrainingDTO>> GetTraining(Guid id)
        {
            if (_context.Training == null)
            {
                return NotFound();
            }
            var training = await _context.Training.FindAsync(id);

            if (training == null)
            {
                return NotFound();
            }

            var existingTrainingValues = await _context.TrainingValue.Where(trainingValue => trainingValue.TrainingId == id).ToListAsync();
            training.TrainingValue = existingTrainingValues;

            var existingTrainingSections = await _context.TrainingSection.Where(trainingValue => trainingValue.TrainingId == id).ToListAsync();


            foreach (TrainingSection existingTrainingSection in existingTrainingSections)
            {
                var existingTrainingSectionComponents = await _context.TrainingSectionComponent.Where(trainingSectionComponent => trainingSectionComponent.TrainingSectionId == existingTrainingSection.Id).ToListAsync();
                existingTrainingSection.TrainingSectionComponents = existingTrainingSectionComponents;

            }

            training.TrainingSections = existingTrainingSections;

            return training.toDTO();
        }

        // POST: api/Trainings/{id}
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost("{id}")]
        public async Task<ActionResult<TrainingDTO>> PostTraining(Guid id, TrainingDTO trainingDTO)
        {

            if (id != trainingDTO.Id)
            {
                return BadRequest();
            }

            if (_context.Training == null)
            {
                return NotFound();
            }

            var existingTrainingModel = await _context.Training.FindAsync(id);

            if (existingTrainingModel == null)
            {
                existingTrainingModel = new Training().fromDTO(trainingDTO);

                _context.Training.Add(existingTrainingModel);
                await _context.SaveChangesAsync();
            }
            else
            {
                existingTrainingModel.fromDTO(trainingDTO);

            }


            var existingTrainingSections = await _context.TrainingSection.Where(trainingValue => trainingValue.TrainingId == id).ToListAsync();


            foreach (TrainingSection existingTrainingSection in existingTrainingSections)
            {
                var existingTrainingSectionComponents = await _context.TrainingSectionComponent.Where(trainingSectionComponent => trainingSectionComponent.TrainingSectionId == existingTrainingSection.Id).ToListAsync();
                existingTrainingSection.TrainingSectionComponents = existingTrainingSectionComponents;

            }

            existingTrainingModel.TrainingSections = existingTrainingSections;


            if (trainingDTO.TrainingValue.Count > 0)
            {

                //find traiining values with trainingid equaled to id
                var existingTrainingValues = await _context.TrainingValue.Where(trainingValue => trainingValue.TrainingId == id).ToListAsync();

                if (existingTrainingValues != null)
                {
                    foreach (TrainingValue existingTrainingValue in existingTrainingValues)
                    {
                        if (existingTrainingValue != null)
                        {
                            _context.TrainingValue.Remove(existingTrainingValue);
                        }
                    }
                }


                foreach (string trainingValue in trainingDTO.TrainingValue)
                {
                    var newTrainingValue = new TrainingValue();
                    newTrainingValue.Value = trainingValue;
                    newTrainingValue.TrainingId = id;
                    await _context.TrainingValue.AddAsync(newTrainingValue);
                }
            }

            foreach (TrainingSection existinTrainingModelTrainingSection in existingTrainingModel.TrainingSections)
            {
                var sectionExsistsInDTO = trainingDTO.TrainingSections.Find(ts => ts.Id == existinTrainingModelTrainingSection.Id);
                if (sectionExsistsInDTO == null)
                {
                    _context.TrainingSection.Remove(existinTrainingModelTrainingSection);
                }

                foreach (TrainingSectionComponent existinTrainingModelTrainingSectionTrainingSectionComponent in existinTrainingModelTrainingSection.TrainingSectionComponents)
                {
                    if (sectionExsistsInDTO == null)
                    {
                        _context.TrainingSectionComponent.Remove(existinTrainingModelTrainingSectionTrainingSectionComponent);
                    }
                    else
                    {
                        var componentExists = sectionExsistsInDTO.TrainingSectionComponents.Find(tsc => tsc.Id == existinTrainingModelTrainingSectionTrainingSectionComponent.Id);
                        if (componentExists == null)
                        {
                            _context.TrainingSectionComponent.Remove(existinTrainingModelTrainingSectionTrainingSectionComponent);
                        }
                    }

                }


            }


            if (trainingDTO.TrainingSections.Count > 0)
            {
                foreach (TrainingSectionDTO trainingSectionDTO in trainingDTO.TrainingSections)
                {

                    var existingTrainingSection = await _context.TrainingSection.FindAsync(trainingSectionDTO.Id);

                    if (existingTrainingSection == null)
                    {
                        existingTrainingSection = new TrainingSection();
                        existingTrainingSection.fromDTO(trainingSectionDTO);
                        existingTrainingSection.TrainingId = id;
                        await _context.TrainingSection.AddAsync(existingTrainingSection);
                        existingTrainingModel.TrainingSections.Add(existingTrainingSection);
                    }
                    else
                    {
                        //update data
                        existingTrainingSection.fromDTO(trainingSectionDTO);


                    }
                    foreach (TrainingSectionComponentDTO trainingSectionComponentDTO in trainingSectionDTO.TrainingSectionComponents)
                    {
                        var existingTrainingSectionComponent = await _context.TrainingSectionComponent.FindAsync(trainingSectionComponentDTO.Id);

                        if (existingTrainingSectionComponent == null)
                        {
                            existingTrainingSectionComponent = new TrainingSectionComponent();
                            existingTrainingSectionComponent.fromDTO(trainingSectionComponentDTO);
                            existingTrainingSectionComponent.TrainingSectionId = existingTrainingSection.Id;
                            await _context.TrainingSectionComponent.AddAsync(existingTrainingSectionComponent);
                            existingTrainingSection.TrainingSectionComponents.Add(existingTrainingSectionComponent);

                        }
                        else
                        {
                            //update data
                            existingTrainingSectionComponent.fromDTO(trainingSectionComponentDTO);
                            //existingTrainingSection.TrainingSectionComponents.Add(existingTrainingSectionComponent);
                        }

                    }
                    //await _context.TrainingSection.Update(existingTrainingSection);
                    existingTrainingModel.TrainingSections.Add(existingTrainingSection);

                }

            }



            try
            {
                _context.Training.Update(existingTrainingModel);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TrainingExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return trainingDTO;

        }

        // DELETE: api/Trainings/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTraining(Guid id)
        {
            if (_context.Training == null)
            {
                return NotFound();
            }
            var training = await _context.Training.FindAsync(id);
            if (training == null)
            {
                return NotFound();
            }

            _context.Training.Remove(training);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TrainingExists(Guid id)
        {
            return (_context.Training?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
