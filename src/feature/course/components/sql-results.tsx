import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SQLResult } from "../sql-service";
import { AlertTriangle, Database, Loader2, Timer } from "lucide-react";

interface SQLResultsProps {
  isLoading?: boolean;
  error?: string;
  results?: SQLResult[];
  executionTime?: number;
}

export function SQLResults({ isLoading, error, results, executionTime }: SQLResultsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
          <span className="text-sm text-gray-500">正在执行查询...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col p-6 bg-red-50 dark:bg-red-900/20">
        <div className="flex items-center text-red-600 dark:text-red-400 mb-2">
          <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="font-medium">查询执行出错</span>
        </div>
        <pre className="text-sm font-mono text-red-600/90 dark:text-red-400/90 whitespace-pre-wrap bg-red-100/50 dark:bg-red-900/40 p-3 rounded-md">
          {error}
        </pre>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
          <Database className="w-6 h-6 text-gray-400" />
        </div>
        <span className="text-sm text-gray-500">暂无查询结果</span>
        <p className="text-xs text-gray-400 mt-1">执行查询后将在此显示结果</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-8">
      {results.map((result, index) => (
        <div key={index} className="border rounded-lg dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="p-3 border-b dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  结果集 {index + 1}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700">
                  {result.values.length} 行
                </span>
                <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700">
                  {result.columns.length} 列
                </span>
              </div>
            </div>
          </div>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {result.columns.map((column, colIndex) => (
                    <TableHead key={colIndex} className="font-semibold whitespace-nowrap">
                      {column}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.values.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex} className="font-mono whitespace-nowrap">
                        {cell === null ? (
                          <span className="text-gray-400 italic">NULL</span>
                        ) : typeof cell === 'number' ? (
                          <span className="text-blue-600 dark:text-blue-400">{cell}</span>
                        ) : (
                          String(cell)
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {result.values.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500 bg-gray-50/50 dark:bg-gray-800/50">
              查询执行成功，但未返回任何数据
            </div>
          )}
        </div>
      ))}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <div className="flex items-center gap-1">
          <span>查询完成</span>
          {executionTime && (
            <div className="flex items-center gap-1 text-gray-400">
              <Timer className="w-3 h-3" />
              <span>{executionTime.toFixed(2)} ms</span>
            </div>
          )}
        </div>
        <span>共 {results.length} 个结果集，{results.reduce((sum, r) => sum + r.values.length, 0)} 行数据</span>
      </div>
    </div>
  );
}
