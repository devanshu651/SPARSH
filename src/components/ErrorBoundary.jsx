import React from 'react'
import Button from './Button'
import Icon from './Icon'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('SPARSH Runtime Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    if (this.props.onReset) {
      this.props.onReset()
    } else {
      window.location.hash = ''
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-screen place-items-center bg-neutral-50 p-6 text-neutral-900">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-card">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-100 text-red-700">
              <Icon name="alertTriangle" className="h-6 w-6" />
            </div>

            <h1 className="mt-4 text-lg font-bold text-neutral-900">
              Something went wrong
            </h1>
            <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
              SPARSH encountered an unexpected error while rendering this view. Your saved screenings and child data remain secure on this device.
            </p>

            {this.state.error?.message && (
              <div className="mt-4 rounded-lg bg-neutral-50 p-3 text-left font-mono text-[11px] text-neutral-600 border border-neutral-200/80">
                {this.state.error.message}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2.5">
              <Button
                variant="primary"
                className="w-full"
                onClick={this.handleReset}
              >
                <Icon name="refresh" className="h-4 w-4" />
                <span>Reload Application</span>
              </Button>
            </div>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
