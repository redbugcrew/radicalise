/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export enum StartNextIntervalError {
  CurrentIntervalNotFound = "CurrentIntervalNotFound",
  NextIntervalNotFound = "NextIntervalNotFound",
  CouldntSetUpInterval = "CouldntSetUpInterval",
  InternalServerError = "InternalServerError",
}

export enum PeerRoleDistributionType {
  RandomPairs = "RandomPairs",
  RotatedPairs = "RotatedPairs",
  StickyUnidirectional = "StickyUnidirectional",
}

export enum ParticipationIntention {
  OptIn = "OptIn",
  OptOut = "OptOut",
}

export enum OptOutType {
  Hiatus = "Hiatus",
  Exit = "Exit",
}

export enum InvolvementStatus {
  Onboarding = "Onboarding",
  Active = "Active",
  OnHiatus = "OnHiatus",
  Exiting = "Exiting",
  Invited = "Invited",
}

export enum EventResponseExpectation {
  Expected = "Expected",
  Encouraged = "Encouraged",
  Welcome = "Welcome",
}

export enum AttendanceIntention {
  Going = "Going",
  Uncertain = "Uncertain",
  NotGoing = "NotGoing",
}

export type AppEvent =
  | {
      MeEvent: MeEvent
    }
  | {
      IntervalsEvent: IntervalsEvent
    }
  | {
      CrewsEvent: CrewsEvent
    }
  | {
      ProjectEvent: ProjectEvent
    }
  | {
      PeopleEvent: PeopleEvent
    }
  | {
      EventTemplatesEvent: EventTemplatesEvent
    }
  | {
      CalendarEventsEvent: CalendarEventsEvent
    }
  | {
      CalendarEventAttendancesEvent: CalendarEventAttendancesEvent
    }
  | {
      CirclesEvent: CirclesEvent
    }

export interface CalendarEvent {
  attendances?: CalendarEventAttendance[] | null
  description: string
  end_at?: string | null
  /** @format int64 */
  event_template_id: number
  /** @format int64 */
  id: number
  links?: Link[] | null
  location: string
  name: string
  response_expectation: EventResponseExpectation
  start_at: string
  summary: string
}

export interface CalendarEventAttendance {
  actual?: boolean | null
  /** @format int64 */
  calendar_event_id: number
  /** @format int64 */
  id: number
  intention?: AttendanceIntention | null
  /** @format int64 */
  person_id: number
}

export type CalendarEventAttendancesEvent = {
  CalendarEventAttendanceUpdated: CalendarEventAttendance
}

export type CalendarEventsEvent = {
  CalendarEventUpdated: CalendarEvent
}

export interface CapacityPlanning {
  capacity?: string | null
  focus?: string | null
  wellbeing?: string | null
}

export interface Circle {
  /** @format int64 */
  id: number
  /** @format int64 */
  inside_circle_id?: number | null
  name: string
  /** @format int64 */
  project_id: number
  slug: string
}

export interface CircleInvitation {
  /** @format int64 */
  circle_id: number
  /** @format int64 */
  circle_involvement_id?: number | null
  created_at: string
  expires_at: string
  /** @format int64 */
  id: number
  invitation_token: string
  invitee_email: string
  message?: string | null
  /** @format int64 */
  person_id: number
  sent_at?: string | null
}

export interface CircleInvitationDetails {
  circle: Circle
  invitation: CircleInvitation
  project: Project
}

export interface CircleInvolvement {
  capacity_planning?: CapacityPlanning | null
  /** @format int64 */
  capacity_planning_visibility_circle_id?: number | null
  /** @format int64 */
  capacity_score?: number | null
  /** @format int64 */
  circle_id: number
  /** @format int64 */
  id: number
  /** @format int64 */
  implicit_counter: number
  intention_context?: string | null
  /** @format int64 */
  interval_id: number
  opt_out_planned_return_date?: string | null
  opt_out_type?: OptOutType | null
  participation_intention?: ParticipationIntention | null
  /** @format int64 */
  person_id: number
  /** @format int64 */
  project_id: number
  status: InvolvementStatus
}

export interface CircleInvolvementData {
  /** @format int64 */
  circle_id: number
  circle_involvements: CircleInvolvement[]
  /** @format int64 */
  interval_id: number
}

export type CirclesEvent = {
  CircleUpdated: Circle
}

export interface CreateAttendanceRequest {
  /** @format int64 */
  calendar_event_id: number
  intention?: AttendanceIntention | null
}

export interface Credentials {
  email: string
  password: string
}

