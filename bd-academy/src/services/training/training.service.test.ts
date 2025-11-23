import { describe, it, expect, vi, beforeEach } from 'vitest'
import TrainingService from './training.service'
import axios from 'axios'

// Mock axios
vi.mock('axios')
const mockedAxios = axios as any

describe('TrainingService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getTrainings', () => {
    it('should fetch trainings successfully', async () => {
      // Arrange
      const mockTrainings = [
        {
          id: '1',
          title: 'Test Training 1',
          description: 'Description 1',
          type: 'VR',
          published: false,
          favorite: false,
        },
        {
          id: '2',
          title: 'Test Training 2',
          description: 'Description 2',
          type: 'SCENE',
          published: true,
          favorite: true,
        },
      ]

      mockedAxios.get.mockResolvedValue({ data: mockTrainings })

      // Act
      const result = await TrainingService.getTrainings()

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/Trainings')
      )
      expect(result.data).toEqual(mockTrainings)
      expect(result.data).toHaveLength(2)
    })

    it('should handle error when fetching trainings fails', async () => {
      // Arrange
      const mockError = new Error('Network error')
      mockedAxios.get.mockRejectedValue(mockError)

      // Act & Assert
      await expect(TrainingService.getTrainings()).rejects.toThrow('Network error')
    })
  })

  describe('changeTrainingToFavorite', () => {
    it('should toggle favorite status successfully', async () => {
      // Arrange
      const mockPayload = {
        trainingId: '123',
        trainingCreatorId: 'user-456',
      }
      mockedAxios.post.mockResolvedValue({ data: { success: true } })

      // Act
      const result = await TrainingService.changeTrainingToFavorite(mockPayload)

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/Trainings/favorite'),
        mockPayload
      )
      expect(result.data).toEqual({ success: true })
    })

    it('should handle error when toggling favorite fails', async () => {
      // Arrange
      const mockPayload = {
        trainingId: '123',
        trainingCreatorId: 'user-456',
      }
      const mockError = new Error('Server error')
      mockedAxios.post.mockRejectedValue(mockError)

      // Act & Assert
      await expect(
        TrainingService.changeTrainingToFavorite(mockPayload)
      ).rejects.toThrow('Server error')
    })
  })

  describe('validateTraining', () => {
    it('should validate training successfully', async () => {
      // Arrange
      const trainingId = 'training-123'
      const mockValidationResult = {
        isValid: true,
        errors: [],
      }
      mockedAxios.get.mockResolvedValue({ data: mockValidationResult })

      // Act
      const result = await TrainingService.validateTraining(trainingId)

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(`/api/Trainings/${trainingId}/validate`)
      )
      expect(result.data.isValid).toBe(true)
      expect(result.data.errors).toHaveLength(0)
    })

    it('should return validation errors when training is invalid', async () => {
      // Arrange
      const trainingId = 'training-123'
      const mockValidationResult = {
        isValid: false,
        errors: ['Missing title', 'No scenes defined'],
      }
      mockedAxios.get.mockResolvedValue({ data: mockValidationResult })

      // Act
      const result = await TrainingService.validateTraining(trainingId)

      // Assert
      expect(result.data.isValid).toBe(false)
      expect(result.data.errors).toHaveLength(2)
      expect(result.data.errors).toContain('Missing title')
    })
  })
})
