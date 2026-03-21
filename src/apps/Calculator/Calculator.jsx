import { useState, useEffect, useRef } from 'react'
import './Calculator.css'

export default function Calculator() {
  const containerRef = useRef(null)
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState(null)
  const [operator, setOperator] = useState(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  function inputDigit(digit) {
    if (waitingForOperand) {
      setDisplay(String(digit))
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit)
    }
  }

  function inputDecimal() {
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
      return
    }
    if (!display.includes('.')) {
      setDisplay(display + '.')
    }
  }

  function clear() {
    setDisplay('0')
    setPreviousValue(null)
    setOperator(null)
    setWaitingForOperand(false)
  }

  function toggleSign() {
    const val = parseFloat(display)
    if (val !== 0) {
      setDisplay(String(-val))
    }
  }

  function percentage() {
    setDisplay(String(parseFloat(display) / 100))
  }

  function calculate(left, right, op) {
    switch (op) {
      case '+': return left + right
      case '-': return left - right
      case '×': return left * right
      case '÷': return right === 0 ? 'Error' : left / right
      default: return right
    }
  }

  function inputOperator(nextOp) {
    const current = parseFloat(display)

    if (previousValue !== null && operator && !waitingForOperand) {
      const result = calculate(previousValue, current, operator)
      const resultStr = String(result)
      setDisplay(resultStr)
      setPreviousValue(result === 'Error' ? null : result)
    } else {
      setPreviousValue(current)
    }

    setOperator(nextOp)
    setWaitingForOperand(true)
  }

  function evaluate() {
    if (previousValue === null || operator === null) return

    const current = parseFloat(display)
    const result = calculate(previousValue, current, operator)
    setDisplay(String(result))
    setPreviousValue(null)
    setOperator(null)
    setWaitingForOperand(true)
  }

  useEffect(() => {
    const el = containerRef.current
    if (el) el.focus()
  }, [])

  function handleKeyDown(e) {
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault()
      inputDigit(parseInt(e.key))
    } else if (e.key === '+') {
      e.preventDefault()
      inputOperator('+')
    } else if (e.key === '-') {
      e.preventDefault()
      inputOperator('-')
    } else if (e.key === '*') {
      e.preventDefault()
      inputOperator('×')
    } else if (e.key === '/') {
      e.preventDefault()
      inputOperator('÷')
    } else if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault()
      evaluate()
    } else if (e.key === 'Escape' || e.key === 'Delete') {
      e.preventDefault()
      clear()
    } else if (e.key === '.') {
      e.preventDefault()
      inputDecimal()
    } else if (e.key === 'Backspace') {
      e.preventDefault()
      if (display.length > 1) {
        setDisplay(display.slice(0, -1))
      } else {
        setDisplay('0')
      }
    } else if (e.key === '%') {
      e.preventDefault()
      percentage()
    }
  }

  const buttons = [
    { label: 'C', type: 'function', action: clear },
    { label: '+/-', type: 'function', action: toggleSign },
    { label: '%', type: 'function', action: percentage },
    { label: '÷', type: 'operator', action: () => inputOperator('÷') },
    { label: '7', type: 'number', action: () => inputDigit(7) },
    { label: '8', type: 'number', action: () => inputDigit(8) },
    { label: '9', type: 'number', action: () => inputDigit(9) },
    { label: '×', type: 'operator', action: () => inputOperator('×') },
    { label: '4', type: 'number', action: () => inputDigit(4) },
    { label: '5', type: 'number', action: () => inputDigit(5) },
    { label: '6', type: 'number', action: () => inputDigit(6) },
    { label: '-', type: 'operator', action: () => inputOperator('-') },
    { label: '1', type: 'number', action: () => inputDigit(1) },
    { label: '2', type: 'number', action: () => inputDigit(2) },
    { label: '3', type: 'number', action: () => inputDigit(3) },
    { label: '+', type: 'operator', action: () => inputOperator('+') },
    { label: '0', type: 'number', wide: true, action: () => inputDigit(0) },
    { label: '.', type: 'number', action: inputDecimal },
    { label: '=', type: 'equals', action: evaluate },
  ]

  const displayFontSize = display.length > 12 ? '1.4rem' : display.length > 8 ? '1.8rem' : '2.4rem'

  return (
    <div className="calculator" ref={containerRef} tabIndex={0} onKeyDown={handleKeyDown}>
      <div className="calculator__display" style={{ fontSize: displayFontSize }}>
        <span className="calculator__display-text">{display}</span>
      </div>
      <div className="calculator__buttons">
        {buttons.map((btn) => (
          <button
            key={btn.label}
            className={`calculator__btn calculator__btn--${btn.type}${btn.wide ? ' calculator__btn--wide' : ''}`}
            onClick={btn.action}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}
