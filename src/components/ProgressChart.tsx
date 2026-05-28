'use client'

import React, { useState } from 'react'

interface DataPoint {
  label: string
  value: number
}

interface ProgressChartProps {
  data: DataPoint[]
  title: string
  unit?: string
  color?: string
  dark?: boolean
}

export default function ProgressChart({
  data,
  title,
  unit = '',
  color = '#2563EB', // Brand blue
  dark = false,
}: ProgressChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null)

  if (data.length === 0) return null

  const width = 500
  const height = 200
  const padding = 30

  const xMin = padding
  const xMax = width - padding
  const yMin = padding
  const yMax = height - padding

  const values = data.map((d) => d.value)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const valRange = maxVal - minVal === 0 ? 1 : maxVal - minVal

  // Scale data points
  const points = data.map((d, i) => {
    const x = xMin + (i / (data.length - 1)) * (xMax - xMin)
    const y = yMax - ((d.value - minVal) / valRange) * (yMax - yMin)
    return { x, y, label: d.label, value: d.value }
  })

  // Build SVG path
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${yMax} L ${points[0].x} ${yMax} Z`

  return (
    <div className={`border rounded-3xl p-6 relative overflow-hidden group transition-all duration-300 ${
      dark
        ? 'bg-[#0f0d2e]/40 border-white/5 text-white shadow-2xl backdrop-blur-xl'
        : 'bg-white border-slate-200 text-slate-800 shadow-sm'
    }`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className={`font-display text-lg uppercase tracking-wider ${dark ? 'text-white' : 'text-primary-darker'}`}>{title}</h3>
        {hoveredPoint ? (
          <span className={`text-xs px-3 py-1 rounded-full font-bold transition ${
            dark
              ? 'bg-accent text-primary-darker'
              : 'bg-primary-darker text-accent'
          }`}>
            {hoveredPoint.label}: {hoveredPoint.value}{unit}
          </span>
        ) : (
          <span className={`text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider transition ${
            dark
              ? 'bg-white/5 text-gray-400'
              : 'bg-slate-100 text-slate-500'
          }`}>
            Hover to view
          </span>
        )}
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = yMin + ratio * (yMax - yMin)
            return (
              <line
                key={ratio}
                x1={xMin}
                y1={y}
                x2={xMax}
                y2={y}
                stroke={dark ? 'rgba(255,255,255,0.04)' : '#f1f5f9'}
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            )
          })}

          {/* Gradient Area */}
          <path d={areaPath} fill={`url(#gradient-${title.replace(/\s+/g, '-')})`} opacity="0.15" />

          {/* Line Path */}
          <path d={linePath} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />

          {/* Interactive dots */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hoveredPoint?.label === p.label ? '7' : '4'}
              fill={hoveredPoint?.label === p.label ? '#ffffff' : color}
              stroke={color}
              strokeWidth="3"
              className="transition-all duration-150 cursor-pointer"
              onMouseEnter={() => setHoveredPoint({ label: p.label, value: p.value })}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}

          {/* SVG Gradients definitions */}
          <defs>
            <linearGradient id={`gradient-${title.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className={`flex justify-between mt-4 border-t pt-3 ${dark ? 'border-white/5' : 'border-slate-100'}`}>
        <span className="text-xs text-gray-400 font-bold uppercase">{data[0].label}</span>
        <span className="text-xs text-gray-400 font-bold uppercase">{data[data.length - 1].label}</span>
      </div>
    </div>
  )
}
