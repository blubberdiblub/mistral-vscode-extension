import {
    LanguageModelDataPart,
    LanguageModelTextPart,
    LanguageModelToolCallPart,
    LanguageModelToolResultPart,
} from 'vscode';
import type {
    CancellationToken,
    ExtensionContext,
    LanguageModelChatInformation,
    LanguageModelChatMessageRole,
    LanguageModelChatProvider,
    LanguageModelChatRequestMessage,
    LanguageModelInputPart,
    LanguageModelResponsePart,
    PrepareLanguageModelChatModelOptions,
    Progress,
    ProvideLanguageModelChatResponseOptions,
} from 'vscode';

import { Mistral } from '@mistralai/mistralai';
import type { ChatCompletionStreamRequest } from '@mistralai/mistralai/models/components';

import {
    API_KEY_STORAGE_KEY,
    MISTRAL_ROLE,
    VENDOR_DISPLAY_NAME,
    VENDOR_IDENTIFIER,
} from './constants';
import { askUserForAPIKey } from './ui';
import type {
    FixedLanguageModelChatMessageRole,
    FixedLanguageModelChatRequestMessage,
    Logger,
    MistralMessage,
    MistralModelCard,
    MistralModelChatInformation,
} from './types';


export class MistralChatProvider implements LanguageModelChatProvider<MistralModelChatInformation>
{
    private _apiKey: string | null = null;
    private _mistralClient: Mistral | null = null;

    constructor(
            private readonly context: ExtensionContext,
            private readonly logger: Logger,
    )
    {
        logger.trace("MistralChatProvider.constructor()");
    }


    async provideLanguageModelChatInformation(
            options: PrepareLanguageModelChatModelOptions,
            token: CancellationToken,
    ): Promise<MistralModelChatInformation[]>
    {
        this.logger.trace("provideLanguageModelChatInformation(", options, token, ")");

        try
        {
            const client = await this._ensureMistralClient();
            const response = await client.models.list();

            if (!response.data)
            {
                this.logger.error("provideLanguageModelChatInformation(): No data in response");
                return [];
            }

            return this._apiModelsToModelInfos(response.data);
        }
        catch (error)
        {
            this.logger.error("provideLanguageModelChatInformation():", error);
            return [];
        }
    }

    private _transformMessageVSCodeToMistral(
            message: FixedLanguageModelChatRequestMessage,
            index: number,
            array: readonly any[],
    ): MistralMessage
    {
        let content: string;

        // TODO: Remove development debug output.
        if (message.name ||
                message.role < 1 || message.role > 3 ||
                message.role === 3 && (index !== 0 || array.length <= 2) ||
                !Array.isArray(message.content) ||
                message.content.some((part) => !(part instanceof LanguageModelTextPart)) ||
                true
        )
        {
            const content: unknown = message.content;
            const copy: { content?: any; c?: any; } = { ...message };
            delete copy.content; delete copy.c;
            this.logger.debug(
                    "Input Message:", JSON.stringify(copy),
                    "\n" + (!Array.isArray(content)
                            ? JSON.stringify(content)
                            : content.map((part) => part instanceof LanguageModelTextPart
                                          ? part.value
                                          : part instanceof LanguageModelDataPart
                                          ? `Content-Type: ${part.mimeType}\n\n${part.data}`
                                          : JSON.stringify(part)).join("\n---\n")) + "\n---\n"
            );
        }

        if (typeof message.content === 'string')
        {
            content = message.content;
        }
        else
        {
            content = message.content.map((part) =>
            {
                if (part instanceof LanguageModelTextPart)
                    return part.value;

                return String(part);
            }).join('');
        }

        switch (message.role)
        {
            case 1:
                return {
                    content: content,
                    role: MISTRAL_ROLE.User,
                };
            case 2:
                return {
                    content: content,
                    role: MISTRAL_ROLE.Assistant,
                };
            case 3:
                return {
                    content: content,
                    role: MISTRAL_ROLE.System,
                };
            default:
                throw new Error(`Unknown message role: ${message.role}`);
        }
    }

