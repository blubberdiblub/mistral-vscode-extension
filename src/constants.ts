import type {
    MessageSeverity,
    MistralRole,
    OutputSeverity,
} from './types';


export const LOG_CHANNEL_NAME: string = "Mistral";
export const VENDOR_DISPLAY_NAME: string = "Mistral";
export const VENDOR_IDENTIFIER: string = 'extra-arcam.mistralai';  // must be the same as in package.json

export const API_KEY_STORAGE_KEY: string = 'extra-arcam.mistralai.apiKey';


export const MESSAGE_SEVERITY: Record<MessageSeverity, number> =
    {
        trace:     -40,
        debug:     -20,
        info:        0,
        notice:     20,
        warn:       40,
        error:      60,
        critical:   80,
        fatal:     100,
    };


export const OUTPUT_SEVERITY: Record<OutputSeverity, number> =
    {
        all:      -Infinity,
        ...MESSAGE_SEVERITY,
        none:      Infinity,
    };


export const MISTRAL_ROLE: Record<string, MistralRole> =
    {
        User:      "user",
        Assistant: "assistant",
        System:    "system",
        Tool:      "tool",
    };
