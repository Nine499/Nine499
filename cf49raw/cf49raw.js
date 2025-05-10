export default {
  async fetch(request, env) {
    try {
      // 解析请求URL
      const url = new URL(request.url);
      // 获取查询参数中的nine-token
      const nineToken = url.searchParams.get('nine-token');

      // 检查nine-token是否存在且匹配环境变量
      if (!nineToken || nineToken !== env.NINE49TOKEN) {
        return Response.redirect('https://www.baidu.com', 302);
      }

      // 提取路径部分
      const path = url.pathname;
      // 构造GitHub raw内容URL
      const githubUrl = `https://raw.githubusercontent.com${path}`;

      // 创建带Authorization头的请求配置
      const fetchOptions = {
        headers: {
          'Authorization': `Bearer ${env.GITHUB49TOKEN}`
        }
      };

      // 请求GitHub raw内容
      const response = await fetch(githubUrl, fetchOptions);

      // 检查请求是否成功
      if (!response.ok) {
        throw new Error('GitHub请求失败');
      }

      // 返回获取到的内容
      return new Response(response.body, {
        headers: response.headers
      });

    } catch (error) {
      // 捕获所有异常并跳转到百度
      return Response.redirect('https://www.baidu.com', 302);
    }
  }
}
