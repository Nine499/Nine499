// 导出一个默认对象，该对象包含一个异步的fetch方法，用于处理请求
export default {
  async fetch(request, env) {
    // 创建一个URL对象，解析传入的请求URL
    const url = new URL(request.url);
    // 从URL的查询参数中获取名为"nine-token"的值
    const nineToken = url.searchParams.get("nine-token");
    // 检查获取的nine-token是否与环境中配置的NINE49TOKEN相同
    if (nineToken !== env.NINE49TOKEN) {
      // 如果不相同，返回一个401状态码的响应，表示未授权
      return new Response("Unauthorized", { status: 401 });
    }
    // 创建一个新的URL对象，用于构建代理请求的URL，基础URL为GitHub的raw内容地址
    const proxyUrl = new URL("https://raw.githubusercontent.com");
    // 将原始请求的路径名设置为代理URL的路径名
    proxyUrl.pathname = url.pathname;
    // 将原始请求的查询参数设置为代理URL的查询参数
    proxyUrl.search = url.search;
    // 创建一个新的请求对象，用于代理请求
    const proxyRequest = new Request(proxyUrl, {
      // 复制原始请求的头部信息
      headers: new Headers(request.headers),
      // 复制原始请求的方法（如GET、POST等）
      method: request.method,
      // 复制原始请求的请求体（如果有）
      body: request.body,
    });
    // 在代理请求的头部中设置Authorization字段，使用环境中配置的GITHUB49TOKEN
    proxyRequest.headers.set("Authorization", `Bearer ${env.GITHUB49TOKEN}`);
    // 发送代理请求，并返回响应
    return await fetch(proxyRequest);
  },
};
