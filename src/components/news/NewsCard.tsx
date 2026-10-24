import clsx from 'clsx';
import { Clock3 } from 'lucide-react';
import { DemoDataBadge } from '@/components/ui/DemoDataBadge';
import { timeAgo } from '@/utils/format';
import { DEMO_NOW } from '@/utils/date';
import type { NewsItem } from '@/types';

interface NewsCardProps {
  item: NewsItem;
  onOpen: (item: NewsItem) => void;
  compact?: boolean;
  className?: string;
}

export function NewsCard({ item, onOpen, compact = false, className }: NewsCardProps) {
  return (
    <article className={clsx('group min-w-0', className)}>
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="block w-full text-left focus-visible:outline-offset-4"
        aria-label={`Open demo article: ${item.title}`}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="fs-chip h-5 px-1.5 text-[10px]">{item.category}</span>
          <DemoDataBadge className="h-5 px-1.5 text-[10px]" />
          <span className="inline-flex items-center gap-1 text-2xs text-subtle">
            <Clock3 size={10} />
            {timeAgo(item.publishedAt, DEMO_NOW)}
          </span>
        </div>
        <h3
          className={clsx(
            'mt-1.5 font-semibold leading-snug text-fg transition-colors group-hover:text-accent',
            compact ? 'line-clamp-2 text-sm' : 'text-[15px]',
          )}
        >
          {item.title}
        </h3>
        {!compact ? <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{item.summary}</p> : null}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-2xs text-subtle">
          <span>{item.source}</span>
          <span aria-hidden>·</span>
          <span>{item.readTimeMin} min read</span>
          {item.symbols.length > 0 ? (
            <>
              <span aria-hidden>·</span>
              <span className="fs-num text-muted">{item.symbols.slice(0, 3).join(' · ')}</span>
            </>
          ) : null}
        </div>
      </button>
    </article>
  );
}