    async provideLanguageModelChatResponse(
            model: LanguageModelChatInformation,
            messages: readonly LanguageModelChatRequestMessage[],
            options: ProvideLanguageModelChatResponseOptions,
            progress: Progress<LanguageModelResponsePart>,
            token: CancellationToken,
    ): Promise<void>
    {
        this.logger.trace("provideLanguageModelChatResponse()");

        // Validate input parameters
        if (!model || !model.id)
        {
            this.logger.error("Invalid model parameter");
            throw new Error("Invalid model parameter");
        }

        if (!messages || messages.length === 0)
        {
            this.logger.error("No messages provided");
            throw new Error("No messages provided");
        }

        if (options.toolMode !== 1
                || options.tools && options.tools.length > 0
                || options.modelOptions && Object.keys(options.modelOptions).length > 0
        )
        {
            this.logger.debug("  model =", JSON.stringify(model));
            this.logger.debug("  options =", JSON.stringify(options));
        }

        try
        {
            const transformed = messages.map(this._transformMessageVSCodeToMistral.bind(this));

            const client = await this._ensureMistralClient();
            const stream = await client.chat.stream(
                    {
                        model: model.id,
                        messages: transformed,
                    }
            );

            if (token.isCancellationRequested)
                return Promise.reject(new Error('Cancelled'));

            let role: string | null = null;
            let thereWasPrecedingContent = false;

            for await (const event of stream)
            {
                //this.logger.debug(`Event: ${JSON.stringify(event.data)}`);
                if (token.isCancellationRequested)
                    return Promise.reject(new Error('Cancelled'));

                const delta = event?.data?.choices?.[0]?.delta;
                if (!delta)
                {
                    this.logger.warn("Invalid event data structure");
                    continue;
                }

                if (delta.role)
                {
                    if (thereWasPrecedingContent || delta.role !== 'assistant')
                    {
                        this.logger.debug("Switching to role", delta.role);
                        progress.report(new LanguageModelTextPart(`\n---\n\n<span style="font-size: xx-small">${delta.role}</span>\n\n`));
                    }

                    role = delta.role;
                }

                const content = delta.content;
                if (content === undefined || content === null)
                    continue;

                if (content)
                    thereWasPrecedingContent = true;

                if (typeof content === 'string')
                {
                    progress.report(new LanguageModelTextPart(content));
                    continue;
                }

                for (const chunk of content)
                {
                    this.logger.debug("Output Chunk:", JSON.stringify(chunk));

                    switch (chunk.type)
                    {
                        case 'image_url':
                            const imageUrl = typeof chunk.imageUrl === 'string' ? chunk.imageUrl : chunk.imageUrl.url;
                            progress.report(LanguageModelDataPart.text(imageUrl, 'text/x-url'));
                            break;

                        case 'document_url':
                            progress.report(LanguageModelDataPart.text(chunk.documentUrl, 'text/x-url'));
                            break;

                        case 'text':
                            progress.report(LanguageModelDataPart.text(chunk.text, 'text/markdown'));
                            break;

                        case 'reference':
                            for (const id of chunk.referenceIds)
                                progress.report(LanguageModelDataPart.text(`\\[${id}\\]`, 'text/markdown'));
                            break;

                        case 'file':
                            progress.report(LanguageModelDataPart.text(`\\[${chunk.fileId}\\]`, 'text/markdown'));
                            break;

                        case 'thinking':
                            progress.report(LanguageModelDataPart.text("………thinking………", 'text/markdown'));
                            break;

                        case 'input_audio':
                            progress.report(LanguageModelDataPart.text(`\\(\\( ${chunk.inputAudio} \\)\\)`, 'text/markdown'));
                            break;
                    }
                }
            }
        }
        catch (error)
        {
            this.logger.error("provideLanguageModelChatResponse():", error);
            return Promise.reject(error);
        }

        return Promise.resolve();
    }


    async provideTokenCount(
            model: LanguageModelChatInformation,
            text: string | LanguageModelChatRequestMessage,
            token: CancellationToken,
    ): Promise<number>
    {
        this.logger.trace("provideTokenCount(", model, text, token, ")");

        // Validate input parameters
        if (!model || !model.id)
        {
            this.logger.error("Invalid model parameter in provideTokenCount");
            throw new Error("Invalid model parameter");
        }

        if (!text)
        {
            this.logger.error("No text provided for token counting");
            throw new Error("No text provided");
        }

        try
        {
            // TODO: Implement token count for Mistral
            const tokenCount = Math.ceil(text.toString().length / 3);
            this.logger.debug("provideTokenCount() = ", tokenCount);
            return tokenCount;
        }
        catch (error)
        {
            this.logger.error("provideTokenCount():", error);
            return Promise.reject(error);
        }
    }


