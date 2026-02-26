'use client'

const DISPLAY = "'Barlow Condensed', Impact, 'Arial Narrow', sans-serif"

interface CategorySectionProps {
  label: string
  children: React.ReactNode
  isComplete: boolean
}

export default function CategorySection({
  label,
  children,
  isComplete,
}: CategorySectionProps) {
  return (
    <section className="mb-8">
      <div className="bg-accent px-6 py-3 flex items-center justify-between">
        <p style={{
          fontFamily: DISPLAY,
          fontWeight: 900,
          fontStyle: 'italic',
          fontSize: '22px',
          textTransform: 'uppercase',
          letterSpacing: '-0.01em',
          lineHeight: 1,
          color: '#FFFFFF',
          margin: 0,
        }}>
          ◆&nbsp;{label}
        </p>
        {isComplete && (
          <span className="text-xs font-bold text-white/80 uppercase tracking-widest">
            ✓ Selected
          </span>
        )}
      </div>
      <div className="space-y-3 pt-3">{children}</div>
    </section>
  )
}
