import * as recoil from 'recoil';
import { Socket } from 'socket.io-client';
export { Socket } from 'socket.io-client';
import * as lodash from 'lodash';
import * as react from 'react';
import * as swr__internal from 'swr/_internal';
import { SWRConfiguration } from 'swr';

interface IAction {
    label: string;
    forId: string;
    id: string;
    payload: Record<string, unknown>;
    name: string;
    onClick: () => void;
    tooltip: string;
    icon?: string;
}
interface ICallFn {
    callback: (payload: Record<string, any>) => void;
    name: string;
    args: Record<string, any>;
}

type IElement = IImageElement | ITextElement | IPdfElement | ITasklistElement | IAudioElement | IVideoElement | IFileElement | IPlotlyElement | IDataframeElement | ICustomElement;
type IMessageElement = IImageElement | ITextElement | IPdfElement | IAudioElement | IVideoElement | IFileElement | IPlotlyElement | IDataframeElement | ICustomElement;
type ElementType = IElement['type'];
type IElementSize = 'small' | 'medium' | 'large';
interface TElement<T> {
    id: string;
    type: T;
    threadId?: string;
    forId: string;
    mime?: string;
    url?: string;
    chainlitKey?: string;
}
interface TMessageElement<T> extends TElement<T> {
    name: string;
    display: 'inline' | 'side' | 'page';
}
interface IImageElement extends TMessageElement<'image'> {
    size?: IElementSize;
}
interface ITextElement extends TMessageElement<'text'> {
    language?: string;
}
interface IPdfElement extends TMessageElement<'pdf'> {
    page?: number;
}
interface IAudioElement extends TMessageElement<'audio'> {
    autoPlay?: boolean;
}
interface IVideoElement extends TMessageElement<'video'> {
    size?: IElementSize;
    playerConfig?: object;
}
interface IFileElement extends TMessageElement<'file'> {
    type: 'file';
}
type IPlotlyElement = TMessageElement<'plotly'>;
type ITasklistElement = TElement<'tasklist'>;
type IDataframeElement = TMessageElement<'dataframe'>;
interface ICustomElement extends TMessageElement<'custom'> {
    props: Record<string, unknown>;
}

interface ICommand {
    id: string;
    icon: string;
    description: string;
    button?: boolean;
    persistent?: boolean;
}

interface IFeedback {
    id?: string;
    forId?: string;
    threadId?: string;
    comment?: string;
    value: number;
}

type StepType = 'assistant_message' | 'user_message' | 'system_message' | 'run' | 'tool' | 'llm' | 'embedding' | 'retrieval' | 'rerank' | 'undefined';
interface IStep {
    id: string;
    name: string;
    type: StepType;
    threadId?: string;
    parentId?: string;
    isError?: boolean;
    command?: string;
    showInput?: boolean | string;
    waitForAnswer?: boolean;
    input?: string;
    output: string;
    createdAt: number | string;
    start?: number | string;
    end?: number | string;
    feedback?: IFeedback;
    language?: string;
    defaultOpen?: boolean;
    streaming?: boolean;
    steps?: IStep[];
    metadata?: Record<string, any>;
    indent?: number;
}

interface IAskElementResponse {
    submitted: boolean;
    [key: string]: unknown;
}
interface FileSpec {
    accept?: string[] | Record<string, string[]>;
    max_size_mb?: number;
    max_files?: number;
}
interface ActionSpec {
    keys?: string[];
}
interface IFileRef {
    id: string;
}
interface IAsk {
    callback: (payload: IStep | IFileRef[] | IAction | IAskElementResponse) => void;
    spec: {
        type: 'text' | 'file' | 'action' | 'element';
        step_id: string;
        timeout: number;
        element_id?: string;
    } & FileSpec & ActionSpec;
    parentId?: string;
}

type AuthProvider = 'credentials' | 'header' | 'github' | 'google' | 'azure-ad' | 'azure-ad-hybrid';
interface IUserMetadata extends Record<string, any> {
    tags?: string[];
    image?: string;
    provider?: AuthProvider;
}
interface IUser {
    id: string;
    identifier: string;
    display_name?: string;
    metadata: IUserMetadata;
}

interface IThread {
    id: string;
    createdAt: number | string;
    name?: string;
    userId?: string;
    userIdentifier?: string;
    metadata?: Record<string, any>;
    steps: IStep[];
    elements?: IElement[];
}

type UserInput = {
    content: string;
    createdAt: number;
};
type ThreadHistory = {
    threads?: IThread[];
    currentThreadId?: string;
    timeGroupedThreads?: {
        [key: string]: IThread[];
    };
    pageInfo?: IPageInfo;
};

