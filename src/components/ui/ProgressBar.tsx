interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ProgressBar({
  progress,
  label,
  showPercentage = true,
  size = 'md',
  className = ''
}: ProgressBarProps) {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {showPercentage && (
            <span className="text-sm font-semibold text-primary">
              {clampedProgress.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-secondary rounded-full overflow-hidden border border-foreground/20 ${sizeClasses[size]}`}>
        <div
          className={`h-full gradient-primary transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
