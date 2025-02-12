# cf49raw

## 概述

这个文件通过 Cloudflare Worker 反向代理 githubraw。既可以正常访问 raw 又可以安全的访问私有仓库。

## 环境变量设置

在使用此 Worker 之前，您需要设置以下环境变量：

- `NINE49TOKEN`: 用于验证请求的令牌。
- `GITHUB49TOKEN`: 用于授权访问 GitHub 资源的令牌。github 令牌需要 Contents 和 Metadata 制度权限

## 如何使用

要使用此 Worker，请按照以下步骤操作：

1. **验证请求**：在发送请求时，确保 URL 中包含`nine-token`参数，并且其值与您设置的环境变量`NINE49TOKEN`相匹配。
   示例 URL:
   ```
   https://your-worker.example/path/to/github/file?nine-token=YOUR_NINE_TOKEN
   ```
   请将`YOUR_NINE_TOKEN`替换为有效的令牌。
2. **发送请求**：使用上述格式发送请求后，Worker 将检查`nine-token`，如果验证通过，它将代表您向 GitHub 发送请求
3. **接收响应**：Worker 将 GitHub 的响应直接返回给您。

## 注意事项

- 确保您的环境变量`NINE49TOKEN`和`GITHUB49TOKEN`设置正确。
- 如果您在请求中未包含`nine-token`参数或参数值不正确，Worker 将返回 403 禁止访问错误。
- 如果遇到任何问题，请检查 GitHub API 的响应和请求日志。

## 常见问题解答

- **Q: 我应该如何设置`NINE49TOKEN`和`GITHUB49TOKEN`？**
  - A: 这些令牌应该通过您的 Cloudflare Worker 控制台的环境变量部分进行设置。
- **Q: 如果我忘记了`nine-token`参数会怎样？**
  - A: 如果未提供`nine-token`参数或参数值不正确，Worker 将返回 403 错误。
- **Q: 我可以访问任何 GitHub 资源吗？**
  - A: 只要您有相应的访问权限并且`GITHUB49TOKEN`有效，是的，您可以访问任何 GitHub 资源。
