"use client";

import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      className={`shell-breadcrumbs ${className || ""}`}
      aria-label="Breadcrumb"
    >
      <ol className="shell-breadcrumbs-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="shell-breadcrumb-item">
              {isLast ? (
                <span
                  className="shell-breadcrumb-current"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link href={item.href ?? "#"} className="shell-breadcrumb-link">
                  {item.label}
                </Link>
              )}
              {!isLast && (
                <svg
                  className="shell-breadcrumb-separator"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
