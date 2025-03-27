import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SQLResult } from "../sql-service";
import { AlertTriangle, Loader2 } from "lucide-react";

interface SQLResultsProps {
  isLoading?: boolean;
  error?: string;
  results?: SQLResult[];
}

export function SQLResults({ isLoading, error, results }: SQLResultsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-gray-500">执行中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
        <AlertTriangle className="w-5 h-5 mr-2" />
        <pre className="text-sm font-mono whitespace-pre-wrap">{error}</pre>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <span className="text-sm text-gray-500">暂无结果</span>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {results.map((result, index) => (
        <div key={index} className="border rounded-lg dark:border-gray-800">
          <Table>
            <TableHeader>
              <TableRow>
                {result.columns.map((column, colIndex) => (
                  <TableHead key={colIndex}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.values.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex}>
                      {cell === null ? (
                        <span className="text-gray-400">NULL</span>
                      ) : (
                        String(cell)
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {result.values.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">
              查询已执行，但没有返回数据
            </div>
          )}
        </div>
      ))}
      <div className="text-xs text-gray-500 text-right">
        共 {results.length} 个结果集
      </div>
    </div>
  );
}
