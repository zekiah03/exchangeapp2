import { Component, type ReactNode } from 'react'

type State = { error: Error | null }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-rose-50 px-4 py-8">
          <div className="mx-auto max-w-2xl rounded-2xl border border-rose-300 bg-white p-6 shadow">
            <h1 className="text-lg font-semibold text-rose-800">
              アプリでエラーが発生しました
            </h1>
            <p className="mt-2 text-sm text-slate-700">
              下の内容を控えて、再読み込みしてください。
            </p>
            <pre className="mt-4 overflow-x-auto rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
              {this.state.error.message}
              {this.state.error.stack ? `\n\n${this.state.error.stack}` : ''}
            </pre>
            <button
              type="button"
              onClick={this.handleReset}
              className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500"
            >
              もう一度試す
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
