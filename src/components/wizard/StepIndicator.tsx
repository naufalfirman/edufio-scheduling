'use client';

/**
 * @file StepIndicator.tsx
 * @description Progress bar / step indicator yang ditampilkan di atas tiap layar wizard.
 * Menampilkan 4 langkah dengan garis penghubung animasi.
 */

interface StepIndicatorProps {
  currentStep: number; // 1–4
}

const STEPS = [
  { number: 1, label: 'Pendaftaran' },
  { number: 2, label: 'Pilih Tanggal' },
  { number: 3, label: 'Detail Sesi' },
  { number: 4, label: 'Ringkasan' },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full px-4 py-4">
      <div className="flex items-center justify-between relative">
        {/* Garis penghubung di belakang */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-[#E3E3E4] z-0" />
        <div
          className="absolute top-4 left-0 h-0.5 z-0 transition-all duration-500 ease-in-out"
          style={{
            width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
            background: 'var(--edufio-gradient-primary)',
          }}
        />

        {STEPS.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;

          return (
            <div key={step.number} className="flex flex-col items-center z-10">
              {/* Lingkaran step */}
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  transition-all duration-300
                  ${isCompleted
                    ? 'text-white shadow-md'
                    : isCurrent
                    ? 'text-white shadow-lg ring-4 ring-[#3BB0BF]/30'
                    : 'bg-white border-2 border-[#E3E3E4] text-[#6b7280]'
                  }
                `}
                style={
                  isCompleted || isCurrent
                    ? { background: 'var(--edufio-gradient-primary)' }
                    : {}
                }
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              {/* Label */}
              <span
                className={`mt-1.5 text-[10px] font-medium text-center leading-tight max-w-[56px]
                  ${isCurrent ? 'text-[#026C7A]' : isCompleted ? 'text-[#3BB0BF]' : 'text-[#6b7280]'}
                `}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
