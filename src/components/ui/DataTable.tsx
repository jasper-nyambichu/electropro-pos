export interface Column<T> {
  header: string;
  align?: "left" | "center" | "right";
  width?: string;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
}

const alignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export default function DataTable<T>({ columns, rows, rowKey }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#F4F4F4]">
            {columns.map((col, i) => (
              <th
                key={i}
                className={`px-4 py-3 font-bold text-body-reg border-b border-[#EEEEEE] ${
                  alignClass[col.align ?? "left"]
                }`}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-body-reg divide-y divide-[#EEEEEE]">
          {rows.map((row, i) => (
            <tr
              key={rowKey(row)}
              className={`${
                i % 2 === 0 ? "bg-white" : "bg-[#F9F9F9]"
              } hover:bg-[#F0F0F0] transition-colors`}
            >
              {columns.map((col, j) => (
                <td
                  key={j}
                  className={`px-4 py-3 ${alignClass[col.align ?? "left"]}`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}