    private _apiModelsToModelInfos(models: MistralModelCard[]): MistralModelChatInformation[]
    {
        const uniqueModels = new Set<MistralModelChatInformation>();
        const mapIdToModel = new Map<string, MistralModelChatInformation>();

        for (const model of models)
        {
            if (model.type !== 'base' && model.type !== 'fine-tuned')
                continue;

            if (model.deprecation)
                continue;

            if (!model.capabilities.completionChat)
                continue;

            const modelInfo = this._apiModelToModelInfo(model);
            this._deduplicateAndInsertModelInfo(modelInfo, uniqueModels, mapIdToModel);
        }

        return [...uniqueModels].sort(
                (a, b) =>
                    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'accent'})
        );
    }


    private _apiModelToModelInfo(model: MistralModelCard): MistralModelChatInformation
    {
        const nameParts = (model.name || model.id)
                .toLowerCase()
                .split(/[^\w]+/u)
                .filter(x => !!x);

        const lastPart = (nameParts.length > 0) ? nameParts[nameParts.length - 1] : undefined;

        const maxContextLength = model.maxContextLength || 16384;
        const maxOutputTokens = Math.min(Math.ceil(maxContextLength / 4), 8192);

        return {
            id: model.id,
            name: nameParts
                    .map(x => x[0].toUpperCase() + x.substring(1))
                    .join(' '),
            family: nameParts[0] || 'unknown',
            tooltip: model.description || undefined,
            //detail: VENDOR_DISPLAY_NAME,
            detail: (!model.ownedBy || model.ownedBy === 'mistralai')
                     ? VENDOR_DISPLAY_NAME
                     : `${VENDOR_DISPLAY_NAME} (${model.ownedBy})`,
            version: lastPart && lastPart.match(/^\d\w*$/) ? lastPart : '',
            maxInputTokens: maxContextLength - maxOutputTokens,
            maxOutputTokens: maxOutputTokens,
            capabilities: {
                imageInput: !!model.capabilities.vision,
                toolCalling: !!model.capabilities.functionCalling,
            },

            ownedBy: model.ownedBy || 'mistralai',
            maxContextLength: maxContextLength,
            aliases: new Set([
                model.id,
                ...(model.name ? [model.name] : []),
                ...(model.aliases ?? []),
            ]),
            defaultModelTemperature: model.defaultModelTemperature ?? 0.3,
        };
    }


    private _deduplicateAndInsertModelInfo(
            modelInfo: MistralModelChatInformation,
            uniqueModels: Set<MistralModelChatInformation>,
            mapIdToModel: Map<string, MistralModelChatInformation>,
    ): void
    {
        let newAliases = new Set(modelInfo.aliases);
        let examineIds = new Set(modelInfo.aliases);
        while (examineIds.size > 0)
        {
            for (const id of examineIds)
            {
                examineIds.delete(id);

                const otherInfo = mapIdToModel.get(id);
                if (!otherInfo || otherInfo === modelInfo)
                    continue;

                uniqueModels.delete(otherInfo);
                newAliases = newAliases.union(otherInfo.aliases);
                examineIds = examineIds.difference(otherInfo.aliases);

                if (modelInfo.version.localeCompare(otherInfo.version, undefined, {
                    numeric: true,
                    sensitivity: 'accent',
                }) <= 0)
                    modelInfo = otherInfo;

                break;
            }
        }

        modelInfo.aliases = newAliases;
        uniqueModels.add(modelInfo);

        for (const id of newAliases)
            mapIdToModel.set(id, modelInfo);
    }


    async configure(vendor?: string): Promise<void>
    {
        if (vendor !== undefined && vendor !== VENDOR_IDENTIFIER)
            return;

        this.logger.trace("configure()");

        let newAPIKey: string;
        try
        {
            const oldAPIKey = await this.context.secrets.get(API_KEY_STORAGE_KEY);
            newAPIKey = await askUserForAPIKey(oldAPIKey, true, this.logger);
        }
        catch (error)
        {
            this.logger.error("configure():", error);
            return;
        }

        if (!newAPIKey)
        {
            this.logger.debug("configure(): deleting API key from secret storage");
            await this.context.secrets.delete(API_KEY_STORAGE_KEY);

            return;
        }

        this.logger.debug("configure(): saving API key in secret storage");
        await this.context.secrets.store(API_KEY_STORAGE_KEY, newAPIKey);
    }


    async _ensureAPIKey(options?: {silent?: boolean}): Promise<string>
    {
        this.logger.trace("_ensureAPIKey()");

        const oldAPIKey = await this.context.secrets.get(API_KEY_STORAGE_KEY);
        if (oldAPIKey)
            return oldAPIKey;

        if (options && options.silent)
        {
            this.logger.debug("_ensureAPIKey(): no API key present");
            return Promise.reject(new Error("no API key present"));
        }

        this.logger.debug("_ensureAPIKey(): no API key present, asking user");
        const newAPIKey = await askUserForAPIKey(oldAPIKey, false, this.logger);
        if (!newAPIKey)
        {
            this.logger.debug("_ensureAPIKey(): deleting API key from secret storage");
            await this.context.secrets.delete(API_KEY_STORAGE_KEY);

            return Promise.reject(new Error("API key cleared by user"));
        }

        this.logger.debug("_ensureAPIKey(): saving API key in secret storage");
        await this.context.secrets.store(API_KEY_STORAGE_KEY, newAPIKey);

        return newAPIKey;
    }


    async _ensureMistralClient(): Promise<Mistral>
    {
        if (this._mistralClient)
        {
            this.logger.trace("_ensureMistralClient(): Mistral client exists");
            return this._mistralClient;
        }

        try
        {
            this._mistralClient = new Mistral({
                apiKey: this._ensureAPIKey.bind(this),
                userAgent: 'mistral-vscode-extension/0.1',
                retryConfig: {
                    strategy: 'backoff',
                    backoff: {
                        initialInterval: 1000,
                        maxInterval: 60000,
                        exponent: 2.1,
                        maxElapsedTime: 600000,
                    },
                    retryConnectionErrors: true,
                },
                timeoutMs: 600000,
            });

            this.logger.trace("_ensureMistralClient(): Mistral client created");
        }
        catch (error)
        {
            this.logger.error("_ensureMistralClient():", error);
            return Promise.reject(error);
        }

        return this._mistralClient;
    }
}