interface IStarter {
    label: string;
    message: string;
    icon?: string;
    command?: string;
}
interface ChatProfile {
    default: boolean;
    icon?: string;
    name: string;
    markdown_description: string;
    starters?: IStarter[];
}
interface IAudioConfig {
    enabled: boolean;
    sample_rate: number;
}
interface IAuthConfig {
    requireLogin: boolean;
    passwordAuth: boolean;
    headerAuth: boolean;
    oauthProviders: string[];
    default_theme?: 'light' | 'dark';
    ui?: IChainlitConfig['ui'];
}
interface IChainlitConfig {
    markdown?: string;
    ui: {
        name: string;
        description?: string;
        default_theme?: 'light' | 'dark';
        layout?: 'default' | 'wide';
        default_sidebar_state?: 'open' | 'closed';
        cot: 'hidden' | 'tool_call' | 'full';
        github?: string;
        custom_css?: string;
        custom_js?: string;
        custom_font?: string;
        alert_style?: 'classic' | 'modern';
        login_page_image?: string;
        login_page_image_filter?: string;
        login_page_image_dark_filter?: string;
        custom_meta_image_url?: string;
        logo_file_url?: string;
        default_avatar_file_url?: string;
        header_links?: {
            name: string;
            display_name: string;
            icon_url: string;
            url: string;
        }[];
    };
    features: {
        spontaneous_file_upload?: {
            enabled?: boolean;
            max_size_mb?: number;
            max_files?: number;
            accept?: string[] | Record<string, string[]>;
        };
        audio: IAudioConfig;
        unsafe_allow_html?: boolean;
        user_message_autoscroll?: boolean;
        latex?: boolean;
        edit_message?: boolean;
        mcp?: {
            enabled?: boolean;
            sse?: {
                enabled?: boolean;
            };
            streamable_http?: {
                enabled?: boolean;
            };
            stdio?: {
                enabled?: boolean;
            };
        };
    };
    debugUrl?: string;
    userEnv: string[];
    dataPersistence: boolean;
    threadResumable: boolean;
    chatProfiles: ChatProfile[];
    starters?: IStarter[];
    translation: object;
}

interface IMcp {
    name: string;
    tools: [{
        name: string;
    }];
    status: 'connected' | 'connecting' | 'failed';
    clientType: 'sse' | 'stdio' | 'streamable-http';
    command?: string;
    url?: string;
    headers?: Record<string, string>;
}

interface IToken {
    id: number | string;
    token: string;
    isSequence: boolean;
    isInput: boolean;
}
declare const useChatData: () => {
    actions: IAction[];
    askUser: IAsk | undefined;
    callFn: ICallFn | undefined;
    chatSettingsDefaultValue: any;
    chatSettingsInputs: any;
    chatSettingsValue: any;
    connected: boolean | undefined;
    disabled: boolean;
    elements: IMessageElement[];
    error: boolean | undefined;
    loading: boolean;
    tasklists: ITasklistElement[];
};

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
declare const useChatInteract: () => {
    uploadFile: (file: File, onProgress: (progress: number) => void, parentId?: string) => {
        xhr: XMLHttpRequest;
        promise: Promise<{
            id: string;
        }>;
    };
    clear: () => void;
    replyMessage: (message: IStep) => void;
    sendMessage: (message: PartialBy<IStep, 'createdAt' | 'id'>, fileReferences?: IFileRef[]) => void;
    editMessage: (message: IStep) => void;
    windowMessage: (data: any) => void;
    startAudioStream: () => void;
    sendAudioChunk: (isStart: boolean, mimeType: string, elapsedTime: number, data: Int16Array) => void;
    endAudioStream: () => void;
    stopTask: () => void;
    setIdToResume: recoil.SetterOrUpdater<string | undefined>;
    updateChatSettings: (values: object) => void;
};

declare const useChatMessages: () => {
    threadId: string | undefined;
    messages: IStep[];
    firstInteraction: string | undefined;
};

