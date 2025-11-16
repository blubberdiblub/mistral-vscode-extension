# Mistral for VS Code

A Visual Studio Code extension that integrates Mistral AI models as a Copilot
alternative, providing intelligent code completion, chat assistance, and
refactoring capabilities.

## Features

- **Mistral AI Integration**: Access Mistral 7B and Mixtral 8x7B models directly in VS Code
- **Code Assistance**: Get intelligent code completions and suggestions
- **Interactive Chat**: Chat with Mistral about your code using natural language
- **Token Management**: Automatic token counting for input/output
- **Seamless Integration**: Works alongside GitHub Copilot infrastructure

![Mistral Chat Example](images/chat-example.png)

## Requirements

- Visual Studio Code v1.106.0 or higher
- GitHub Copilot extension (required dependency)
- GitHub Copilot Chat extension (required dependency)
- Node.js v20.19.2+ (for development only)

## Installation

1. Install from VS Code Marketplace
2. Ensure GitHub Copilot extensions are installed
3. Select Mistral as your language model provider in Copilot settings

## Supported Models

| Model ID       | Name          | Max Input Tokens | Max Output Tokens |
|----------------|---------------|------------------|-------------------|
| mistral-7b     | Mistral 7B    | 32,768           | 4,096             |
| mistral-8x7b   | Mixtral 8x7B  | 32,768           | 4,096             |

## Release Notes

### 0.0.1 (Current Version)
- Initial release with basic Mistral integration
- Supports Mistral 7B and Mixtral 8x7B models
- Basic token counting implementation
- Chat interface integration

# Limitations

- Token counting uses approximate character-based calculation
- Requires GitHub Copilot infrastructure
- Currently in early development phase

## Support

For issues and feature requests:
- [GitHub Issues](https://github.com/blubberdiblub/mistral-vscode-extension/issues)

## License

MIT License - Free to use and modify
