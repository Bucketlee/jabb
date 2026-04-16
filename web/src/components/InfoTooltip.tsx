interface InfoTooltipProps {
  text: string;
}

export function InfoTooltip({ text }: InfoTooltipProps) {
  return (
    <span className="group relative inline-flex items-center" tabIndex={0}>
      <span
        aria-label={text}
        title={text}
        className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-default text-[13px] leading-none select-none"
      >
        ⓘ
      </span>
      <span
        role="tooltip"
        className="
          pointer-events-none
          invisible opacity-0
          group-hover:visible group-hover:opacity-100
          group-focus:visible group-focus:opacity-100
          absolute bottom-full left-0 mb-1.5 z-50
          w-max max-w-[260px]
          bg-zinc-900 dark:bg-zinc-100
          text-zinc-100 dark:text-zinc-900
          text-[11px] leading-relaxed font-normal normal-case tracking-normal
          py-1.5 px-2.5 rounded
          transition-opacity duration-150
          whitespace-normal
        "
      >
        {text}
      </span>
    </span>
  );
}