interface ISession {
    socket: Socket;
    error?: boolean;
}
declare const threadIdToResumeState: recoil.RecoilState<string | undefined>;
declare const resumeThreadErrorState: recoil.RecoilState<string | undefined>;
declare const chatProfileState: recoil.RecoilState<string | undefined>;
declare const sessionIdState: recoil.RecoilState<string>;
declare const sessionState: recoil.RecoilState<ISession | undefined>;
declare const actionState: recoil.RecoilState<IAction[]>;
declare const messagesState: recoil.RecoilState<IStep[]>;
declare const commandsState: recoil.RecoilState<ICommand[]>;
declare const tokenCountState: recoil.RecoilState<number>;
declare const loadingState: recoil.RecoilState<boolean>;
declare const askUserState: recoil.RecoilState<IAsk | undefined>;
declare const wavRecorderState: recoil.RecoilState<any>;
declare const wavStreamPlayerState: recoil.RecoilState<any>;
declare const audioConnectionState: recoil.RecoilState<"connecting" | "on" | "off">;
declare const isAiSpeakingState: recoil.RecoilState<boolean>;
declare const callFnState: recoil.RecoilState<ICallFn | undefined>;
declare const chatSettingsInputsState: recoil.RecoilState<any>;
declare const chatSettingsDefaultValueSelector: recoil.RecoilValueReadOnly<any>;
declare const chatSettingsValueState: recoil.RecoilState<any>;
declare const elementState: recoil.RecoilState<IMessageElement[]>;
declare const tasklistState: recoil.RecoilState<ITasklistElement[]>;
declare const firstUserInteraction: recoil.RecoilState<string | undefined>;
declare const userState: recoil.RecoilState<IUser | null | undefined>;
declare const configState: recoil.RecoilState<IChainlitConfig | undefined>;
declare const authState: recoil.RecoilState<IAuthConfig | undefined>;
declare const threadHistoryState: recoil.RecoilState<ThreadHistory | undefined>;
declare const sideViewState: recoil.RecoilState<{
    title: string;
    elements: IMessageElement[];
    key?: string | undefined;
} | undefined>;
declare const currentThreadIdState: recoil.RecoilState<string | undefined>;
declare const mcpState: recoil.RecoilState<IMcp[]>;

declare const useChatSession: () => {
    connect: lodash.DebouncedFunc<({ transports, userEnv }: {
        transports?: string[] | undefined;
        userEnv: Record<string, string>;
    }) => Promise<void>>;
    disconnect: () => void;
    session: ISession | undefined;
    sessionId: string;
    chatProfile: string | undefined;
    idToResume: string | undefined;
    setChatProfile: recoil.SetterOrUpdater<string | undefined>;
};

declare const useAudio: () => {
    startConversation: () => Promise<void>;
    endConversation: () => Promise<void>;
    audioConnection: "connecting" | "on" | "off";
    isAiSpeaking: boolean;
    wavRecorder: any;
    wavStreamPlayer: any;
};

declare const useConfig: () => {
    config: IChainlitConfig | undefined;
    error: Error | undefined;
    isLoading: boolean;
    language: string;
};

declare const useAuth: () => {
    data: IAuthConfig;
    user: null;
    isReady: boolean;
    isAuthenticated: boolean;
    logout: () => Promise<void>;
    setUserFromAPI: () => Promise<void>;
} | {
    data: IAuthConfig | undefined;
    user: IUser | null | undefined;
    isReady: boolean;
    isAuthenticated: boolean;
    logout: (reload?: boolean) => Promise<void>;
    setUserFromAPI: swr__internal.KeyedMutator<IUser>;
};

declare const fetcher: (client: ChainlitAPI, endpoint: string) => Promise<any>;
declare function useApi<T>(path?: string | null, { ...swrConfig }?: SWRConfiguration): swr__internal.SWRResponse<T, Error, Partial<swr__internal.PublicConfiguration<T, Error, swr__internal.BareFetcher<T>>> | undefined>;

