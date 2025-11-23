import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { DashboardPage } from './dashboard.page'
import TrainingService from '../../services/training/training.service'

// Mock TrainingService
vi.mock('../../services/training/training.service')

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('DashboardPage', () => {
  const mockTrainings = [
    {
      id: '1',
      title: 'VR Training 1',
      description: 'Description 1',
      type: 'DRAFT',
      published: false,
      favorite: false,
      trainingValue: 0,
      trainingSections: [],
    },
    {
      id: '2',
      title: 'Published Training',
      description: 'Description 2',
      type: 'VR',
      published: true,
      favorite: true,
      trainingValue: 0,
      trainingSections: [],
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    // @ts-ignore
    TrainingService.getTrainings = vi.fn().mockResolvedValue({ data: mockTrainings })
  })

  it('should render dashboard with sections', async () => {
    // Act
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    )

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Create new')).toBeInTheDocument()
      expect(screen.getByText('Favorites')).toBeInTheDocument()
      expect(screen.getByText('Drafts')).toBeInTheDocument()
    })
  })

  it('should display loading spinner while fetching trainings', () => {
    // Arrange
    // @ts-ignore
    TrainingService.getTrainings = vi.fn().mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    // Act
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    )

    // Assert
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should display error message when fetching trainings fails', async () => {
    // Arrange
    // @ts-ignore
    TrainingService.getTrainings = vi.fn().mockRejectedValue(new Error('Network error'))

    // Act
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    )

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Failed to load trainings/i)).toBeInTheDocument()
    })
  })

  it('should filter trainings by search term', async () => {
    // Arrange
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('VR Training 1')).toBeInTheDocument()
    })

    // Act
    const searchInput = screen.getByPlaceholderText('Search...')
    fireEvent.change(searchInput, { target: { value: 'Published' } })

    // Assert
    await waitFor(() => {
      expect(screen.queryByText('VR Training 1')).not.toBeInTheDocument()
      expect(screen.getByText('Published Training')).toBeInTheDocument()
    })
  })

  it('should display favorites section with favorite trainings', async () => {
    // Act
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    )

    // Assert
    await waitFor(() => {
      const favoritesSection = screen.getByText('Favorites').closest('div')
      expect(favoritesSection).toBeInTheDocument()
      expect(screen.getByText('Published Training')).toBeInTheDocument()
    })
  })

  it('should display drafts section with draft trainings', async () => {
    // Act
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    )

    // Assert
    await waitFor(() => {
      const draftsSection = screen.getByText('Drafts').closest('div')
      expect(draftsSection).toBeInTheDocument()
      expect(screen.getByText('VR Training 1')).toBeInTheDocument()
    })
  })

  it('should display empty state when no favorites exist', async () => {
    // Arrange
    const trainingsWithoutFavorites = mockTrainings.map(t => ({ ...t, favorite: false }))
    // @ts-ignore
    TrainingService.getTrainings = vi.fn().mockResolvedValue({ data: trainingsWithoutFavorites })

    // Act
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    )

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/don't like anyone yet/i)).toBeInTheDocument()
    })
  })

  it('should navigate to new training page when clicking new training card', async () => {
    // Act
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('VR Training')).toBeInTheDocument()
    })

    const vrTrainingCard = screen.getByText('VR Training').closest('.p-card')
    if (vrTrainingCard) {
      fireEvent.click(vrTrainingCard)
    }

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('/trainings/new'))
  })
})
