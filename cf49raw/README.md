# cf49raw Cloudflare Worker 项目文档

## 一、项目简介

本项目是一个基于 Cloudflare Workers 的轻量级代理服务，主要功能是：验证请求中的 `nine-token` 令牌有效性后，代理获取 GitHub 仓库的 raw 原始文件内容。适用于需要安全访问 GitHub 公开/私有仓库文件的场景（如配置文件分发、静态资源代理等）。

---

## 二、核心功能

通过 `cf49raw.js` 实现以下逻辑：

1. **令牌验证**：检查请求 URL 中携带的 `nine-token` 是否与 Cloudflare 环境变量 `NINE49TOKEN` 匹配
2. **GitHub 内容代理**：验证通过后，将请求路径转发至 `raw.githubusercontent.com`，并携带 GitHub 访问令牌 `GITHUB49TOKEN`（用于访问私有仓库）
3. **错误处理**：任何异常（令牌无效、GitHub 请求失败等）均重定向至百度首页

---

## 三、环境变量配置（关键！）

本服务依赖两个环境变量，需在 Cloudflare Workers 后台配置：

### 1. NINE49TOKEN（访问令牌）

- **用途**：验证请求合法性，防止未授权访问
- **配置方法**：
  1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
  2. 进入你的 Worker 项目
  3. 点击左侧「变量」→「环境变量」→「添加变量」
  4. 名称填 `NINE49TOKEN`，值填你自定义的安全令牌（建议 16 位以上随机字符串）
  5. 勾选「加密」（重要！防止令牌泄露）

### 2. GITHUB49TOKEN（GitHub 访问令牌）

- **用途**：访问 GitHub 私有仓库的 raw 内容（公开仓库可选）
- **获取方法**：
  1. 登录 GitHub → Settings → Developer settings → Personal access tokens → Generate new token
  2. 勾选 `repo` 权限（访问私有仓库需要）
  3. 复制生成的令牌（格式类似 `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）
- **配置方法**：同 `NINE49TOKEN`，名称填 `GITHUB49TOKEN`，值填 GitHub 令牌

---

## 四、使用示例（请求格式）

### 1. 基础请求 URL 格式

```
https://<你的-worker-域名>.workers.dev/<GitHub-raw-路径>?nine-token=<你的-NINE49TOKEN>
```

### 2. 具体示例

假设：

- Worker 域名为 `cf49raw.010811.xyz`
- 要访问的 GitHub raw 路径为 `/494949/494949/49.txt`
- `NINE49TOKEN` 为 `1e3811ba-f571-480f-a9a1-3d62506a1376`

则完整请求 URL 为：

```
https://cf49raw.010811.xyz/494949/494949/49.txt?nine-token=1e3811ba-f571-480f-a9a1-3d62506a1376
```

### 3. 响应说明

- 验证通过：返回 GitHub raw 文件的原始内容（与直接访问 `https://raw.githubusercontent.com/494949/494949/49.txt` 一致）
- 验证失败/异常：返回 302 重定向至 `https://www.baidu.com`

---

## 五、代码逻辑详解（适合新手理解）

以下是 `cf49raw.js` 的核心代码逐行解析：

```javascript
// 导出默认的 Worker 处理函数
export default {
  async fetch(request, env) {
    try {
      // 1. 解析请求 URL
      const url = new URL(request.url);
      // 2. 从 URL 查询参数中获取 nine-token
      const nineToken = url.searchParams.get("nine-token");

      // 3. 验证令牌：不存在或不匹配则重定向百度
      if (!nineToken || nineToken !== env.NINE49TOKEN) {
        return Response.redirect("https://www.baidu.com", 302);
      }

      // 4. 提取 URL 路径部分（用于构造 GitHub raw 地址）
      const path = url.pathname;
      const githubUrl = `https://raw.githubusercontent.com${path}`;

      // 5. 构造带 GitHub 令牌的请求头（用于访问私有仓库）
      const fetchOptions = {
        headers: {
          Authorization: `Bearer ${env.GITHUB49TOKEN}`,
        },
      };

      // 6. 请求 GitHub raw 内容
      const response = await fetch(githubUrl, fetchOptions);

      // 7. 检查 GitHub 请求是否成功（状态码 200-299 为成功）
      if (!response.ok) {
        throw new Error("GitHub请求失败");
      }

      // 8. 将 GitHub 的响应原封不动返回给用户
      return new Response(response.body, { headers: response.headers });
    } catch (error) {
      // 9. 捕获所有异常（如网络错误、解析错误等），重定向百度
      return Response.redirect("https://www.baidu.com", 302);
    }
  },
};
```

---

## 六、注意事项（新手必看！）

1. **环境变量安全**：
   - `NINE49TOKEN` 和 `GITHUB49TOKEN` 是敏感信息，严禁泄露！
   - 配置时务必勾选 Cloudflare 的「加密」选项，避免在日志中明文显示
2. **路径格式要求**：
   - 请求 URL 的路径部分必须以 `/` 开头（如 `/Nine499/repo/file.txt`），否则无法正确拼接 GitHub raw 地址
3. **GitHub 令牌权限**：
   - 若仅需访问公开仓库，`GITHUB49TOKEN` 可以留空（或使用无权限的令牌）
   - 访问私有仓库必须授予 `repo` 权限，且令牌过期后需重新生成
4. **错误排查**：
   - 若始终重定向百度，优先检查 `nine-token` 是否正确（大小写敏感！）
   - 检查 GitHub raw 路径是否存在（可直接访问 `https://raw.githubusercontent.com<路径>` 测试）
   - 查看 Cloudflare Worker 日志（Dashboard → 你的 Worker → 日志）获取详细错误信息

---

## 七、常见问题

Q：为什么访问私有仓库文件返回 404？
A：可能原因：① `GITHUB49TOKEN` 无 `repo` 权限；② 路径错误（如仓库名拼写错误）；③ 文件不存在

Q：可以修改重定向地址吗？
A：可以！修改代码中 `Response.redirect` 的 URL 参数即可（如改为 `https://example.com`）

Q：支持 POST 请求吗？
A：当前仅支持 GET 请求（因代码未处理 POST 体），如需支持需扩展 `fetch` 函数逻辑

---

> 本项目由 Nine499 维护
