import { render, screen } from '@testing-library/react'
import StepProgress from '@/components/ui/StepProgress'
import { StepNumber } from '@/types'

describe('StepProgress Component', () => {
  describe('Rendering', () => {
    it('renders all steps', () => {
      render(<StepProgress currentStep={1} />)
      
      expect(screen.getByText('Research Setup')).toBeInTheDocument()
      expect(screen.getByText('Subreddit Selection')).toBeInTheDocument()
      expect(screen.getByText('Data Scraping')).toBeInTheDocument()
      expect(screen.getByText('AI Analysis')).toBeInTheDocument()
      expect(screen.getByText('Report Generation')).toBeInTheDocument()
    })

    it('renders step descriptions', () => {
      render(<StepProgress currentStep={1} />)
      
      expect(screen.getByText('Keywords & Filters')).toBeInTheDocument()
      expect(screen.getByText('Choose Communities')).toBeInTheDocument()
      expect(screen.getByText('Collect Posts')).toBeInTheDocument()
      expect(screen.getByText('Business Opportunities')).toBeInTheDocument()
      expect(screen.getByText('Final Insights')).toBeInTheDocument()
    })
  })

  describe('Step States', () => {
    it('correctly shows completed steps', () => {
      render(<StepProgress currentStep={3} />)
      
      // Steps 1 and 2 should be completed
      const completedSteps = screen.getAllByLabelText(/Completed/)
      expect(completedSteps).toHaveLength(2)
    })

    it('correctly shows current step', () => {
      render(<StepProgress currentStep={3} />)
      
      const currentStep = screen.getByLabelText(/Current step/)
      expect(currentStep).toBeInTheDocument()
    })

    it('correctly shows upcoming steps', () => {
      render(<StepProgress currentStep={3} />)
      
      const upcomingSteps = screen.getAllByLabelText(/Upcoming/)
      expect(upcomingSteps).toHaveLength(2) // Steps 4, 5
    })
  })

  describe('Progress Bar', () => {
    it('shows correct progress percentage for step 1', () => {
      render(<StepProgress currentStep={1} />)
      
      const progressBar = screen.getByText('20% Complete')
      expect(progressBar).toBeInTheDocument()
    })

    it('shows correct progress percentage for step 3', () => {
      render(<StepProgress currentStep={3} />)
      
      const progressBar = screen.getByText('60% Complete')
      expect(progressBar).toBeInTheDocument()
    })

    it('shows correct progress percentage for final step', () => {
      render(<StepProgress currentStep={5} />)
      
      const progressBar = screen.getByText('100% Complete')
      expect(progressBar).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper progressbar role and attributes', () => {
      render(<StepProgress currentStep={3} />)
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '3')
      expect(progressBar).toHaveAttribute('aria-valuemin', '1')
      expect(progressBar).toHaveAttribute('aria-valuemax', '5')
    })

    it('has descriptive aria-label for progress', () => {
      render(<StepProgress currentStep={3} />)
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-label', 'Step 3 of 5: Data Scraping')
    })

    it('has proper button roles for interactive elements', () => {
      render(<StepProgress currentStep={3} />)
      
      const stepButtons = screen.getAllByRole('button')
      expect(stepButtons.length).toBeGreaterThan(0)
      
      stepButtons.forEach(button => {
        expect(button).toHaveAttribute('tabIndex')
      })
    })

    it('sets correct tabIndex for accessible and non-accessible steps', () => {
      render(<StepProgress currentStep={3} />)
      
      const stepButtons = screen.getAllByRole('button')
      
      // Steps 1, 2, 3 should be accessible (tabIndex 0)
      // Steps 4, 5 should not be accessible (tabIndex -1)
      const accessibleSteps = stepButtons.filter(btn => btn.getAttribute('tabIndex') === '0')
      const inaccessibleSteps = stepButtons.filter(btn => btn.getAttribute('tabIndex') === '-1')
      
      expect(accessibleSteps).toHaveLength(3)
      expect(inaccessibleSteps).toHaveLength(2)
    })
  })

  describe('Mobile Responsiveness', () => {
    it('shows mobile progress information', () => {
      render(<StepProgress currentStep={3} />)
      
      expect(screen.getByText('Step 3 of 5')).toBeInTheDocument()
      expect(screen.getByText('60% Complete')).toBeInTheDocument()
    })

    it('shows current step title and description on mobile', () => {
      render(<StepProgress currentStep={3} />)
      
      // Mobile view should show current step details - allowing for multiple matches
      const stepTitles = screen.getAllByText('Data Scraping')
      expect(stepTitles.length).toBeGreaterThan(0)
      
      const stepDescriptions = screen.getAllByText('Collect Posts')
      expect(stepDescriptions.length).toBeGreaterThan(0)
    })

    it('shows horizontal scroll steps overview on mobile', () => {
      render(<StepProgress currentStep={3} />)
      
      // Mobile view should show short titles in horizontal scroll
      expect(screen.getByText('Setup')).toBeInTheDocument()
      expect(screen.getByText('Select')).toBeInTheDocument()
      expect(screen.getByText('Collect')).toBeInTheDocument()
      expect(screen.getByText('Analyze')).toBeInTheDocument()
      expect(screen.getByText('Report')).toBeInTheDocument()
    })
  })

  describe('Visual States', () => {
    it('applies correct CSS classes for completed steps', () => {
      render(<StepProgress currentStep={3} />)
      
      const step1Button = screen.getByLabelText('Research Setup: Completed')
      expect(step1Button).toHaveClass('bg-primary-600', 'border-primary-600', 'text-white')
    })

    it('applies correct CSS classes for current step', () => {
      render(<StepProgress currentStep={3} />)
      
      const currentStepButton = screen.getByLabelText('Data Scraping: Current step')
      expect(currentStepButton).toHaveClass('bg-white', 'border-primary-600', 'text-primary-600')
    })

    it('shows pulse indicator for current step', () => {
      render(<StepProgress currentStep={3} />)
      
      // Current step should have a pulse indicator
      const pulseIndicator = document.querySelector('.animate-pulse')
      expect(pulseIndicator).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles first step correctly', () => {
      render(<StepProgress currentStep={1} />)
      
      const currentStep = screen.getByLabelText(/Current step/)
      expect(currentStep).toBeInTheDocument()
      
      const completedSteps = screen.queryAllByLabelText(/Completed/)
      expect(completedSteps).toHaveLength(0)
    })

    it('handles last step correctly', () => {
      render(<StepProgress currentStep={5} />)
      
      const currentStep = screen.getByLabelText(/Current step/)
      expect(currentStep).toBeInTheDocument()
      
      const completedSteps = screen.getAllByLabelText(/Completed/)
      expect(completedSteps).toHaveLength(4)
      
      const upcomingSteps = screen.queryAllByLabelText(/Upcoming/)
      expect(upcomingSteps).toHaveLength(0)
    })
  })
})