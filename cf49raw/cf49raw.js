export default {
  async fetch(request, env) {
    try {
      // 创建URL对象以解析请求地址
      const url = new URL(request.url);

      // 获取URL路径部分
      const path = url.pathname;

      // 从URL参数中获取用户提供的token
      const userToken = url.searchParams.get("nine-token");

      // 验证token是否匹配环境变量
      if (userToken !== env.NINE49TOKEN) {
        // token不匹配时重定向到百度
        return Response.redirect("https://www.baidu.com", 302);
      }

      // 构造GitHub原始文件地址
      const githubRawUrl = `https://raw.githubusercontent.com${path}`;

      // 创建带认证的请求头
      const headers = {
        Authorization: `Bearer ${env.GITHUB49TOKEN}`, // 使用GitHub令牌认证
      };

      // 向GitHub发起请求
      const response = await fetch(githubRawUrl, { headers: headers });

      // 检查响应状态码是否为成功状态
      if (!response.ok) {
        throw new Error(`GitHub请求失败: ${response.status}`);
      }

      // 直接返回GitHub的响应内容
      return response;
    } catch (error) {
      // 捕获所有异常并重定向到百度
      return Response.redirect("https://www.baidu.com", 302);
    }
  },
};
