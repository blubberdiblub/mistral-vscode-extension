import type {
    LanguageModelChatInformation,
    LanguageModelChatMessageRole,
    LanguageModelInputPart,
    LogOutputChannel,
} from 'vscode';

import type {
    AssistantMessage     as MistralAssistantMessage,
    AssistantMessageRole as MistralAssistantRole,
    BaseModelCard        as MistralBaseModelCard,
    FTModelCard          as MistralFTModelCard,
    SystemMessage        as MistralSystemMessage,
    Role                 as MistralSystemRole,
    ToolMessage          as MistralToolMessage,
    ToolMessageRole      as MistralToolRole,
    UserMessage          as MistralUserMessage,
    UserMessageRole      as MistralUserRole,
} from '@mistralai/mistralai/models/components';
// import type { ChatCompletionStreamRequest } from '@mistralai/mistralai/models/components';


export type LogTarget = LogOutputChannel | globalThis.Console | null | undefined;

export type MessageSeverity = 'trace' | 'debug' | 'info' | 'notice' | 'warn' | 'error' | 'critical' | 'fatal';
export type OutputSeverity = 'all' | MessageSeverity | 'none';

export interface Logger
{
    trace(message: string, ...args: unknown[]): void;
    debug(message: string, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
    notice(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string, ...args: unknown[]): void;
    critical(message: string, ...args: unknown[]): void;
    fatal(message: string, ...args: unknown[]): void;

    log(severity: MessageSeverity | number, message: string, ...args: unknown[]): void;
}

enum AugmentedLanguageModelChatMessageRole {
    System    = 3,
    Tool      = 4,
}

export type FixedLanguageModelChatMessageRole =
        | LanguageModelChatMessageRole
        | AugmentedLanguageModelChatMessageRole;

export interface FixedLanguageModelChatRequestMessage {
    readonly role: FixedLanguageModelChatMessageRole;
    readonly content: ReadonlyArray<LanguageModelInputPart | unknown>;
    readonly name: string | undefined;
}

export type MistralRole = (
    | MistralUserRole
    | MistralAssistantRole
    | MistralSystemRole
    | MistralToolRole
);

export type MistralMessage = (
    | (MistralUserMessage & { role: MistralUserRole })
    | (MistralAssistantMessage & { role: MistralAssistantRole })
    | (MistralSystemMessage & { role: MistralSystemRole })
    | (MistralToolMessage & { role: MistralToolRole })
);

export type MistralModelCard = MistralBaseModelCard | MistralFTModelCard;

export type MistralModelChatInformation = LanguageModelChatInformation & {
    ownedBy: string;
    maxContextLength: number;
    aliases: Set<string>;
    defaultModelTemperature: number;
};
