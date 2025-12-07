import { window } from 'vscode';

import type { Logger } from './types';


export async function askUserForAPIKey(oldAPIKey?: string, logger?: Logger): Promise<string>
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
            ignoreFocusOut: true,
        }))?.trim();

        if (logger)
            logger.debug("askUserForAPIKey(): apiKey =", apiKey);

        if (apiKey === undefined)
            return Promise.reject(new Error("No API key provided"));

        return apiKey;
    }
    catch (error)
    {
        if (logger)
            logger.error("askUserForAPIKey():", error);

        return Promise.reject(error);
    }
}
