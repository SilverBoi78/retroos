import { Component } from 'react'
import './ErrorBoundary.css'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__icon">✕</div>
          <div className="error-boundary__title">This program has performed an illegal operation.</div>
          <div className="error-boundary__message">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </div>
          <button className="error-boundary__btn" onClick={this.handleReset}>
            Restart
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