interface IThreadFilters {
    search?: string;
    feedback?: number;
}
interface IPageInfo {
    hasNextPage: boolean;
    endCursor?: string;
}
interface IPagination {
    first: number;
    cursor?: string | number;
}
declare class ClientError extends Error {
    status: number;
    detail?: string;
    constructor(message: string, status: number, detail?: string);
    toString(): string;
}
type Payload = FormData | any;
declare class APIBase {
    httpEndpoint: string;
    type: 'webapp' | 'copilot' | 'teams' | 'slack' | 'discord';
    additionalQueryParams?: Record<string, string> | undefined;
    on401?: (() => void) | undefined;
    onError?: ((error: ClientError) => void) | undefined;
    constructor(httpEndpoint: string, type: 'webapp' | 'copilot' | 'teams' | 'slack' | 'discord', additionalQueryParams?: Record<string, string> | undefined, on401?: (() => void) | undefined, onError?: ((error: ClientError) => void) | undefined);
    buildEndpoint(path: string): string;
    private getDetailFromErrorResponse;
    private handleRequestError;
    fetch(method: string, path: string, data?: Payload, signal?: AbortSignal, headers?: {
        Authorization?: string;
        'Content-Type'?: string;
    }): Promise<Response>;
    get(endpoint: string): Promise<Response>;
    post(endpoint: string, data: Payload, signal?: AbortSignal): Promise<Response>;
    put(endpoint: string, data: Payload): Promise<Response>;
    patch(endpoint: string, data: Payload): Promise<Response>;
    delete(endpoint: string, data: Payload): Promise<Response>;
}
declare class ChainlitAPI extends APIBase {
    headerAuth(): Promise<any>;
    jwtAuth(token: string): Promise<any>;
    stickyCookie(sessionId: string): Promise<any>;
    passwordAuth(data: FormData): Promise<any>;
    getUser(): Promise<IUser>;
    logout(): Promise<any>;
    setFeedback(feedback: IFeedback): Promise<{
        success: boolean;
        feedbackId: string;
    }>;
    deleteFeedback(feedbackId: string): Promise<{
        success: boolean;
    }>;
    listThreads(pagination: IPagination, filter: IThreadFilters): Promise<{
        pageInfo: IPageInfo;
        data: IThread[];
    }>;
    renameThread(threadId: string, name: string): Promise<any>;
    deleteThread(threadId: string): Promise<any>;
    uploadFile(file: File, onProgress: (progress: number) => void, sessionId: string, parentId?: string): {
        xhr: XMLHttpRequest;
        promise: Promise<{
            id: string;
        }>;
    };
    callAction(action: IAction, sessionId: string): Promise<any>;
    updateElement(element: IElement, sessionId: string): Promise<any>;
    deleteElement(element: IElement, sessionId: string): Promise<any>;
    connectStdioMCP(sessionId: string, name: string, fullCommand: string): Promise<any>;
    connectSseMCP(sessionId: string, name: string, url: string, headers?: Record<string, string>): Promise<any>;
    connectStreamableHttpMCP(sessionId: string, name: string, url: string, headers?: Record<string, string>): Promise<any>;
    disconnectMcp(sessionId: string, name: string): Promise<any>;
    getElementUrl(id: string, sessionId: string): string;
    getLogoEndpoint(theme: string, configuredLogoUrl?: string): string;
    getOAuthEndpoint(provider: string): string;
}

declare const defaultChainlitContext: undefined;
declare const ChainlitContext: react.Context<ChainlitAPI>;

declare const nestMessages: (messages: IStep[]) => IStep[];
declare const isLastMessage: (messages: IStep[], index: number) => boolean;
declare const addMessage: (messages: IStep[], message: IStep) => IStep[];
declare const addMessageToParent: (messages: IStep[], parentId: string, newMessage: IStep) => IStep[];
declare const hasMessageById: (messages: IStep[], messageId: string) => boolean;
declare const updateMessageById: (messages: IStep[], messageId: string, updatedMessage: IStep) => IStep[];
declare const deleteMessageById: (messages: IStep[], messageId: string) => IStep[];
declare const updateMessageContentById: (messages: IStep[], messageId: number | string, updatedContent: string, isSequence: boolean, isInput: boolean) => IStep[];

declare const WavRenderer: {
    drawBars: (ctx: CanvasRenderingContext2D, data: Float32Array, cssWidth: number, cssHeight: number, color: string, pointCount?: number, barWidth?: number, barSpacing?: number, center?: boolean) => void;
};

export { APIBase, ActionSpec, AuthProvider, ChainlitAPI, ChainlitContext, ChatProfile, ClientError, ElementType, FileSpec, IAction, IAsk, IAskElementResponse, IAudioConfig, IAudioElement, IAuthConfig, ICallFn, IChainlitConfig, ICommand, ICustomElement, IDataframeElement, IElement, IElementSize, IFeedback, IFileElement, IFileRef, IImageElement, IMcp, IMessageElement, IPageInfo, IPagination, IPdfElement, IPlotlyElement, ISession, IStarter, IStep, ITasklistElement, ITextElement, IThread, IThreadFilters, IToken, IUser, IUserMetadata, IVideoElement, ThreadHistory, UserInput, WavRenderer, actionState, addMessage, addMessageToParent, askUserState, audioConnectionState, authState, callFnState, chatProfileState, chatSettingsDefaultValueSelector, chatSettingsInputsState, chatSettingsValueState, commandsState, configState, currentThreadIdState, defaultChainlitContext, deleteMessageById, elementState, fetcher, firstUserInteraction, hasMessageById, isAiSpeakingState, isLastMessage, loadingState, mcpState, messagesState, nestMessages, resumeThreadErrorState, sessionIdState, sessionState, sideViewState, tasklistState, threadHistoryState, threadIdToResumeState, tokenCountState, updateMessageById, updateMessageContentById, useApi, useAudio, useAuth, useChatData, useChatInteract, useChatMessages, useChatSession, useConfig, userState, wavRecorderState, wavStreamPlayerState };
