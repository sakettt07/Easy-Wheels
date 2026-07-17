import React from 'react'

interface TabButtonProps {
    active: boolean
    count: number
    icon: React.ReactNode
    onclick: () => void
    children: React.ReactNode
}

const TabButton = ({ active, count, icon, onclick, children }: TabButtonProps) => {
    return (
        <button
            onClick={onclick}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
                ${active
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'
                }`}
        >
            <span className={`${active ? 'text-white' : 'text-zinc-400'}`}>
                {React.cloneElement(icon as React.ReactElement, { size: 14, strokeWidth: 2 })}
            </span>
            <span>{children}</span>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none
                ${active
                    ? 'bg-white/20 text-white'
                    : count > 0
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-zinc-100 text-zinc-400'
                }`}>
                {count}
            </span>
        </button>
    )
}

export default TabButton