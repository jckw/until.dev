import { cn } from "@/utils"

export const Card = ({
  icon,
  title,
  value,
  caption,
  className,
  children,
}: {
  icon: React.ReactNode
  title: string
  value: number | string
  caption: string
  className?: string
  children?: React.ReactNode
}) => (
  <div
    className={cn(
      "border border-gray-200 rounded-sm p-5 flex flex-col gap-3 justify-between",
      className
    )}
  >
    <div className="flex gap-3 items-center">
      {icon}
      <div className="font-medium text-gray-950 whitespace-nowrap">{title}</div>
    </div>
    <div>
      <div className="text-xl">{value}</div>
      <div className="text-gray-800 text-sm">{caption}</div>
    </div>
    {children}
  </div>
)
