import React from 'react';

interface MiniChartProps {
  data: number[];
  type?: 'line' | 'bar';
  color?: string;
  height?: number;
  width?: number;
  animated?: boolean;
}

export const MiniChart: React.FC<MiniChartProps> = ({
  data,
  type = 'line',
  color = '#EF4444', // Red-500 default
  height = 50,
  width = 120,
  animated = true
}) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min === 0 ? 1 : max - min;

  // Normalized points (x, y)
  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    // Invert y since SVG (0,0) is top-left
    const y = height - ((val - min) / range) * (height - 6) - 3;
    return { x, y };
  });

  if (type === 'bar') {
    const barWidth = (width / data.length) * 0.7;
    const spacing = (width / data.length) * 0.3;

    return (
      <svg height={height} width={width} className="overflow-visible">
        {data.map((val, index) => {
          const barHeight = ((val - min) / range) * (height - 6) + 3;
          const x = index * (barWidth + spacing) + spacing / 2;
          const y = height - barHeight;

          return (
            <rect
              key={index}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={color}
              rx={1.5}
              className={animated ? 'origin-bottom scale-y-0 animate-[grow-y_0.6s_ease-out_forwards]' : ''}
              style={{ animationDelay: `${index * 50}ms` }}
            />
          );
        })}
      </svg>
    );
  }

  // Generate SVG path description for line chart
  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Generate path description for closed gradient area
  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  // Glow filter and linear gradient unique IDs
  const gradientId = `chart-grad-${Math.random().toString(36).substring(2, 7)}`;
  const filterId = `chart-glow-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <svg height={height} width={width} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor={color} floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Area under the line */}
      <path d={areaD} fill={`url(#${gradientId})`} />

      {/* Glow path */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${filterId})`}
        className={animated ? 'animate-[dash_1.5s_ease-in-out_forwards]' : ''}
        style={{
          strokeDasharray: 500,
          strokeDashoffset: animated ? 500 : 0
        }}
      />
    </svg>
  );
};

export default MiniChart;
