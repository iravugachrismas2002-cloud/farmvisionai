"use client";

import type { ReactNode } from "react";

export interface TableColumn<Row extends object> {
  header: string;
  accessor: keyof Row | ((row: Row) => unknown);
  size?: string;
  cell?: (info: { row: Row; getValue: () => string }) => ReactNode;
  className?: string;
}

function TableRow<Row extends object>({
  row,
  columns,
  rowIndex,
  onRowClick,
}: {
  row: Row;
  columns: TableColumn<Row>[];
  rowIndex: number;
  onRowClick?: (row: Row) => void;
}) {
  const handleClick = () => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onRowClick && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onRowClick(row);
    }
  };

  return (
    <tr
      key={rowIndex}
      className="hover:bg-accent transition-colors"
      onClick={onRowClick ? handleClick : undefined}
      onKeyDown={onRowClick ? handleKeyDown : undefined}
      role={onRowClick ? "button" : undefined}
      tabIndex={onRowClick ? 0 : undefined}
      aria-rowindex={rowIndex + 1}
    >
      {columns.map((column) => {
        const getValue = () => {
          const value = typeof column.accessor === "function"
            ? column.accessor(row)
            : row[column.accessor];
          return value === null || value === undefined ? "" : String(value);
        };

        return (
          <td
            key={column.header}
            className={`px-6 py-3 text-sm font-normal text-foreground align-middle ${column.className || ""}`}
          >
            {column.cell
              ? column.cell({ row, getValue })
              : getValue()}
          </td>
        );
      })}
    </tr>
  );
}

export function Table<Row extends object>({
  data,
  columns,
  loading,
  emptyState,
  error,
  onRowClick,
}: {
  data: Row[];
  columns: TableColumn<Row>[];
  loading?: boolean;
  emptyState?: ReactNode;
  error?: string;
  onRowClick?: (row: Row) => void;
}) {
  if (error) {
    return <div className="py-8 text-center text-destructive" role="alert">{error}</div>;
  }

  if (loading) {
    return (
      <div className="h-96 grid place-items-center text-muted-foreground">
        <div className="animate-pulse h-6 w-6 mr-3 border-2 border-border rounded"></div>
        Loading data...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <div>
          <svg
            className="w-12 h-12 mx-auto mb-4 opacity-50"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M20 21v-2a4 4 0 0 0-3-3.87L16.07 12l-3.2-3.86A4 4 0 0 0 12 7v5l.45 1.56c.54.66.78 1.45.78 2.06zM12 1l-4.91 4.7 4.59 2.32.65-4.59L12 1l4.91 4.7L16.73 4.06c.37-.18.54-.77.54-1.3zM4.93 21a4 4 0 0 0 .66-.07l.82-.26.01-.01a4 4 0 0 0-.67-1.41l-.83-.25a4 4 0 0 0-1.33-1.12l.74-1.83L3 11.5l1.04-4.53a4 4 0 0 0-1.23-.98l-.72-1.83a4 4 0 0 0-1.34-.66l-.83.25a4 4 0 0 0-.66 1.41l.82.25a4 4 0 0 0 .67 1.4zM7 10l5 4.99L7 14l5-4.99L7 10zM3 7v10l5-2.01L3 7zM23 7v10l-5-2.01l-5 2.01V7z" />
          </svg>
          <p>{emptyState || "No data available"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
      <div className="overflow-hidden shadow-sm rounded-lg">
        <table className="w-full rounded-lg border-collapse">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.header}
                  className={`px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider ${column.className || ""}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                row={row}
                columns={columns}
                rowIndex={rowIndex}
                onRowClick={onRowClick}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TableLoading({
  columnsCount = 3,
}: {
  columnsCount?: number;
}) {
  return (
    <div className="h-96 grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] place-items-center text-muted-foreground gap-4">
      {Array.from({ length: columnsCount }, (_, index) => (
        <div key={index}
          className="animate-pulse h-6 w-6 border-2 border-border rounded"
        />
      ))}
    </div>
  );
}

export function TableEmpty({
  title = "No data available",
  description,
}: {
  title?: string;
  description?: ReactNode;
}) {
  return (
    <div className="py-12 text-center text-muted-foreground">
      <svg
        className="w-12 h-12 mx-auto mb-4 opacity-50"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M20 21v-2a4 4 0 0 0-3-3.87L16.07 12l-3.2-3.86A4 4 0 0 0 12 7v5l.45 1.56c.54.66.78 1.45.78 2.06zM12 1l-4.91 4.7 4.59 2.32.65-4.59L12 1l4.91 4.7L16.73 4.06c.37-.18.54-.77.54-1.3zM4.93 21a4 4 0 0 0 .66-.07l.82-.26.01-.01a4 4 0 0 0-.67-1.41l-.83-.25a4 4 0 0 0-1.33-1.12l.74-1.83L3 11.5l1.04-4.53a4 4 0 0 0-1.23-.98l-.72-1.83a4 4 0 0 0-1.34-.66l-.83.25a4 4 0 0 0-.66 1.41l.82.25a4 4 0 0 0 .67 1.4zM7 10l5 4.99L7 14l5-4.99L7 10zM3 7v10l5-2.01L3 7zM23 7v10l-5-2.01l-5 2.01V7z" />
      </svg>
      <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
}
