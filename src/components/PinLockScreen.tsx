import React, { useState, useEffect } from 'react';
import { Lock, Unlock, ShieldCheck, KeyRound, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface PinLockScreenProps {
  storedPin: string | null;
  onUnlock: () => void;
  onSetNewPin: (pin: string) => void;
  onSkipSetup?: () => void;
  isSettingUp?: boolean;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({
  storedPin,
  onUnlock,
  onSetNewPin,
  onSkipSetup,
  isSettingUp = false,
}) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'create' | 'confirm'>(
    storedPin && !isSettingUp ? 'enter' : 'create'
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [showDigits, setShowDigits] = useState(false);

  useEffect(() => {
    if (storedPin && !isSettingUp) {
      setStep('enter');
    } else {
      setStep('create');
    }
    setPin('');
    setConfirmPin('');
    setErrorMsg('');
  }, [storedPin, isSettingUp]);

  const handleKeyPress = (digit: string) => {
    setErrorMsg('');
    if (step === 'enter') {
      if (pin.length < 4) {
        const next = pin + digit;
        setPin(next);
        if (next.length === 4) {
          if (next === storedPin) {
            onUnlock();
          } else {
            setTimeout(() => {
              setErrorMsg('Incorrect PIN. Please try again.');
              setPin('');
            }, 150);
          }
        }
      }
    } else if (step === 'create') {
      if (pin.length < 4) {
        const next = pin + digit;
        setPin(next);
        if (next.length === 4) {
          setTimeout(() => {
            setStep('confirm');
          }, 200);
        }
      }
    } else if (step === 'confirm') {
      if (confirmPin.length < 4) {
        const next = confirmPin + digit;
        setConfirmPin(next);
        if (next.length === 4) {
          if (next === pin) {
            onSetNewPin(pin);
          } else {
            setTimeout(() => {
              setErrorMsg('PINs do not match. Start over.');
              setPin('');
              setConfirmPin('');
              setStep('create');
            }, 200);
          }
        }
      }
    }
  };

  const handleDelete = () => {
    setErrorMsg('');
    if (step === 'confirm') {
      setConfirmPin(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
  };

  const activePinLength = step === 'confirm' ? confirmPin.length : pin.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4 animate-in fade-in duration-200 text-slate-900">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xs w-full shadow-2xl space-y-6 text-center border border-slate-200/80">
        
        {/* Brand Icon Header */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
            <Lock className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {step === 'enter'
                ? 'SpendCraft Private Vault'
                : step === 'create'
                ? 'Set 4-Digit Security PIN'
                : 'Confirm Security PIN'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {step === 'enter'
                ? 'Enter your private passcode to unlock'
                : step === 'create'
                ? 'Protects your budget & expenses on this device'
                : 'Re-enter your 4-digit PIN'}
            </p>
          </div>
        </div>

        {/* 4 PIN Dots Indicator */}
        <div className="flex items-center justify-center gap-4 py-2">
          {[0, 1, 2, 3].map(idx => {
            const isFilled = idx < activePinLength;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-slate-900 scale-110 shadow-xs'
                    : 'bg-slate-200 border border-slate-300'
                }`}
              />
            );
          })}
        </div>

        {/* Error message banner */}
        {errorMsg && (
          <div className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 animate-shake">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Numpad Keypad (Mobile-Friendly 3x4 Grid) */}
        <div className="grid grid-cols-3 gap-2.5 pt-2 max-w-[240px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="h-13 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-xl font-bold font-mono text-slate-800 transition-all flex items-center justify-center border border-slate-200/80 shadow-2xs"
            >
              {num}
            </button>
          ))}
          
          {/* Toggle visibility */}
          <button
            type="button"
            onClick={() => setShowDigits(!showDigits)}
            className="h-13 rounded-2xl text-slate-400 hover:text-slate-600 active:scale-95 flex items-center justify-center transition-all"
            title="Toggle visibility"
          >
            {showDigits ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>

          {/* 0 digit */}
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-13 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-xl font-bold font-mono text-slate-800 transition-all flex items-center justify-center border border-slate-200/80 shadow-2xs"
          >
            0
          </button>

          {/* Backspace / Delete */}
          <button
            type="button"
            onClick={handleDelete}
            className="h-13 rounded-2xl text-slate-500 hover:text-rose-600 active:scale-95 font-semibold text-xs transition-all flex items-center justify-center"
          >
            Delete
          </button>
        </div>

        {/* Optional Skip when first setting up */}
        {isSettingUp && onSkipSetup && (
          <button
            type="button"
            onClick={onSkipSetup}
            className="text-xs text-slate-400 hover:text-slate-600 underline font-medium pt-1"
          >
            Skip for now (No PIN lock)
          </button>
        )}

      </div>
    </div>
  );
};

export default PinLockScreen;
