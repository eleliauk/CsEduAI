import { create } from "zustand";
import { persist } from "zustand/middleware";

// 定义课程类型
export interface CourseDetail {
  id: number;
  cover: string;
  created_at: number;
  description: string;
  studied: boolean;
  studied_by: number;
  studied_duration: number;
  tag: string;
  title: string;
  updated_at: number;
}

// 定义章节类型
export interface Section {
  id: number;
  created_at: number;
  updated_at: number;
  title: string;
  description?: string;
  studied_duration: number;
  duration: number;
  content?: string;
  video_url?: string;
}

// 定义学习进度类型
interface StudyProgress {
  courseId: number;
  sectionId: number;
  progress: number;
  lastStudyTime: number;
  completed: boolean;
}

// 定义练习类型
interface Exercise {
  created_at: number;
  description: string;
  id: number;
  title: string;
  updated_at: number;
}

// 定义Store的状态类型
interface StudentCourseStore {
  // 课程列表
  courses: CourseDetail[];
  // 当前选中的课程
  currentCourse: CourseDetail | null;
  // 当前课程的所有章节
  sections: Section[];
  // 当前选中的章节
  currentSection: Section | null;
  //练习列表
  exercises: Exercise[];
  // 当前选中的练习
  currentExercise: Exercise | null;
  // 学习进度记录
  studyProgress: StudyProgress[];
  // 搜索和筛选状态
  searchQuery: string;
  selectedCategory: string | null;
  pageIndex: number;
  pageSize: number;
  totalCourses: number;

  // 课程相关操作
  setCourses: (courses: CourseDetail[]) => void;
  setCurrentCourse: (course: CourseDetail | null) => void;
  updateCourse: (courseId: number, updates: Partial<CourseDetail>) => void;

  // 章节相关操作
  setSections: (sections: Section[]) => void;
  setCurrentSection: (section: Section | null) => void;
  updateSection: (sectionId: number, updates: Partial<Section>) => void;

  // 搜索和筛选相关操作
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setPageIndex: (index: number) => void;
  setTotalCourses: (total: number) => void;

  // 练习相关操作
  setExercises: (exercises: Exercise[]) => void;
  setCurrentExercise: (exercise: Exercise | null) => void;

  // 清除所有状态
  clearAll: () => void;
}

// 创建store
export const useStudentCourseStore = create<StudentCourseStore>()(
  persist(
    (set) => ({
      // 初始状态
      courses: [],
      currentCourse: null,
      sections: [],
      currentSection: null,
      exercises: [],
      currentExercise: null,
      studyProgress: [],
      searchQuery: "",
      selectedCategory: null,
      pageIndex: 1,
      pageSize: 10,
      totalCourses: 0,

      // 课程相关操作
      setCourses: (courses) => set({ courses }),
      setCurrentCourse: (course) => set({ currentCourse: course }),
      updateCourse: (courseId, updates) =>
        set((state) => ({
          courses: state.courses.map((course) =>
            course.id === courseId ? { ...course, ...updates } : course
          ),
          currentCourse:
            state.currentCourse?.id === courseId
              ? { ...state.currentCourse, ...updates }
              : state.currentCourse,
        })),

      // 章节相关操作
      setSections: (sections) => set({ sections }),
      setCurrentSection: (section) => set({ currentSection: section }),
      updateSection: (sectionId, updates) =>
        set((state) => ({
          sections: state.sections.map((section) =>
            section.id === sectionId ? { ...section, ...updates } : section
          ),
          currentSection:
            state.currentSection?.id === sectionId
              ? { ...state.currentSection, ...updates }
              : state.currentSection,
        })),

      // 搜索和筛选相关操作
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setPageIndex: (index) => set({ pageIndex: index }),
      setTotalCourses: (total) => set({ totalCourses: total }),

      // 练习相关操作
      setExercises: (exercises) => set({ exercises }),
      setCurrentExercise: (exercise) => set({ currentExercise: exercise }),

      // 清除所有状态
      clearAll: () =>
        set({
          courses: [],
          currentCourse: null,
          sections: [],
          currentSection: null,
          studyProgress: [],
          searchQuery: "",
          selectedCategory: null,
          pageIndex: 1,
          totalCourses: 0,
        }),
    }),
    {
      name: "student-course-storage", // localStorage的键名
    }
  )
);
