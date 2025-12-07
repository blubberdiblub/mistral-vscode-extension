import { lm, window } from 'vscode';
import type { ExtensionContext } from 'vscode';

import { LOG_CHANNEL_NAME, OUTPUT_SEVERITY, VENDOR_IDENTIFIER } from './constants';
import { VSCodeLogger } from './logger';
import { MistralChatProvider } from './provider';


// This method is called when the extension is activated
export async function activate(context: ExtensionContext): Promise<void>
{
    const logChannel = window.createOutputChannel(LOG_CHANNEL_NAME, { log: true });
    logChannel.show(true);

    const logger = new VSCodeLogger(OUTPUT_SEVERITY.debug, [logChannel, console]);

    logger.notice("Activating Mistral Chat Provider");

    const provider = new MistralChatProvider(context, logger);
    context.subscriptions.push(
            lm.registerLanguageModelChatProvider(VENDOR_IDENTIFIER, provider),
    );
}

// This method is called when the extension is deactivated
export function deactivate()
{
    const logger = new VSCodeLogger(OUTPUT_SEVERITY.notice, [LOG_CHANNEL_NAME, console]);

    logger.notice("Deactivating Mistral Chat Provider");
}
