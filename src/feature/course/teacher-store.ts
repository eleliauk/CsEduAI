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
  studied_duration: number;
  duration: number;
  content?: string;
  video_url?: string;
}

// 定义Store的状态类型
interface CourseStore {
  // 当前选中的课程
  currentCourse: CourseDetail | null;
  // 当前选中的章节
  currentSection: Section | null;
  // 当前课程的所有章节
  sections: Section[];

  // 设置当前课程
  setCurrentCourse: (course: CourseDetail | null) => void;
  // 设置当前章节
  setCurrentSection: (section: Section | null) => void;
  // 设置章节列表
  setSections: (sections: Section[]) => void;
  // 添加章节
  addSection: (section: Section) => void;
  // 更新章节
  updateSection: (section: Section) => void;
  // 删除章节
  deleteSection: (sectionId: number) => void;
  // 清除所有状态
  clearAll: () => void;
}

// 创建store
export const useCourseStore = create<CourseStore>()(
  persist(
    (set) => ({
      currentCourse: null,
      currentSection: null,
      sections: [],

      setCurrentCourse: (course) => set({ currentCourse: course }),

      setCurrentSection: (section) => set({ currentSection: section }),

      setSections: (sections) => set({ sections }),

      addSection: (section) =>
        set((state) => ({
          sections: [...state.sections, section],
        })),

      updateSection: (updatedSection) =>
        set((state) => ({
          sections: state.sections.map((section) =>
            section.id === updatedSection.id ? updatedSection : section
          ),
          currentSection:
            state.currentSection?.id === updatedSection.id
              ? updatedSection
              : state.currentSection,
        })),

      deleteSection: (sectionId) =>
        set((state) => ({
          sections: state.sections.filter(
            (section) => section.id !== sectionId
          ),
          currentSection:
            state.currentSection?.id === sectionId
              ? null
              : state.currentSection,
        })),

      clearAll: () =>
        set({
          currentCourse: null,
          currentSection: null,
          sections: [],
        }),
    }),
    {
      name: "course-storage", // localStorage的键名
    }
  )
);
