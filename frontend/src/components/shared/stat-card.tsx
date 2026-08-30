import { cn, formatCurrency } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'purple' | 'blue' | 'green' | 'orange' | 'red';
  subtitle?: string;
}

const colorClasses = {
  purple: 'bg-purple-100 text-purple-600',
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  orange: 'bg-orange-100 text-orange-600',
  red: 'bg-red-100 text-red-600',
};

export function StatCard({ title, value, icon, color = 'purple', subtitle }: StatCardProps) {
  const displayValue = typeof value === 'number' && title.toLowerCase().includes('revenue')
    ? formatCurrency(value)
    : typeof value === 'number'
    ? value.toLocaleString('id-ID')
    : value;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{displayValue}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colorClasses[color])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
