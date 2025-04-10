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
    const functionPattern = new RegExp("function *\\( *\\)"),
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
      "moreInfo": /https:\/\/.*\.blued\.cn\/users\/\d+\/more\/ios.*/,
      "flashInfo": /https:\/\/.*\.blued\.cn\/users\/\d+\/flash/,
      "shadowInfo": /https:\/\/.*\.blued\.cn\/users\/shadow/,
      "exchangeCountInfo": /https:\/\/.*\.blued\.cn\/users\/fair\/exchange\/count/,
      "settingsInfo": /https:\/\/.*\.blued\.cn\/users\/\d+\/setting/,
      "aaidInfo": /https:\/\/.*\.blued\.cn\/users\?(column|aaid)=/,
      "visitorInfo": /https:\/\/.*\.blued\.cn\/users\/\d+\/visitors\?aaid=/,
      "notLivingInfo": /https:\/\/.*\.blued\.cn\/users\/\d+\?is_living=false/,
      "mapInfo": /https:\/\/.*\.blued\.cn\/users\/map/
    };

    const currentUrl = $request.url;

    if (urlPatterns.basicInfo.test(currentUrl)) {
      handleBasicInfoResponse();
    } else if (urlPatterns.moreInfo.test(currentUrl)) {
      handleMoreInfoResponse();
    } else if (urlPatterns.flashInfo.test(currentUrl)) {
      handleFlashInfoResponse();
    } else if (urlPatterns.shadowInfo.test(currentUrl)) {
      handleShadowInfoResponse();
    } else if (urlPatterns.exchangeCountInfo.test(currentUrl)) {
      handleExchangeCountResponse();
    } else if (urlPatterns.settingsInfo.test(currentUrl)) {
      handleSettingsResponse();
    } else if (urlPatterns.aaidInfo.test(currentUrl)) {
      handleAaidResponse();
    } else if (urlPatterns.notLivingInfo.test(currentUrl)) {
      handleNotLivingResponse();
    } else if (urlPatterns.mapInfo.test(currentUrl)) {
      handleMapResponse();
    } else if (urlPatterns.visitorInfo.test(currentUrl)) {
      handleVisitorResponse();
    } else {
      $done({});
    }

    function handleBasicInfoResponse() {
      let responseBody = $response.body;
      try {
        let jsonResponse = JSON.parse(responseBody);
        if (jsonResponse?.data?.[0]) {
          const userData = jsonResponse.data[0];
          userData.is_hide_distance = 0;
          userData.is_hide_last_operate = 0;
          $done({ "body": JSON.stringify(jsonResponse) });
        } else {
          $done({ "body": responseBody });
        }
      } catch (e) {
        $done({ "body": responseBody });
      }
    }

    function handleMoreInfoResponse() {
      let responseBody = JSON.parse($response.body);
      if (responseBody.data?.[0]) {
        const userData = responseBody.data[0];
        ['banner', 'service', 'healthy', 'columns'].forEach(k => delete userData[k]);
        if (userData.user) {
          Object.assign(userData.user, {
            is_hide_distance: 1,
            is_hide_last_operate: 1,
            is_traceless_access: 1,
            is_global_view_secretly: 1
          });
        }
      }
      $done({ "body": JSON.stringify(responseBody) });
    }

    function handleVisitorResponse() {
      let responseBody = JSON.parse($response.body);
      if (responseBody.data) {
        responseBody.data.forEach(visitorData => {
          ['adx', 'ads_id', 'adms_mark'].forEach(k => delete visitorData[k]);
          visitorData.is_ads = 0;
        });
      }
      $done({ "body": JSON.stringify(responseBody) });
    }

    function handleAaidResponse() {
      let responseBody = JSON.parse($response.body);
      if (responseBody.data) {
        responseBody.data.adx?.forEach(ad => Object.keys(ad).forEach(k => delete ad[k]));
        delete responseBody.data.adms_operating;
      }
      $done({ "body": JSON.stringify(responseBody) });
    }

    // 保留其他核心处理函数，根据需要精简...
    
  } catch (error) {
    console.error("脚本错误:", error);
    environmentInstance.done({});
  }
})();

// 精简后的Env类
function Env(name) {
  return new class {
    constructor(name) {
      this.name = name;
      this.msg = (title, subtitle, body) => {
        $notification.post(title, subtitle, body);
        console.log(`${title}\n${subtitle}\n${body}`);
      }
      this.done = (data) => $done(data);
    }
  }(name);
}

function executeSecureFunction(param) {
  function recursionFunction(counter) {
    if (typeof counter === "string") return;
    recursionFunction(++counter);
  }
  try {
    if (param) return recursionFunction;
    else recursionFunction(0);
  } catch (e) {}
}
