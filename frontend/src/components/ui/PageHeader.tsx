interface Props {
  title:      string
  subtitle?:  string
  action?:    React.ReactNode
}
 
export function PageHeader({ title, subtitle, action }: Props) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-gray-400 mt-1 text-sm">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}