export interface CrewInvolvement {
  convenor: boolean
  /** @format int64 */
  crew_id: number
  /** @format int64 */
  id: number
  /** @format int64 */
  interval_id: number
  /** @format int64 */
  person_id: number
  volunteered_convenor: boolean
}

export interface CrewWithLinks {
  description?: string | null
  /** @format int64 */
  id: number
  links?: Link[] | null
  name: string
  /** @format int64 */
  project_id: number
}

export type CrewsEvent = {
  CrewUpdated: CrewWithLinks
}

export interface EventTemplate {
  /** @format int64 */
  id: number
  links?: Link[] | null
  name: string
  response_expectation: EventResponseExpectation
  summary: string
}

export type EventTemplatesEvent = {
  EventTemplateUpdated: EventTemplate
}

export interface ForgotPasswordRequest {
  email: string
}

export interface InitialData {
  calendar_events: CalendarEvent[]
  circles: Circle[]
  crews: CrewWithLinks[]
  current_interval_data?: IntervalData | null
  event_templates: EventTemplate[]
  intervals: Interval[]
  peer_roles: PeerRole[]
  people: Person[]
  project: Project
}

export interface Interval {
  end_date: string
  /** @format int64 */
  id: number
  start_date: string
}

export interface IntervalData {
  circle_involvements: CircleInvolvementData[]
  crew_involvements: CrewInvolvement[]
  interval: Interval
  peer_enrollments: PeerEnrollment[]
}

export type IntervalsEvent =
  | {
      IntervalCreated: Interval
    }
  | {
      IntervalStarted: Interval
    }

export interface InvitePersonRequest {
  /** @format int64 */
  circle_id: number
  email: string
  message?: string | null
  name: string
}

export interface InvitePersonResponse {
  events: AppEvent[]
  person: Person
}

export interface Link {
  label?: string | null
  link_type: string
  url: string
}

export interface LoginResponse {
  /** @format int64 */
  user_id: number
}

export type MeEvent = {
  IntervalDataChanged: PersonIntervalData
}

export interface MyInitialData {
  calendar_token?: string | null
  /** @format int64 */
  person_id: number
}

export interface MyParticipationInput {
  capacity?: string | null
  /** @format int64 */
  capacity_planning_visibility_circle_id?: number | null
  /** @format int64 */
  capacity_score?: number | null
  /** @format int64 */
  circle_id: number
  crew_involvements?: CrewInvolvement[] | null
  focus?: string | null
  intention_context?: string | null
  opt_out_planned_return_date?: string | null
  opt_out_type?: OptOutType | null
  participation_intention?: ParticipationIntention | null
  /** @format int64 */
  project_id: number
  wellbeing?: string | null
}

export interface PeerEnrollment {
  /** @format int64 */
  id: number
  /** @format int64 */
  interval_id: number
  /** @format int64 */
  peer_id: number
  /** @format int64 */
  peer_role_id: number
  /** @format int64 */
  person_id: number
}

export interface PeerRole {
  /** @format int64 */
  circle_id: number
  /** @format int64 */
  constrained_by_id?: number | null
  distribution_type: PeerRoleDistributionType
  /** @format int64 */
  id: number
  /** @format int64 */
  max_intervals?: number | null
  name: string
  /** @format int64 */
  project_id: number
  summary?: string | null
}

export type PeopleEvent = {
  PersonUpdated: Person
}

export interface Person {
  about?: string | null
  /** @format int64 */
  avatar_id?: number | null
  display_name: string
  /** @format int64 */
  id: number
  /** @format int64 */
  project_id: number
}

export interface PersonIntervalData {
  data: IntervalData
  /** @format int64 */
  person_id: number
}

export interface Project {
  description?: string | null
  /** @format int64 */
  id: number
  links: Link[]
  name?: string | null
  noun_name?: string | null
  slug?: string | null
}

export type ProjectEvent =
  | {
      ProjectUpdated: Project
    }
  | {
      CircleInvolvementUpdated: CircleInvolvement
    }

export interface ResetPasswordRequest {
  password: string
  token: string
}

export interface SignUpRequest {
  email: string
  password: string
}

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, HeadersDefaults, ResponseType } from "axios"
import axios from "axios"

export type QueryParamsType = Record<string | number, any>

export interface FullRequestParams extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean
  /** request path */
  path: string
  /** content type of request body */
  type?: ContentType
  /** query params */
  query?: QueryParamsType
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType
  /** request body */
  body?: unknown
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">

