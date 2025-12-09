import { window } from 'vscode';

import type { Logger } from './types';


export async function askUserForAPIKey(
        oldAPIKey?: string,
        focusOutCancels: boolean = false,
        logger?: Logger,
): Promise<string>
{
    if (logger)
        logger.trace("askUserForAPIKey()");

    try
    {
        const apiKey = (await window.showInputBox({
            title: "Mistral API Key",
            value: oldAPIKey,
            prompt: "Enter your Mistral API key",
            password: true,
            ignoreFocusOut: !focusOutCancels,
        }))?.trim();

        if (apiKey !== undefined)
            return apiKey;

        if (logger)
            logger.debug("askUserForAPIKey(): dialog cancelled");

        return Promise.reject(new Error("Dialog cancelled"));
    }
    catch (error)
    {
        if (logger)
            logger.error("askUserForAPIKey():", error);

        return Promise.reject(error);
    }
}
