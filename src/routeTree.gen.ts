/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './pages/__root'
import { Route as standaloneWelcomeImport } from './pages/(standalone)/welcome'
import { Route as standaloneLayoutImport } from './pages/(standalone)/_layout'
import { Route as authLoginImport } from './pages/(auth)/login'
import { Route as TeacherCourseIndexImport } from './pages/teacher/course/index'
import { Route as StudentCourseIndexImport } from './pages/student/course/index'
import { Route as TeacherCourseCourseIdImport } from './pages/teacher/course/$courseId'
import { Route as StudentCourseCourseIdImport } from './pages/student/course/$courseId'
import { Route as TeacherCourseSectionSectionIdImport } from './pages/teacher/course/section/$sectionId'
import { Route as StudentCourseSectionExerciseImport } from './pages/student/course/section/exercise'
import { Route as StudentCourseSectionSectionIdImport } from './pages/student/course/section/$sectionId'
import { Route as standaloneLayoutUserProfileImport } from './pages/(standalone)/_layout.user/profile'

// Create Virtual Routes

const standaloneImport = createFileRoute('/(standalone)')()

// Create/Update Routes

const standaloneRoute = standaloneImport.update({
  id: '/(standalone)',
  getParentRoute: () => rootRoute,
} as any)

const standaloneWelcomeRoute = standaloneWelcomeImport.update({
  id: '/welcome',
  path: '/welcome',
  getParentRoute: () => standaloneRoute,
} as any)

const standaloneLayoutRoute = standaloneLayoutImport.update({
  id: '/_layout',
  getParentRoute: () => standaloneRoute,
} as any)

