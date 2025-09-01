import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Header from '@/components/ui/Header'

describe('Header Component', () => {
  describe('Rendering', () => {
    it('renders the header with correct branding', () => {
      render(<Header />)
      
      expect(screen.getByText('IdeaCompass')).toBeInTheDocument()
      expect(screen.getByText('Market Research Platform')).toBeInTheDocument()
      expect(screen.getByLabelText('IdeaCompass Logo')).toBeInTheDocument()
    })

    it('renders version information', () => {
      render(<Header />)
      
      expect(screen.getByText('v1.0.0')).toBeInTheDocument()
    })

    it('renders navigation items on desktop', () => {
      render(<Header />)
      
      expect(screen.getByText('Discover')).toBeInTheDocument()
      expect(screen.getByText('Analyze')).toBeInTheDocument()
      expect(screen.getByText('Visualize')).toBeInTheDocument()
      expect(screen.getByText('Export')).toBeInTheDocument()
    })
  })

  describe('Mobile Navigation', () => {
    it('renders mobile menu button', () => {
      render(<Header />)
      
      const mobileMenuButton = screen.getByLabelText('Toggle mobile menu')
      expect(mobileMenuButton).toBeInTheDocument()
    })

    it('opens mobile menu when button is clicked', async () => {
      const user = userEvent.setup()
      render(<Header />)
      
      const mobileMenuButton = screen.getByLabelText('Toggle mobile menu')
      await user.click(mobileMenuButton)
      
      expect(screen.getByRole('navigation', { name: 'Mobile navigation' })).toBeInTheDocument()
    })

    it('toggles menu icon when opened/closed', async () => {
      const user = userEvent.setup()
      render(<Header />)
      
      const mobileMenuButton = screen.getByLabelText('Toggle mobile menu')
      
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')
      
      await user.click(mobileMenuButton)
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true')
      
      await user.click(mobileMenuButton)
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<Header />)
      
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
      expect(screen.getByLabelText('IdeaCompass Logo')).toBeInTheDocument()
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<Header />)
      
      const mobileMenuButton = screen.getByLabelText('Toggle mobile menu')
      
      // Focus and activate menu button directly
      mobileMenuButton.focus()
      await user.keyboard('{Enter}')
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('Responsive Behavior', () => {
    it('hides subtitle on small screens', () => {
      render(<Header />)
      
      const subtitle = screen.getByText('Market Research Platform')
      expect(subtitle).toHaveClass('hidden', 'sm:block')
    })
  })
})