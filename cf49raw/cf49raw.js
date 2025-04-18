export default {
  async fetch(request, env) {
    // 验证请求中的nine-token参数
    const url = new URL(request.url);
    const nineToken = url.searchParams.get("nine-token");

    if (!nineToken || nineToken !== env.NINE49TOKEN) {
      return new Response("Forbidden", { status: 403 });
    }

    // 构建GitHub API请求
    const path = url.pathname;
    const githubUrl = `https://raw.githubusercontent.com${path}`;

    try {
      // 使用GITHUB49TOKEN访问GitHub资源
      const response = await fetch(githubUrl, {
        headers: {
          Authorization: `Bearer ${env.GITHUB49TOKEN}`,
          "User-Agent": "Cloudflare-Worker",
        },
      });

      // 返回GitHub的响应
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch (error) {
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