const authLoginRoute = authLoginImport.update({
  id: '/(auth)/login',
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const TeacherCourseIndexRoute = TeacherCourseIndexImport.update({
  id: '/teacher/course/',
  path: '/teacher/course/',
  getParentRoute: () => rootRoute,
} as any)

const StudentCourseIndexRoute = StudentCourseIndexImport.update({
  id: '/student/course/',
  path: '/student/course/',
  getParentRoute: () => rootRoute,
} as any)

const TeacherCourseCourseIdRoute = TeacherCourseCourseIdImport.update({
  id: '/teacher/course/$courseId',
  path: '/teacher/course/$courseId',
  getParentRoute: () => rootRoute,
} as any)

const StudentCourseCourseIdRoute = StudentCourseCourseIdImport.update({
  id: '/student/course/$courseId',
  path: '/student/course/$courseId',
  getParentRoute: () => rootRoute,
} as any)

const TeacherCourseSectionSectionIdRoute =
  TeacherCourseSectionSectionIdImport.update({
    id: '/teacher/course/section/$sectionId',
    path: '/teacher/course/section/$sectionId',
    getParentRoute: () => rootRoute,
  } as any)

const StudentCourseSectionExerciseRoute =
  StudentCourseSectionExerciseImport.update({
    id: '/student/course/section/exercise',
    path: '/student/course/section/exercise',
    getParentRoute: () => rootRoute,
  } as any)

const StudentCourseSectionSectionIdRoute =
  StudentCourseSectionSectionIdImport.update({
    id: '/student/course/section/$sectionId',
    path: '/student/course/section/$sectionId',
    getParentRoute: () => rootRoute,
  } as any)

const standaloneLayoutUserProfileRoute =
  standaloneLayoutUserProfileImport.update({
    id: '/user/profile',
    path: '/user/profile',
    getParentRoute: () => standaloneLayoutRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/(auth)/login': {
      id: '/(auth)/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof authLoginImport
      parentRoute: typeof rootRoute
    }
    '/(standalone)': {
      id: '/(standalone)'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof standaloneImport
      parentRoute: typeof rootRoute
    }
    '/(standalone)/_layout': {
      id: '/(standalone)/_layout'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof standaloneLayoutImport
      parentRoute: typeof standaloneRoute
    }
    '/(standalone)/welcome': {
      id: '/(standalone)/welcome'
      path: '/welcome'
      fullPath: '/welcome'
      preLoaderRoute: typeof standaloneWelcomeImport
      parentRoute: typeof standaloneImport
    }
    '/student/course/$courseId': {
      id: '/student/course/$courseId'
      path: '/student/course/$courseId'
      fullPath: '/student/course/$courseId'
      preLoaderRoute: typeof StudentCourseCourseIdImport
      parentRoute: typeof rootRoute
    }
    '/teacher/course/$courseId': {
      id: '/teacher/course/$courseId'
      path: '/teacher/course/$courseId'
      fullPath: '/teacher/course/$courseId'
      preLoaderRoute: typeof TeacherCourseCourseIdImport
      parentRoute: typeof rootRoute
    }
    '/student/course/': {
      id: '/student/course/'
      path: '/student/course'
      fullPath: '/student/course'
      preLoaderRoute: typeof StudentCourseIndexImport
      parentRoute: typeof rootRoute
    }
    '/teacher/course/': {
      id: '/teacher/course/'
      path: '/teacher/course'
      fullPath: '/teacher/course'
      preLoaderRoute: typeof TeacherCourseIndexImport
      parentRoute: typeof rootRoute
    }
    '/(standalone)/_layout/user/profile': {
      id: '/(standalone)/_layout/user/profile'
      path: '/user/profile'
      fullPath: '/user/profile'
      preLoaderRoute: typeof standaloneLayoutUserProfileImport
      parentRoute: typeof standaloneLayoutImport
    }
    '/student/course/section/$sectionId': {
      id: '/student/course/section/$sectionId'
      path: '/student/course/section/$sectionId'
      fullPath: '/student/course/section/$sectionId'
      preLoaderRoute: typeof StudentCourseSectionSectionIdImport
      parentRoute: typeof rootRoute
    }
    '/student/course/section/exercise': {
      id: '/student/course/section/exercise'
      path: '/student/course/section/exercise'
      fullPath: '/student/course/section/exercise'
      preLoaderRoute: typeof StudentCourseSectionExerciseImport
      parentRoute: typeof rootRoute
    }
    '/teacher/course/section/$sectionId': {
      id: '/teacher/course/section/$sectionId'
      path: '/teacher/course/section/$sectionId'
      fullPath: '/teacher/course/section/$sectionId'
      preLoaderRoute: typeof TeacherCourseSectionSectionIdImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

interface standaloneLayoutRouteChildren {
  standaloneLayoutUserProfileRoute: typeof standaloneLayoutUserProfileRoute
}

const standaloneLayoutRouteChildren: standaloneLayoutRouteChildren = {
  standaloneLayoutUserProfileRoute: standaloneLayoutUserProfileRoute,
}

const standaloneLayoutRouteWithChildren =
  standaloneLayoutRoute._addFileChildren(standaloneLayoutRouteChildren)

interface standaloneRouteChildren {
  standaloneLayoutRoute: typeof standaloneLayoutRouteWithChildren
  standaloneWelcomeRoute: typeof standaloneWelcomeRoute
}

const standaloneRouteChildren: standaloneRouteChildren = {
  standaloneLayoutRoute: standaloneLayoutRouteWithChildren,
  standaloneWelcomeRoute: standaloneWelcomeRoute,
}

const standaloneRouteWithChildren = standaloneRoute._addFileChildren(
  standaloneRouteChildren,
)

export interface FileRoutesByFullPath {
  '/login': typeof authLoginRoute
  '/': typeof standaloneLayoutRouteWithChildren
  '/welcome': typeof standaloneWelcomeRoute
  '/student/course/$courseId': typeof StudentCourseCourseIdRoute
  '/teacher/course/$courseId': typeof TeacherCourseCourseIdRoute
  '/student/course': typeof StudentCourseIndexRoute
  '/teacher/course': typeof TeacherCourseIndexRoute
  '/user/profile': typeof standaloneLayoutUserProfileRoute
  '/student/course/section/$sectionId': typeof StudentCourseSectionSectionIdRoute
  '/student/course/section/exercise': typeof StudentCourseSectionExerciseRoute
  '/teacher/course/section/$sectionId': typeof TeacherCourseSectionSectionIdRoute
}

export interface FileRoutesByTo {
  '/login': typeof authLoginRoute
  '/': typeof standaloneLayoutRouteWithChildren
  '/welcome': typeof standaloneWelcomeRoute
  '/student/course/$courseId': typeof StudentCourseCourseIdRoute
  '/teacher/course/$courseId': typeof TeacherCourseCourseIdRoute
  '/student/course': typeof StudentCourseIndexRoute
  '/teacher/course': typeof TeacherCourseIndexRoute
  '/user/profile': typeof standaloneLayoutUserProfileRoute
  '/student/course/section/$sectionId': typeof StudentCourseSectionSectionIdRoute
  '/student/course/section/exercise': typeof StudentCourseSectionExerciseRoute
  '/teacher/course/section/$sectionId': typeof TeacherCourseSectionSectionIdRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/(auth)/login': typeof authLoginRoute
  '/(standalone)': typeof standaloneRouteWithChildren
  '/(standalone)/_layout': typeof standaloneLayoutRouteWithChildren
  '/(standalone)/welcome': typeof standaloneWelcomeRoute
  '/student/course/$courseId': typeof StudentCourseCourseIdRoute
  '/teacher/course/$courseId': typeof TeacherCourseCourseIdRoute
  '/student/course/': typeof StudentCourseIndexRoute
  '/teacher/course/': typeof TeacherCourseIndexRoute
  '/(standalone)/_layout/user/profile': typeof standaloneLayoutUserProfileRoute
  '/student/course/section/$sectionId': typeof StudentCourseSectionSectionIdRoute
  '/student/course/section/exercise': typeof StudentCourseSectionExerciseRoute
  '/teacher/course/section/$sectionId': typeof TeacherCourseSectionSectionIdRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/login'
    | '/'
    | '/welcome'
    | '/student/course/$courseId'
    | '/teacher/course/$courseId'
    | '/student/course'
    | '/teacher/course'
    | '/user/profile'
    | '/student/course/section/$sectionId'
    | '/student/course/section/exercise'
    | '/teacher/course/section/$sectionId'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/login'
    | '/'
    | '/welcome'
    | '/student/course/$courseId'
    | '/teacher/course/$courseId'
    | '/student/course'
    | '/teacher/course'
    | '/user/profile'
    | '/student/course/section/$sectionId'
    | '/student/course/section/exercise'
    | '/teacher/course/section/$sectionId'
  id:
    | '__root__'
    | '/(auth)/login'
    | '/(standalone)'
    | '/(standalone)/_layout'
    | '/(standalone)/welcome'
    | '/student/course/$courseId'
    | '/teacher/course/$courseId'
    | '/student/course/'
    | '/teacher/course/'
    | '/(standalone)/_layout/user/profile'
    | '/student/course/section/$sectionId'
    | '/student/course/section/exercise'
    | '/teacher/course/section/$sectionId'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  authLoginRoute: typeof authLoginRoute
  standaloneRoute: typeof standaloneRouteWithChildren
  StudentCourseCourseIdRoute: typeof StudentCourseCourseIdRoute
  TeacherCourseCourseIdRoute: typeof TeacherCourseCourseIdRoute
  StudentCourseIndexRoute: typeof StudentCourseIndexRoute
  TeacherCourseIndexRoute: typeof TeacherCourseIndexRoute
  StudentCourseSectionSectionIdRoute: typeof StudentCourseSectionSectionIdRoute
  StudentCourseSectionExerciseRoute: typeof StudentCourseSectionExerciseRoute
  TeacherCourseSectionSectionIdRoute: typeof TeacherCourseSectionSectionIdRoute
}

const rootRouteChildren: RootRouteChildren = {
  authLoginRoute: authLoginRoute,
  standaloneRoute: standaloneRouteWithChildren,
  StudentCourseCourseIdRoute: StudentCourseCourseIdRoute,
  TeacherCourseCourseIdRoute: TeacherCourseCourseIdRoute,
  StudentCourseIndexRoute: StudentCourseIndexRoute,
  TeacherCourseIndexRoute: TeacherCourseIndexRoute,
  StudentCourseSectionSectionIdRoute: StudentCourseSectionSectionIdRoute,
  StudentCourseSectionExerciseRoute: StudentCourseSectionExerciseRoute,
  TeacherCourseSectionSectionIdRoute: TeacherCourseSectionSectionIdRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/(auth)/login",
        "/(standalone)",
        "/student/course/$courseId",
        "/teacher/course/$courseId",
        "/student/course/",
        "/teacher/course/",
        "/student/course/section/$sectionId",
        "/student/course/section/exercise",
        "/teacher/course/section/$sectionId"
      ]
    },
    "/(auth)/login": {
      "filePath": "(auth)/login.tsx"
    },
    "/(standalone)": {
      "filePath": "(standalone)",
      "children": [
        "/(standalone)/_layout",
        "/(standalone)/welcome"
      ]
    },
    "/(standalone)/_layout": {
      "filePath": "(standalone)/_layout.tsx",
      "parent": "/(standalone)",
      "children": [
        "/(standalone)/_layout/user/profile"
      ]
    },
    "/(standalone)/welcome": {
      "filePath": "(standalone)/welcome.tsx",
      "parent": "/(standalone)"
    },
    "/student/course/$courseId": {
      "filePath": "student/course/$courseId.tsx"
    },
    "/teacher/course/$courseId": {
      "filePath": "teacher/course/$courseId.tsx"
    },
    "/student/course/": {
      "filePath": "student/course/index.tsx"
    },
    "/teacher/course/": {
      "filePath": "teacher/course/index.tsx"
    },
    "/(standalone)/_layout/user/profile": {
      "filePath": "(standalone)/_layout.user/profile.tsx",
      "parent": "/(standalone)/_layout"
    },
    "/student/course/section/$sectionId": {
      "filePath": "student/course/section/$sectionId.tsx"
    },
    "/student/course/section/exercise": {
      "filePath": "student/course/section/exercise.tsx"
    },
    "/teacher/course/section/$sectionId": {
      "filePath": "teacher/course/section/$sectionId.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
