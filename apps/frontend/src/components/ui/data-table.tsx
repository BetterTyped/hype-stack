import { type MouseEvent, type ReactNode, useCallback, useMemo } from "react";

import { Checkbox } from "./checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

export type DataTableColumn<Row extends Record<string, unknown>> = {
  key: keyof Row | string;
  header?: string | ReactNode;
  render?: (row: Row) => unknown;
  width?: string; // CSS width value like "100px" or "w-[200px]"
  className?: string; // Additional Tailwind classes for the column
  headerAction?: ReactNode; // Action component to render in header (e.g. edit/delete dropdown)
};

const EMPTY_SELECTED_ROWS: string[] = [];

function DataTableHeadCell<Row extends Record<string, unknown>>({ column }: { column: DataTableColumn<Row> }) {
  const style = useMemo(() => (column.width ? { width: column.width } : undefined), [column.width]);

  return (
    <TableHead className={column.className} style={style}>
      <div className="flex items-center gap-2 justify-start group">
        <span className="w-fit">{column.header ?? String(column.key)}</span>
        {column.headerAction && (
          <div className="flex-shrink-0 group-hover:opacity-100 opacity-0 transition-opacity">
            {column.headerAction}
          </div>
        )}
      </div>
    </TableHead>
  );
}

function DataTableCell<Row extends Record<string, unknown>>({
  column,
  row,
  onRowClick,
}: {
  column: DataTableColumn<Row>;
  row: Row;
  onRowClick?: (row: Row) => void;
}) {
  const style = useMemo(() => (column.width ? { width: column.width } : undefined), [column.width]);
  const handleClick = useCallback(() => {
    onRowClick?.(row);
  }, [onRowClick, row]);
  const value = row[String(column.key)];
  const content =
    typeof column.render === "function"
      ? column.render(row)
      : typeof value === "object" && value !== null
        ? JSON.stringify(value)
        : String(value as unknown);

  return (
    <TableCell key={String(column.key)} className={column.className} style={style} onClick={handleClick}>
      {content as ReactNode}
    </TableCell>
  );
}

function DataTableRow<Row extends Record<string, unknown>>({
  row,
  rowIndex,
  columns,
  headerAction,
  onRowClick,
  selectable,
  selectedRows,
  onSelectionChange,
  getRowId,
}: {
  row: Row;
  rowIndex: number;
  columns: DataTableColumn<Row>[];
  headerAction?: ReactNode;
  onRowClick?: (row: Row) => void;
  selectable: boolean;
  selectedRows: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  getRowId?: (row: Row) => string;
}) {
  const isSelected = getRowId ? selectedRows.includes(getRowId(row)) : false;
  const toggleRowSelection = useCallback(() => {
    if (!getRowId || !onSelectionChange) return;
    const rowId = getRowId(row);
    if (selectedRows.includes(rowId)) {
      onSelectionChange(selectedRows.filter((id) => id !== rowId));
    } else {
      onSelectionChange([...selectedRows, rowId]);
    }
  }, [getRowId, onSelectionChange, row, selectedRows]);
  const handleSelectionCellClick = useCallback(
    (event: MouseEvent<HTMLTableCellElement>) => {
      event.stopPropagation();
      toggleRowSelection();
    },
    [toggleRowSelection],
  );
  const handleRowActionClick = useCallback(() => {
    onRowClick?.(row);
  }, [onRowClick, row]);

  return (
    <TableRow key={getRowId?.(row) ?? rowIndex} className={onRowClick ? "cursor-pointer hover:bg-muted/50" : undefined}>
      {selectable && (
        <TableCell className="w-[50px]" onClick={handleSelectionCellClick}>
          <Checkbox checked={isSelected} onCheckedChange={toggleRowSelection} aria-label="Select row" />
        </TableCell>
      )}
      {columns.map((column) => (
        <DataTableCell key={String(column.key)} column={column} row={row} onRowClick={onRowClick} />
      ))}
      {headerAction && <TableCell onClick={handleRowActionClick} />}
    </TableRow>
  );
}

export function DataTable<Row extends Record<string, unknown>>({
  className,
  columns,
  data,
  emptyMessage = "No data.",
  headerAction,
  onRowClick,
  selectable = false,
  selectedRows = EMPTY_SELECTED_ROWS,
  onSelectionChange,
  getRowId,
}: {
  className?: string;
  columns: DataTableColumn<Row>[];
  data: Row[];
  emptyMessage?: string;
  headerAction?: ReactNode;
  onRowClick?: (row: Row) => void;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  getRowId?: (row: Row) => string;
}) {
  const toggleAllRows = useCallback(() => {
    if (!getRowId || !onSelectionChange) return;
    if (selectedRows.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map(getRowId));
    }
  }, [data, getRowId, onSelectionChange, selectedRows.length]);

  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectedRows.length > 0 && selectedRows.length < data.length;
  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          {selectable && (
            <TableHead className="w-[50px]">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleAllRows}
                aria-label="Select all rows"
                className={someSelected ? "opacity-50" : ""}
              />
            </TableHead>
          )}
          {columns.map((column) => (
            <DataTableHeadCell key={String(column.key)} column={column} />
          ))}
          {headerAction && <TableHead className="w-[100px]">{headerAction}</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length + (headerAction ? 1 : 0) + (selectable ? 1 : 0)}
              className="h-24 text-center"
            >
              <div className="text-sm text-muted-foreground">{emptyMessage}</div>
            </TableCell>
          </TableRow>
        ) : (
          data.map((row, rowIndex) => (
            <DataTableRow
              key={getRowId?.(row) ?? rowIndex}
              row={row}
              rowIndex={rowIndex}
              columns={columns}
              headerAction={headerAction}
              onRowClick={onRowClick}
              selectable={selectable}
              selectedRows={selectedRows}
              onSelectionChange={onSelectionChange}
              getRowId={getRowId}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
}
