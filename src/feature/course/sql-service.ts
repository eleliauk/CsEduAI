import initSqlJs from "sql.js";

export interface SQLResult {
  columns: string[];
  values: any[][];
}

export interface SQLResponse {
  success: boolean;
  data?: SQLResult[];
  error?: string;
}

class SQLService {
  private db: any;
  private initialized: boolean = false;

  async init() {
    if (this.initialized) return;
    
    try {
      const SQL = await initSqlJs({
        // 指定wasm文件路径，需要从node_modules复制到public目录
        locateFile: (file: string) => `/sql.js/${file}`
      });
      this.db = new SQL.Database();
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize SQL.js:", error);
      throw error;
    }
  }

  async execute(sql: string): Promise<SQLResponse> {
    if (!this.initialized) {
      await this.init();
    }

    try {
      const results = this.db.exec(sql);
      return {
        success: true,
        data: results.map((result: { columns: any; values: any; }) => ({
          columns: result.columns,
          values: result.values
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }

  // 清理数据库实例
  cleanup() {
    if (this.db) {
      this.db.close();
    }
    this.initialized = false;
  }
}

// 导出单例实例
export const sqlService = new SQLService();
