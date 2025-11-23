import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TrainingCardComponent, TrainingCardComponentTypes } from './training-card.component'

describe('TrainingCardComponent', () => {
  const mockTrainingData = {
    id: 'training-123',
    title: 'Test Training',
    description: 'This is a test training description',
    type: 'VR',
    published: false,
    favorite: false,
    createdAt: '2025-01-01',
  }

  describe('TRAINING type', () => {
    it('should render training card with title and description', () => {
      // Arrange
      const mockOnClick = vi.fn()
      const mockOnClickChangeFavorite = vi.fn()

      // Act
      render(
        <TrainingCardComponent
          trainingData={mockTrainingData}
          type={TrainingCardComponentTypes.TRAINING}
          onClick={mockOnClick}
          onClickChangeFavorite={mockOnClickChangeFavorite}
        />
      )

      // Assert
      expect(screen.getByText('Test Training')).toBeInTheDocument()
      expect(screen.getByText('This is a test training description')).toBeInTheDocument()
    })

    it('should call onClick when card is clicked', () => {
      // Arrange
      const mockOnClick = vi.fn()
      const mockOnClickChangeFavorite = vi.fn()

      // Act
      render(
        <TrainingCardComponent
          trainingData={mockTrainingData}
          type={TrainingCardComponentTypes.TRAINING}
          onClick={mockOnClick}
          onClickChangeFavorite={mockOnClickChangeFavorite}
        />
      )

      const card = screen.getByText('Test Training').closest('.p-card')
      if (card) {
        fireEvent.click(card)
      }

      // Assert
      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('should call onClickChangeFavorite when favorite icon is clicked', () => {
      // Arrange
      const mockOnClick = vi.fn()
      const mockOnClickChangeFavorite = vi.fn()

      // Act
      render(
        <TrainingCardComponent
          trainingData={mockTrainingData}
          type={TrainingCardComponentTypes.TRAINING}
          onClick={mockOnClick}
          onClickChangeFavorite={mockOnClickChangeFavorite}
        />
      )

      const favoriteIcon = screen.getByRole('button', { name: /favorite/i })
      fireEvent.click(favoriteIcon)

      // Assert
      expect(mockOnClickChangeFavorite).toHaveBeenCalledTimes(1)
      expect(mockOnClick).not.toHaveBeenCalled()
    })

    it('should show filled heart icon when training is favorite', () => {
      // Arrange
      const favoriteTraining = { ...mockTrainingData, favorite: true }
      const mockOnClick = vi.fn()
      const mockOnClickChangeFavorite = vi.fn()

      // Act
      render(
        <TrainingCardComponent
          trainingData={favoriteTraining}
          type={TrainingCardComponentTypes.TRAINING}
          onClick={mockOnClick}
          onClickChangeFavorite={mockOnClickChangeFavorite}
        />
      )

      // Assert
      const favoriteIcon = screen.getByRole('button', { name: /favorite/i })
      expect(favoriteIcon).toHaveClass('pi-heart-fill')
    })
  })

  describe('NEW type', () => {
    it('should render new training card with plus icon', () => {
      // Arrange
      const newTrainingData = {
        id: 'new-training',
        title: 'VR Training',
        description: 'Create a new VR training',
        type: 'VR',
      }
      const mockOnClick = vi.fn()

      // Act
      render(
        <TrainingCardComponent
          trainingData={newTrainingData as any}
          type={TrainingCardComponentTypes.NEW}
          onClick={mockOnClick}
        />
      )

      // Assert
      expect(screen.getByText('VR Training')).toBeInTheDocument()
      expect(screen.getByText('Create a new VR training')).toBeInTheDocument()
    })

    it('should call onClick when new training card is clicked', () => {
      // Arrange
      const newTrainingData = {
        id: 'new-training',
        title: 'VR Training',
        description: 'Create a new VR training',
        type: 'VR',
      }
      const mockOnClick = vi.fn()

      // Act
      render(
        <TrainingCardComponent
          trainingData={newTrainingData as any}
          type={TrainingCardComponentTypes.NEW}
          onClick={mockOnClick}
        />
      )

      const card = screen.getByText('VR Training').closest('.p-card')
      if (card) {
        fireEvent.click(card)
      }

      // Assert
      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })
  })
})
