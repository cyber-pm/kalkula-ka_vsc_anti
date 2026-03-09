import { useState, useRef, useEffect } from 'react';
import { History, Trash2, Sun, Moon } from 'lucide-react';

interface HistoryItem {
  equation: string;
  result: string;
}

export default function App() {
  const [currentValue, setCurrentValue] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  
  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const historyEndRef = useRef<HTMLDivElement>(null);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Auto-scroll history to bottom when new items are added
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleDigit = (digit: string) => {
    if (currentValue === 'Error') {
      setCurrentValue(digit);
      setWaitingForNewValue(false);
      return;
    }
    if (waitingForNewValue) {
      setCurrentValue(digit);
      setWaitingForNewValue(false);
    } else {
      setCurrentValue(currentValue === '0' ? digit : currentValue + digit);
    }
  };

  const handleDecimal = () => {
    if (currentValue === 'Error') {
      setCurrentValue('0.');
      setWaitingForNewValue(false);
      return;
    }
    if (waitingForNewValue) {
      setCurrentValue('0.');
      setWaitingForNewValue(false);
      return;
    }
    if (!currentValue.includes('.')) {
      setCurrentValue(currentValue + '.');
    }
  };

  const handleClear = () => {
    setCurrentValue('0');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForNewValue(false);
  };

  const handleDelete = () => {
    if (waitingForNewValue || currentValue === 'Error') return;
    setCurrentValue(currentValue.length > 1 ? currentValue.slice(0, -1) : '0');
  };

  const handleToggleSign = () => {
    if (currentValue === 'Error') return;
    setCurrentValue((parseFloat(currentValue) * -1).toString());
  };

  const handlePercent = () => {
    if (currentValue === 'Error') return;
    setCurrentValue((parseFloat(currentValue) / 100).toString());
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return a / b;
      case '^': return Math.pow(a, b);
      default: return b;
    }
  };

  const handleOperator = (nextOperator: string) => {
    if (currentValue === 'Error') return;
    const inputValue = parseFloat(currentValue);

    if (previousValue == null) {
      setPreviousValue(currentValue);
    } else if (operator && !waitingForNewValue) {
      const result = calculate(parseFloat(previousValue), inputValue, operator);
      
      // Add to history
      const equation = `${previousValue} ${operator} ${inputValue} =`;
      setHistory(prev => [...prev, { equation, result: String(result) }]);
      
      setCurrentValue(String(result));
      setPreviousValue(String(result));
    }

    setOperator(nextOperator);
    setWaitingForNewValue(true);
  };

  const handleEqual = () => {
    if (!operator || previousValue == null || currentValue === 'Error') return;

    const inputValue = parseFloat(currentValue);
    const result = calculate(parseFloat(previousValue), inputValue, operator);

    // Add to history
    const equation = `${previousValue} ${operator} ${inputValue} =`;
    setHistory(prev => [...prev, { equation, result: String(result) }]);

    setCurrentValue(String(result));
    setPreviousValue(null);
    setOperator(null);
    setWaitingForNewValue(true);
  };

  const handleUnaryOperation = (op: string) => {
    if (currentValue === 'Error') return;
    const val = parseFloat(currentValue);
    let result = 0;
    let equation = '';

    switch (op) {
      case 'sin': result = Math.sin(val); equation = `sin(${val})`; break;
      case 'cos': result = Math.cos(val); equation = `cos(${val})`; break;
      case 'tan': result = Math.tan(val); equation = `tan(${val})`; break;
      case 'log': result = Math.log10(val); equation = `log(${val})`; break;
      case 'ln': result = Math.log(val); equation = `ln(${val})`; break;
      case '√': result = Math.sqrt(val); equation = `√(${val})`; break;
    }

    if (isNaN(result) || !isFinite(result)) {
      setCurrentValue('Error');
      setWaitingForNewValue(true);
      return;
    }

    // Clean up floating point errors (e.g., sin(PI) not being exactly 0)
    const cleanResult = parseFloat(result.toFixed(10));
    const resultStr = String(Object.is(cleanResult, -0) ? 0 : cleanResult);
    
    setCurrentValue(resultStr);
    setHistory(prev => [...prev, { equation: `${equation} =`, result: resultStr }]);
    setWaitingForNewValue(true);
  };

  const handleConstant = (constant: string) => {
    const val = constant === 'π' ? Math.PI : Math.E;
    setCurrentValue(String(val));
    setWaitingForNewValue(true);
  };

  const restoreHistoryItem = (result: string) => {
    if (result === 'Error') return;
    setCurrentValue(result);
    setWaitingForNewValue(true);
    if (window.innerWidth < 768) {
      setShowHistory(false);
    }
  };

  // Helper for button styling
  const btnBase = "flex items-center justify-center text-xl sm:text-2xl font-medium rounded-2xl transition-colors active:scale-95 h-12 sm:h-16 select-none";
  
  const btnNum = isDarkMode 
    ? `${btnBase} bg-zinc-800 text-white hover:bg-zinc-700`
    : `${btnBase} bg-zinc-100 text-zinc-900 hover:bg-zinc-200`;
    
  const btnOp = `${btnBase} bg-amber-500 text-white hover:bg-amber-400`;
  
  const btnOpActive = isDarkMode
    ? `${btnBase} bg-white text-amber-500`
    : `${btnBase} bg-amber-100 text-amber-600`;
    
  const btnAction = isDarkMode
    ? `${btnBase} bg-zinc-300 text-black hover:bg-zinc-200`
    : `${btnBase} bg-zinc-200 text-zinc-900 hover:bg-zinc-300`;
    
  const btnSci = isDarkMode
    ? `${btnBase} bg-zinc-700 text-zinc-200 hover:bg-zinc-600 text-lg sm:text-xl`
    : `${btnBase} bg-zinc-50 text-zinc-600 hover:bg-zinc-100 text-lg sm:text-xl`;

  const bgMain = isDarkMode ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-900";
  const bgCalc = isDarkMode ? "bg-black border-zinc-800" : "bg-white border-zinc-200 shadow-xl";
  const bgHistory = isDarkMode ? "bg-zinc-900/50 border-zinc-800/50" : "bg-white/80 border-zinc-200/80 shadow-xl";
  const textMuted = isDarkMode ? "text-zinc-500" : "text-zinc-400";
  const hoverTextMain = isDarkMode ? "hover:text-white" : "hover:text-zinc-900";
  const textHistoryItem = isDarkMode ? "text-zinc-400" : "text-zinc-500";
  const hoverHistoryItem = isDarkMode ? "hover:bg-zinc-800/80" : "hover:bg-zinc-100";
  const textHistoryResult = isDarkMode ? "text-white group-hover:text-amber-400" : "text-zinc-900 group-hover:text-amber-500";
  const displayMainText = isDarkMode ? "text-white" : "text-zinc-900";
  const bgDisplay = isDarkMode ? "bg-zinc-900/80 border-zinc-800/50" : "bg-zinc-50 border-zinc-200/50";

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 font-sans transition-colors duration-300 ${bgMain} ${isDarkMode ? 'dark-theme' : ''}`}>
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl justify-center items-stretch">
        
        {/* Calculator */}
        <div className={`w-full max-w-sm rounded-[2.5rem] p-6 border shrink-0 relative z-10 mx-auto transition-colors duration-300 flex flex-col ${bgCalc}`}>
          
          <div className="flex justify-between items-center absolute top-6 left-6 right-6">
            {/* History Toggle (Mobile) */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`md:hidden transition-colors p-2 -m-2 rounded-full ${showHistory ? 'text-amber-500 bg-amber-500/10' : `${textMuted} ${hoverTextMain} ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`}`}
            >
              <History size={24} />
            </button>
            <div className="md:hidden"></div> {/* Spacer if history is hidden on desktop */}

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`transition-colors p-2 -m-2 rounded-full ml-auto ${textMuted} ${hoverTextMain} ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`}
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>

          {/* Display */}
          <div className={`flex flex-col items-end justify-end h-32 mb-6 overflow-hidden mt-12 md:mt-8 rounded-2xl p-4 border transition-colors duration-300 ${bgDisplay}`}>
            <div className={`${textMuted} text-lg h-6 mb-1`}>
              {previousValue} {operator} {waitingForNewValue ? '' : ''}
            </div>
            <div 
              className={`${displayMainText} text-6xl font-light tracking-tight truncate w-full text-right transition-colors duration-300`}
              style={{ fontSize: currentValue.length > 8 ? '3rem' : '4rem' }}
            >
              {currentValue}
            </div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {/* Scientific Row 1 */}
            <button className={btnSci} onClick={() => handleUnaryOperation('sin')}>sin</button>
            <button className={btnSci} onClick={() => handleUnaryOperation('cos')}>cos</button>
            <button className={btnSci} onClick={() => handleUnaryOperation('tan')}>tan</button>
            <button className={btnSci} onClick={() => handleUnaryOperation('log')}>log</button>

            {/* Scientific Row 2 */}
            <button className={btnSci} onClick={() => handleUnaryOperation('ln')}>ln</button>
            <button className={btnSci} onClick={() => handleUnaryOperation('√')}>√</button>
            <button className={btnSci} onClick={() => handleConstant('π')}>π</button>
            <button 
              className={operator === '^' && waitingForNewValue ? btnOpActive : btnSci} 
              onClick={() => handleOperator('^')}
            >
              x^y
            </button>

            {/* Standard Row 1 */}
            <button className={btnAction} onClick={handleClear}>
              {currentValue === '0' && previousValue === null ? 'AC' : 'C'}
            </button>
            <button className={btnAction} onClick={handleToggleSign}>+/-</button>
            <button className={btnAction} onClick={handlePercent}>%</button>
            <button 
              className={operator === '÷' && waitingForNewValue ? btnOpActive : btnOp} 
              onClick={() => handleOperator('÷')}
            >
              ÷
            </button>

            {/* Standard Row 2 */}
            <button className={btnNum} onClick={() => handleDigit('7')}>7</button>
            <button className={btnNum} onClick={() => handleDigit('8')}>8</button>
            <button className={btnNum} onClick={() => handleDigit('9')}>9</button>
            <button 
              className={operator === '×' && waitingForNewValue ? btnOpActive : btnOp} 
              onClick={() => handleOperator('×')}
            >
              ×
            </button>

            {/* Standard Row 3 */}
            <button className={btnNum} onClick={() => handleDigit('4')}>4</button>
            <button className={btnNum} onClick={() => handleDigit('5')}>5</button>
            <button className={btnNum} onClick={() => handleDigit('6')}>6</button>
            <button 
              className={operator === '-' && waitingForNewValue ? btnOpActive : btnOp} 
              onClick={() => handleOperator('-')}
            >
              −
            </button>

            {/* Standard Row 4 */}
            <button className={btnNum} onClick={() => handleDigit('1')}>1</button>
            <button className={btnNum} onClick={() => handleDigit('2')}>2</button>
            <button className={btnNum} onClick={() => handleDigit('3')}>3</button>
            <button 
              className={operator === '+' && waitingForNewValue ? btnOpActive : btnOp} 
              onClick={() => handleOperator('+')}
            >
              +
            </button>

            {/* Standard Row 5 */}
            <button className={`${btnNum} col-span-2 !justify-start pl-8`} onClick={() => handleDigit('0')}>
              0
            </button>
            <button className={btnNum} onClick={handleDecimal}>.</button>
            <button className={btnOp} onClick={handleEqual}>=</button>
          </div>
        </div>

        {/* History Panel */}
        <div className={`w-full max-w-sm md:max-w-md rounded-[2.5rem] p-6 border flex flex-col transition-all duration-300 mx-auto md:mx-0 relative h-[500px] md:h-auto ${bgHistory} ${showHistory ? 'block' : 'hidden md:flex'}`}>
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h2 className={`text-xl font-medium flex items-center gap-2 ${displayMainText}`}>
              <History size={20} className={textMuted} />
              History
            </h2>
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className={`p-2 ${textMuted} hover:text-red-400 transition-colors rounded-full ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`}
                title="Clear History"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>

          <div className="flex-1 relative min-h-0 w-full overflow-hidden">
            <div className="absolute inset-0 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {history.length === 0 ? (
                <div className={`${textMuted} text-center mt-10 flex flex-col items-center gap-3`}>
                  <History size={32} className="opacity-20" />
                  <p>There's no history yet</p>
                </div>
              ) : (
                history.map((item, index) => (
                  <div 
                    key={index} 
                    className={`text-right group cursor-pointer p-3 rounded-2xl transition-colors ${hoverHistoryItem}`} 
                    onClick={() => restoreHistoryItem(item.result)}
                    title="Click to use this result"
                  >
                    <div className={`${textHistoryItem} text-sm mb-1`}>{item.equation}</div>
                    <div className={`text-2xl font-medium transition-colors ${textHistoryResult}`}>{item.result}</div>
                  </div>
                ))
              )}
              <div ref={historyEndRef} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
