# Mistral for VS Code

A Visual Studio Code extension that integrates Mistral AI models as a Copilot
alternative, providing intelligent code completion, chat assistance, and
refactoring capabilities.

## Features

- **Mistral AI Integration**: Access Mistral models directly in VS Code
- **Interactive Chat**: Chat with Mistral about your code using natural language
- **Seamless Integration**: Utilizes Copilot Chat extension infrastructure

![Mistral Chat Example](images/chat-example.png)

## Requirements

- Visual Studio Code v1.106.0 or higher
- GitHub Copilot Chat extension (required dependency)
- Node.js v22.19.1+ (for development only)

## Installation

1. Install from VS Code Marketplace
2. Ensure GitHub Copilot extensions are installed
3. Select Mistral as your language model provider in Copilot settings

## Supported Models

| Model ID                | Name                  | Context | Def. Temp. |
|-------------------------|-----------------------|---------|------------|
| mistral-large-latest    | Mistral Large 2512    | 262,144 |        0.3 |
| mistral-medium-latest   | Mistral Medium 2508   | 131,072 |        0.3 |
| mistral-small-latest    | Mistral Small 2506    | 131,072 |        0.3 |
| mistral-tiny-latest     | Open Mistral Nemo     | 131,072 |        0.3 |
| mistral-tiny            | Open Mistral 7b       |  32,768 |        0.7 |
| mistral-large-2411      | Mistral Large 2411    | 131,072 |        0.7 |
| devstral-medium-latest  | Devstral Medium 2507  | 131,072 |        0.0 |
| devstral-small-latest   | Devstral Small 2507   | 131,072 |        0.0 |
| ministral-14b-latest    | Ministral 14b 2512    | 262,144 |        0.3 |
| ministral-8b-latest     | Ministral 8b 2512     | 262,144 |        0.3 |
| ministral-3b-latest     | Ministral 3b 2512     | 131,072 |        0.3 |
| magistral-medium-latest | Magistral Medium 2509 | 131,072 |        0.7 |
| magistral-small-latest  | Magistral Small 2509  | 131,072 |        0.7 |
| codestral-latest        | Codestral 2508        | 256,000 |        0.3 |
| voxtral-small-latest    | Voxtral Small 2507    |  32,768 |        0.2 |
| voxtral-mini-latest     | Voxtral Mini 2507     |  32,768 |        0.2 |
| pixtral-large-latest    | Pixtral Large 2411    | 131,072 |        0.7 |

## Release Notes

### 0.0.1 (Current Version)
- Initial release with basic Mistral integration
- Token counting by trivial estimation
- Chat interface integration

# Limitations

- Token counting uses character-based calculation
- Requires Copilot Chat infrastructure (it's a feature, though)
- Currently in early development phase

## Support

For issues and feature requests:
- [GitHub Issues](https://github.com/blubberdiblub/mistral-vscode-extension/issues)

## License

MIT License - Free to use and modify