export interface ApiConfig<SecurityDataType = unknown> extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (securityData: SecurityDataType | null) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void
  secure?: boolean
  format?: ResponseType
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance
  private securityData: SecurityDataType | null = null
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"]
  private secure?: boolean
  private format?: ResponseType

  constructor({ securityWorker, secure, format, ...axiosConfig }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    })
    this.secure = secure
    this.format = format
    this.securityWorker = securityWorker
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data
  }

  protected mergeRequestParams(params1: AxiosRequestConfig, params2?: AxiosRequestConfig): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method)

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method && this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    }
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem)
    } else {
      return `${formItem}`
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key]
      const propertyContent: any[] = property instanceof Array ? property : [property]

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem))
      }

      return formData
    }, new FormData())
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) && this.securityWorker && (await this.securityWorker(this.securityData))) || {}
    const requestParams = this.mergeRequestParams(params, secureParams)
    const responseFormat = format || this.format || undefined

    if (type === ContentType.FormData && body && body !== null && typeof body === "object") {
      body = this.createFormData(body as Record<string, unknown>)
    }

    if (type === ContentType.Text && body && body !== null && typeof body !== "string") {
      body = JSON.stringify(body)
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    })
  }
}

/**
 * @title radicalise
 * @version 1.5.1
 * @license
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @name GetCurrentUser
     * @request GET:/api/auth/current_user
     */
    getCurrentUser: (params: RequestParams = {}) =>
      this.request<LoginResponse | null, any>({
        path: `/api/auth/current_user`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name ForgotPassword
     * @request POST:/api/auth/forgot_password
     */
    forgotPassword: (data: ForgotPasswordRequest, params: RequestParams = {}) =>
      this.request<string, string>({
        path: `/api/auth/forgot_password`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @name Login
     * @request POST:/api/auth/login
     */
    login: (data: Credentials, params: RequestParams = {}) =>
      this.request<LoginResponse, string>({
        path: `/api/auth/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name ResetPassword
     * @request POST:/api/auth/reset_password
     */
    resetPassword: (data: ResetPasswordRequest, params: RequestParams = {}) =>
      this.request<string, string>({
        path: `/api/auth/reset_password`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @name SignUp
     * @request POST:/api/auth/sign_up
     */
    signUp: (data: SignUpRequest, params: RequestParams = {}) =>
      this.request<any, string>({
        path: `/api/auth/sign_up`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name RecomputeImplicitInvolvements
     * @request POST:/api/dev/projects/{project_id}/recompute_implicit_involvements
     */
    recomputeImplicitInvolvements: (projectId: number, params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/api/dev/projects/${projectId}/recompute_implicit_involvements`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name InvitePerson
     * @request POST:/api/invitations/invitation/new
     */
    invitePerson: (data: InvitePersonRequest, params: RequestParams = {}) =>
      this.request<InvitePersonResponse, string>({
        path: `/api/invitations/invitation/new`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name AcceptInvitation
     * @request POST:/api/invitations/invitation/{token}/accept
     */
    acceptInvitation: (token: string, params: RequestParams = {}) =>
      this.request<any, string>({
        path: `/api/invitations/invitation/${token}/accept`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name GetMyState
     * @request GET:/api/me
     */
    getMyState: (params: RequestParams = {}) =>
      this.request<MyInitialData, any>({
        path: `/api/me`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name UpdateMyParticipation
     * @request POST:/api/me/interval/{interval_id}/my_participation
     */
    updateMyParticipation: (intervalId: number, data: MyParticipationInput, params: RequestParams = {}) =>
      this.request<AppEvent[], any>({
        path: `/api/me/interval/${intervalId}/my_participation`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name MyParticipation
     * @request GET:/api/me/participation/interval/{interval_id}/circle/{circle_id}
     */
    myParticipation: (intervalId: number, circleId: number, params: RequestParams = {}) =>
      this.request<CircleInvolvement | null, any>({
        path: `/api/me/participation/interval/${intervalId}/circle/${circleId}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name GetVisibleProjects
     * @request GET:/api/me/projects/visible
     */
    getVisibleProjects: (params: RequestParams = {}) =>
      this.request<Project[], any>({
        path: `/api/me/projects/visible`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name CreateCalendarEventAttendance
     * @request POST:/api/projects/{project_id}/calendar_event_attendances
     */
    createCalendarEventAttendance: (projectId: number, data: CreateAttendanceRequest, params: RequestParams = {}) =>
      this.request<AppEvent[], any>({
        path: `/api/projects/${projectId}/calendar_event_attendances`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name CreateCalendarEvent
     * @request POST:/api/projects/{project_id}/calendar_events
     */
    createCalendarEvent: (projectId: number, data: CalendarEvent, params: RequestParams = {}) =>
      this.request<AppEvent[], any>({
        path: `/api/projects/${projectId}/calendar_events`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name UpdateCalendarEvent
     * @request PUT:/api/projects/{project_id}/calendar_events/{event_id}
     */
    updateCalendarEvent: (projectId: number, eventId: number, data: CalendarEvent, params: RequestParams = {}) =>
      this.request<AppEvent[], any>({
        path: `/api/projects/${projectId}/calendar_events/${eventId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name CreateCircle
     * @request POST:/api/projects/{project_id}/circles
     */
    createCircle: (projectId: number, data: Circle, params: RequestParams = {}) =>
      this.request<AppEvent[], string>({
        path: `/api/projects/${projectId}/circles`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name UpdateCircle
     * @request PUT:/api/projects/{project_id}/circles/{circle_id}
     */
    updateCircle: (projectId: number, circleId: number, data: Circle, params: RequestParams = {}) =>
      this.request<AppEvent[], string>({
        path: `/api/projects/${projectId}/circles/${circleId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name UpdateCrew
     * @request PUT:/api/projects/{project_id}/crews/{crew_id}
     */
    updateCrew: (projectId: number, crewId: number, data: CrewWithLinks, params: RequestParams = {}) =>
      this.request<AppEvent[], any>({
        path: `/api/projects/${projectId}/crews/${crewId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name CreateEventTemplate
     * @request POST:/api/projects/{project_id}/event_templates
     */
    createEventTemplate: (projectId: number, data: EventTemplate, params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/api/projects/${projectId}/event_templates`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name UpdateEventTemplate
     * @request PUT:/api/projects/{project_id}/event_templates/{event_template_id}
     */
    updateEventTemplate: (projectId: number, eventTemplateId: number, data: EventTemplate, params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/api/projects/${projectId}/event_templates/${eventTemplateId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name CreateInterval
     * @request POST:/api/projects/{project_id}/intervals
     */
    createInterval: (projectId: number, data: Interval, params: RequestParams = {}) =>
      this.request<AppEvent[], any>({
        path: `/api/projects/${projectId}/intervals`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name StartNextInterval
     * @request POST:/api/projects/{project_id}/intervals/start_next_interval
     */
    startNextInterval: (projectId: number, params: RequestParams = {}) =>
      this.request<AppEvent[], StartNextIntervalError>({
        path: `/api/projects/${projectId}/intervals/start_next_interval`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name UpdateProject
     * @request PUT:/api/projects/{project_id}/my_project
     */
    updateProject: (projectId: number, data: Project, params: RequestParams = {}) =>
      this.request<AppEvent[], any>({
        path: `/api/projects/${projectId}/my_project`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name GetIntervalData
     * @request GET:/api/projects/{project_id}/my_project/interval/{interval_id}/state
     */
    getIntervalData: (intervalId: number, projectId: number, params: RequestParams = {}) =>
      this.request<IntervalData, any>({
        path: `/api/projects/${projectId}/my_project/interval/${intervalId}/state`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name GetProjectState
     * @request GET:/api/projects/{project_id}/my_project/state
     */
    getProjectState: (projectId: number, params: RequestParams = {}) =>
      this.request<InitialData, any>({
        path: `/api/projects/${projectId}/my_project/state`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name UpdatePerson
     * @request PUT:/api/projects/{project_id}/people/{person_id}
     */
    updatePerson: (projectId: number, personId: string, data: Person, params: RequestParams = {}) =>
      this.request<AppEvent[], any>({
        path: `/api/projects/${projectId}/people/${personId}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name GetInvitation
     * @request GET:/api/public/invitation/{token}
     */
    getInvitation: (token: string, params: RequestParams = {}) =>
      this.request<CircleInvitationDetails, string>({
        path: `/api/public/invitation/${token}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name GetProjectBySlug
     * @request GET:/api/public/projects/by_slug/{project_slug}
     */
    getProjectBySlug: (projectSlug: string, params: RequestParams = {}) =>
      this.request<Project, any>({
        path: `/api/public/projects/by_slug/${projectSlug}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name GetCalendarIcs
     * @request GET:/api/public/{calendar_token}/calendar.ics
     */
    getCalendarIcs: (calendarToken: string, params: RequestParams = {}) =>
      this.request<string, any>({
        path: `/api/public/${calendarToken}/calendar.ics`,
        method: "GET",
        ...params,
      }),
  }
}
