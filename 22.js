class HTTPRequest {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
    this.isMute = config.isMute || false;
    this.isMuteLog = config.isMuteLog || false;
    this.logs = [];
    this.startTime = new Date().getTime();
    this.logLevel = config.logLevel || 'info';
    this.logLevels = { debug: 0, info: 1, warn: 2, error: 3 };
    this.logLevelPrefixs = { debug: '[DEBUG]', info: '[INFO]', warn: '[WARN]', error: '[ERROR]' };
    this.logSeparator = '\n';
  }

  // 发送 POST 请求
  post(request, callback = () => {}) {
    const method = request.method ? request.method.toLocaleLowerCase() : "post"; // 获取请求方法
    switch (this.getEnv()) {
      case "Node.js":
        let iconv = require("iconv-lite"); // 引入 iconv-lite 模块
        this.initGotEnv(request); // 初始化 Got 环境
        const { url, ...options } = request; // 获取请求配置
        this.got[method](url, options).then(response => {
          const { statusCode: status, statusCode: responseStatus, headers: responseHeaders, rawBody: rawBody } = response,
            body = iconv.decode(rawBody, this.encoding); // 解码
          callback(null, {
            status: status,
            statusCode: responseStatus,
            headers: responseHeaders,
            rawBody: rawBody,
            body: body
          }, body); // 返回结果
        }, error => {
          const { message: errorMessage, response: responseObject } = error;
          callback(errorMessage, responseObject, responseObject && iconv.decode(responseObject.rawBody, this.encoding)); // 返回错误结果
        });
        break;
      case "Surge":
      case "Loon":
      case "Stash":
      case "Shadowrocket":
        $httpClient[method](request, (error, response, body) => {
          !error && response && (response.body = body, response.statusCode = response.status ? response.status : response.statusCode, response.status = response.statusCode);
          callback(error, response, body); // 返回结果
        });
        break;
      case "Quantumult X":
        request.method = method; // 设置请求方法
        $task.fetch(request).then(response => {
          const { statusCode: status, statusCode: responseStatus, headers: responseHeaders, body: responseBody, bodyBytes: bodyBytes } = response;
          callback(null, {
            status: status,
            statusCode: responseStatus,
            headers: responseHeaders,
            body: responseBody,
            bodyBytes: bodyBytes
          }, responseBody); // 返回结果
        }, error => callback(error && error.error || "UndefinedError")); // 捕获错误返回
        break;
    }
  }

  // 时间格式化
  time(format, date = null) {
    const currentDate = date ? new Date(date) : new Date(); // 获取当前日期
    let dateComponents = {
      "M+": currentDate.getMonth() + 1,
      "d+": currentDate.getDate(),
      "H+": currentDate.getHours(),
      "m+": currentDate.getMinutes(),
      "s+": currentDate.getSeconds(),
      "q+": Math.floor((currentDate.getMonth() + 3) / 3),
      S: currentDate.getMilliseconds()
    };
    /(y+)/.test(format) && (format = format.replace(RegExp.$1, (currentDate.getFullYear() + "").substr(4 - RegExp.$1.length))); // 年处理
    for (let key in dateComponents) new RegExp("(" + key + ")").test(format) && (format = format.replace(RegExp.$1, 1 == RegExp.$1.length ? dateComponents[key] : ("00" + dateComponents[key]).substr(("" + dateComponents[key]).length))); // 替换组件
    return format; // 返回格式化的字符串
  }

  // 将对象转换为查询字符串
  queryStr(params) {
    let queryString = "";
    for (const key in params) {
      let value = params[key]; // 遍历参数
      null != value && "" !== value && ("object" == typeof value && (value = JSON.stringify(value)), queryString += `${key}=${value}&`); // 拼接查询字符串
    }
    queryString = queryString.substring(0, queryString.length - 1); // 去掉末尾的 & 
    return queryString; // 返回查询字符串
  }

  // 发送通知
  msg(title = this.name, content = "", url = "", options = {}) {
    const formatMsg = msgConfig => {
      const { $open: openUrl, $copy: copyContent, $media: mediaUrl, $mediaMime: mediaMime } = msgConfig;
      switch (typeof msgConfig) {
        case undefined:
          return msgConfig; // 返回原始消息
        case "string":
          return {
            url: msgConfig // 返回 URL
          };
        case "object":
          {
            const result = {};
            let url = msgConfig.openUrl || msgConfig.url || msgConfig["open-url"] || openUrl;
            url && Object.assign(result, { action: "open-url", url: url }); // 设置打开 URL
            let copy = msgConfig["update-pasteboard"] || msgConfig.updatePasteboard || content;
            copy && Object.assign(result, { action: "clipboard", text: copy });
            if (mediaUrl) {
              let mediaData, mediaBase64, mediaType;
              if (mediaUrl.startsWith("http")) mediaData = mediaUrl;
              else if (mediaUrl.startsWith("data:")) {
                const [mediaType] = mediaUrl.split(";");
                const [, base64Content] = mediaUrl.split(",");
                mediaBase64 = base64Content;
                mediaType = mediaType.replace("data:", "");
              } else {
                mediaBase64 = mediaUrl;
                mediaType = (content => {
                  const mediaTypes = {
                    JVBERi0: "application/pdf",
                    R0lGODdh: "image/gif",
                    R0lGODlh: "image/gif",
                    iVBORw0KGgo: "image/png",
                    "/9j/": "image/jpg"
                  };
                  for (var key in mediaTypes) if (0 === content.indexOf(key)) return mediaTypes[key];
                  return null;
                })(mediaUrl);
              }
              Object.assign(result, {
                "media-url": mediaData,
                "media-base64": mediaBase64,
                "media-base64-mime": mediaMime ?? mediaType
              });
            }
            Object.assign(result, {
              "auto-dismiss": msgConfig["auto-dismiss"],
              sound: msgConfig.sound
            });
            return result;
          }
      }
    };

    // 如果不是静音状态，则发送通知
    if (!this.isMute) {
      switch (this.getEnv()) {
        case "Surge":
        case "Loon":
        case "Stash":
        case "Shadowrocket":
        default:
          $notification.post(title, content, url, formatMsg(options)); // 发送通知
          break;
        case "Quantumult X":
          $notify(title, content, url, formatMsg(options)); // 发送通知
          break;
      }
    }

    // 如果不是静音日志，则记录日志
    if (!this.isMuteLog) {
      let logContent = ["", "==============📣系统通知📣=============="];
      logContent.push(title);
      content && logContent.push(content);
      url && logContent.push(url);
      console.log(logContent.join("\n"));
      this.logs = this.logs.concat(logContent);
    }
  }

  // 等待某段时间
  wait(timeout) {
    return new Promise(resolve => setTimeout(resolve, timeout));
  }

  // 完成处理
  done(data = {}) {
    const elapsedTime = (new Date().getTime() - this.startTime) / 1000;
    switch (this.getEnv()) {
      case "Node.js":
        process.exit(1); // Node.js 强制退出
        break;
      case "Surge":
      case "Loon":
      case "Stash":
      case "Shadowrocket":
      case "Quantumult X":
      default:
        $done(data); // 完成处理并返回数据
        break;
    }
  }

  // 获取当前运行环境
  getEnv() {
    if (typeof $httpClient !== "undefined") return "Surge";
    if (typeof $task !== "undefined") return "Quantumult X";
    if (typeof $notification !== "undefined") return "Loon";
    if (typeof process !== "undefined") return "Node.js";
    return "Unknown";
  }
}

// 示例使用
const request = new HTTPRequest("Example", { isMute: false });
request.msg("Test Title", "This is a test message.", "http://example.com");
