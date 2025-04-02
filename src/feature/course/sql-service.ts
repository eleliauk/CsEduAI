import initSqlJs from "sql.js";

export interface SQLResult {
  columns: string[];
  values: any[][];
}

export interface SQLResponse {
  success: boolean;
  data?: SQLResult[];
  error?: string;
  executionTime?: number; // in milliseconds
}

export interface JoinExample {
  title: string;
  sql: string;
}

class SQLService {
  private db: any;
  private initialized: boolean = false;
  private sampleDataInitialized: boolean = false;

  // 提供公共访问方法
  isSampleDataInitialized(): boolean {
    return this.sampleDataInitialized;
  }

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
      const startTime = performance.now();
      const results = this.db.exec(sql);
      const executionTime = performance.now() - startTime;
      return {
        success: true,
        data: results.map((result: { columns: any; values: any; }) => ({
          columns: result.columns,
          values: result.values
        })),
        executionTime
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
    this.sampleDataInitialized = false;
  }

  // 初始化示例数据表
  async initSampleData() {
    if (this.sampleDataInitialized) return;
    
    await this.init();
    
    try {
      this.db.exec(`
        -- 创建示例表
        CREATE TABLE IF NOT EXISTS students (id INTEGER PRIMARY KEY, name TEXT, class_id INTEGER);
        CREATE TABLE IF NOT EXISTS classes (id INTEGER PRIMARY KEY, name TEXT);
        CREATE TABLE IF NOT EXISTS scores (student_id INTEGER, course TEXT, score INTEGER);
        
        -- 清空原有数据
        DELETE FROM students;
        DELETE FROM classes;
        DELETE FROM scores;
        
        -- 插入示例数据
        INSERT INTO students VALUES 
  (1, '张三', 1), (2, '李四', 1), (3, '王五', 2), (4, '赵六', 2), (5, '孙七', 3), 
  (6, '周八', 3), (7, '吴九', 4), (8, '郑十', 4), (9, '王一', 5), (10, '李二', 5),
  (11, '陈三', 6), (12, '黄四', 6), (13, '徐五', 7), (14, '何六', 7), (15, '邹七', 8),
  (16, '彭八', 8), (17, '宋九', 9), (18, '唐十', 9), (19, '秦一', 10), (20, '尤二', 10),
  (21, '许三', 11), (22, '韩四', 11), (23, '杨五', 12), (24, '傅六', 12), (25, '鲁七', 13),
  (26, '龚八', 13), (27, '邱九', 14), (28, '冯十', 14), (29, '侯一', 15), (30, '朱二', 15),
  (31, '戴三', 16), (32, '夏四', 16), (33, '钟五', 17), (34, '董六', 17), (35, '冉七', 18),
  (36, '毛八', 18), (37, '徐九', 19), (38, '顾十', 19), (39, '程一', 20), (40, '袁二', 20);

INSERT INTO classes VALUES 
  (1, '一班'), (2, '二班'), (3, '三班'), (4, '四班'), (5, '五班'),
  (6, '六班'), (7, '七班'), (8, '八班'), (9, '九班'), (10, '十班'),
  (11, '十一班'), (12, '十二班'), (13, '十三班'), (14, '十四班'), (15, '十五班'),
  (16, '十六班'), (17, '十七班'), (18, '十八班'), (19, '十九班'), (20, '二十班');

INSERT INTO scores VALUES 
  (1, '数学', 90), (1, '语文', 85), (2, '数学', 75), (3, '语文', 88), 
  (4, '数学', 92), (5, '语文', 80), (6, '数学', 78), (7, '语文', 85),
  (8, '数学', 81), (9, '语文', 90), (10, '数学', 86), (11, '语文', 77),
  (12, '数学', 84), (13, '语文', 79), (14, '数学', 91), (15, '语文', 83),
  (16, '数学', 76), (17, '语文', 88), (18, '数学', 82), (19, '语文', 89),
  (20, '数学', 87), (21, '语文', 90), (22, '数学', 85), (23, '语文', 92),
  (24, '数学', 80), (25, '语文', 84), (26, '数学', 89), (27, '语文', 77),
  (28, '数学', 90), (29, '语文', 81), (30, '数学', 83), (31, '语文', 79),
  (32, '数学', 92), (33, '语文', 88), (34, '数学', 86), (35, '语文', 85),
  (36, '数学', 79), (37, '语文', 82), (38, '数学', 84), (39, '语文', 80),
  (40, '数学', 90);

      `);
      
      this.sampleDataInitialized = true;
    } catch (error) {
      console.error("Failed to initialize sample data:", error);
      throw error;
    }
  }

  // 获取多表查询示例
  getJoinExamples(): JoinExample[] {
    return [
      {
        title: "INNER JOIN - 学生和班级信息（未优化）",
        sql: `SELECT s.name AS student_name, c.name AS class_name 
              FROM students s 
              INNER JOIN classes c ON s.class_id = c.id`
      },
      {
        title: "INNER JOIN - 学生和班级信息（优化版）",
        sql: `SELECT s.name AS student_name, c.name AS class_name 
              FROM students s 
              INNER JOIN classes c ON s.class_id = c.id
              WHERE s.class_id IS NOT NULL`
      },
      {
        title: "LEFT JOIN - 所有学生成绩（未优化）",
        sql: `SELECT s.name AS student_name, sc.course, sc.score 
              FROM students s 
              LEFT JOIN scores sc ON s.id = sc.student_id`
      },
      {
        title: "LEFT JOIN - 所有学生成绩（优化版）",
        sql: `SELECT s.name AS student_name, sc.course, sc.score 
              FROM students s 
              LEFT JOIN scores sc ON s.id = sc.student_id
              WHERE sc.student_id IS NOT NULL`
      },
      {
        title: "多表连接 - 学生班级和成绩（未优化）",
        sql: `SELECT s.name AS student_name, c.name AS class_name, 
                     sc.course, sc.score
              FROM students s
              JOIN classes c ON s.class_id = c.id
              LEFT JOIN scores sc ON s.id = sc.student_id`
      },
      {
        title: "多表连接 - 学生班级和成绩（优化版）",
        sql: `SELECT s.name AS student_name, c.name AS class_name, 
                     sc.course, sc.score
              FROM students s
              JOIN classes c ON s.class_id = c.id
              LEFT JOIN scores sc ON s.id = sc.student_id
              WHERE sc.student_id IS NOT NULL`
      }
    ];
}
  }

// 导出单例实例
export const sqlService = new SQLService();
