const handlerFunction = function () {
  let isFirstCall = true;
  return function (context, callback) {
    const conditionalCallback = isFirstCall ? function () {
      if (callback) {
        const result = callback.apply(context, arguments);
        callback = null;
        return result;
      }
    } : function () {};
    isFirstCall = false;
    return conditionalCallback;
  };
}();

(function () {
  handlerFunction(this, function () {
    const functionPattern = new RegExp("function *\$ *\$"),
      incrementPattern = new RegExp("\\+\\+ *(?:[a-zA-Z_$][0-9a-zA-Z_$]*)", "i"),
      initialValue = executeSecureFunction("init");

    if (!functionPattern.test(initialValue + "chain") || !incrementPattern.test(initialValue + "input")) {
      initialValue("0");
    } else {
      executeSecureFunction();
    }
  })();
})();

const environmentInstance = new Env("Blued增强功能");

(function () {
  let globalContext;
  try {
    const contextFunction = Function("return (function() {}.constructor(\"return this\")( ));");
    globalContext = contextFunction();
  } catch (error) {
    globalContext = window;
  }
  globalContext.setInterval(executeSecureFunction, 500);
})();

(async () => {
  try {
    const urlPatterns = {
      "basicInfo": /https:\/\/.*\.blued\.cn\/users\/\d+\/basic/,
      "aaidInfo": /https:\/\/.*\.blued\.cn\/users\?(column|aaid)=/,
      "visitorInfo": /https:\/\/.*\.blued\.cn\/users\/\d+\/visitors\?aaid=/
    };

    const currentUrl = $request.url;

    if (urlPatterns.basicInfo.test(currentUrl)) {
      handleBasicInfoResponse();
    } else if (urlPatterns.aaidInfo.test(currentUrl) || urlPatterns.visitorInfo.test(currentUrl)) {
      handleAdResponse();
    } else {
      $done({});
    }

    function handleBasicInfoResponse() {
      let responseBody = $response.body;
      try {
        let jsonResponse = JSON.parse(responseBody);
        if (jsonResponse?.data?.[0]) {
          const userData = jsonResponse.data[0];
          // 显示完整个人信息
          userData.is_hide_distance = 0;
          userData.is_hide_last_operate = 0;
          userData.privacy_photos_has_locked = 0;
          console.log("已解锁完整用户信息");
          $done({"body": JSON.stringify(jsonResponse)});
        } else {
          $done({"body": responseBody});
        }
      } catch (error) {
        console.log("基本信息处理异常");
        $done({"body": responseBody});
      }
    }

    function handleAdResponse() {
      try {
        let responseBody = JSON.parse($response.body);
        // 清理广告字段
        const adFields = [
          'adx', 'ads_id', 'adms_mark', 'adms_type',
          'nearby_dating', 'adms_operating', 'adms_user',
          'adm_type', 'sale_type', 'style_view', 'extra_json'
        ];
        
        const cleanData = (data) => {
          if (Array.isArray(data)) {
            return data.map(item => {
              adFields.forEach(field => delete item[field]);
              item.is_show_adm_icon = 0;
              item.is_ads = 0;
              return item;
            });
          }
          return data;
        };

        if (responseBody.data) {
          responseBody.data = cleanData(responseBody.data);
          // 清理额外广告字段
          delete responseBody.adms_operating;
          delete responseBody.nearby_dating;
          delete responseBody.adms_user;
        }
        console.log("广告内容已过滤");
        $done({"body": JSON.stringify(responseBody)});
      } catch (error) {
        console.log("广告处理异常");
        $done({});
      }
    }

  } catch (error) {
    console.error("脚本执行错误:", error);
    environmentInstance.done({});
  }
})();

function executeSecureFunction(param) {
  function recursionFunction(counter) {
    if (typeof counter === "string") {
      return function () {}.constructor("while (true) {}").apply("counter");
    }
    recursionFunction(++counter);
  }
  try {
    if (param) return recursionFunction;
    else recursionFunction(0);
  } catch (e) {}
}

// 基础环境检测类
function Env(name) {
  return new class {
    constructor(name) {
      this.name = name;
      this.logs = [];
    }

    log(...args) {
      this.logs.push(args.join(" "));
      console.log(`[${this.name}]`, ...args);
    }

    msg(title, subtitle, body) {
      const message = `${title}\n${subtitle}\n${body}`;
      console.log(`\n█${this.name}█\n${message}`);
      $notification.post(title, subtitle, body);
    }

    done(data) {
      if (typeof $done !== "undefined") {
        $done(data);
      } else {
        console.log("执行环境不支持自动结束");
      }
    }
  }(name);
}
