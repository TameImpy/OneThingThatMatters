'use client'

interface CategorySectionProps {
  label: string
  icon: string
  children: React.ReactNode
  isComplete: boolean
}

export default function CategorySection({
  label,
  icon,
  children,
  isComplete,
}: CategorySectionProps) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-cyan-400 text-sm font-mono">{icon}</span>
        <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">{label}</h2>
        {isComplete && (
          <span className="ml-auto rounded-full bg-cyan-400/10 px-2 py-0.5 text-xs text-cyan-400">
            ✓ selected
          </span>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
