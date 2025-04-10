const handlerFunction = (() => {
  let isFirstCall = true;
  return (context, callback) => {
    const conditionalCallback = isFirstCall ? function() {
      callback?.apply(context, arguments);
      callback = null;
    } : () => {};
    isFirstCall = false;
    return conditionalCallback;
  };
})();

(() => {
  handlerFunction(this, () => {
    const functionPattern = /function\s*\(/;
    const incrementPattern = /\+\+\s*\w+/i;
    try {
      if (!functionPattern.test(executeSecureFunction.toString()) || 
          !incrementPattern.test(executeSecureFunction.toString())) {
        executeSecureFunction();
      }
    } catch (e) {}
  });
})();

const environmentInstance = new Env("Blued增强功能");

(() => {
  let global = typeof $task !== "undefined" ? $task : typeof $httpClient !== "undefined" ? $httpClient : null;
  if (global) global.setInterval(executeSecureFunction, 500);
})();

(async () => {
  try {
    const urlPatterns = {
      basicInfo: /users\/\d+\/basic/,
      moreInfo: /users\/\d+\/more\/ios/,
      flashInfo: /users\/\d+\/flash/,
      shadowInfo: /users\/shadow/,
      exchangeCount: /fair\/exchange\/count/,
      settings: /users\/\d+\/setting/,
      aaidInfo: /users\?(column|aaid)=/,
      visitorInfo: /users\/\d+\/visitors/,
      notLiving: /\?is_living=false/,
      mapInfo: /users\/map/
    };

    const currentUrl = $request.url;
    const body = $response.body;

    switch (true) {
      case urlPatterns.basicInfo.test(currentUrl):
        handleBasicInfo(body);
        break;
      case urlPatterns.moreInfo.test(currentUrl):
        handleMoreInfo(body);
        break;
      case urlPatterns.flashInfo.test(currentUrl):
        handleFlashInfo(body);
        break;
      case urlPatterns.shadowInfo.test(currentUrl):
        handleShadowInfo(body);
        break;
      case urlPatterns.exchangeCount.test(currentUrl):
        handleExchangeCount(body);
        break;
      case urlPatterns.settings.test(currentUrl):
        handleSettings(body);
        break;
      case urlPatterns.aaidInfo.test(currentUrl):
        handleAaidInfo(body);
        break;
      case urlPatterns.visitorInfo.test(currentUrl):
        handleVisitorInfo(body);
        break;
      case urlPatterns.notLiving.test(currentUrl):
        handleNotLiving(body);
        break;
      case urlPatterns.mapInfo.test(currentUrl):
        handleMapInfo(body);
        break;
      default:
        $done({});
    }

    function handleBasicInfo(body) {
      try {
        const data = JSON.parse(body);
        if (data?.data?.[0]) {
          data.data[0].is_hide_distance = 0;
          data.data[0].is_hide_last_operate = 0;
          $done({ body: JSON.stringify(data) });
          return;
        }
      } catch (e) {}
      $done({ body });
    }

    function handleMoreInfo(body) {
      try {
        const data = JSON.parse(body);
        if (data?.data?.[0]) {
          const user = data.data[0].user;
          if (user) {
            user.is_hide_distance = 1;
            user.is_hide_last_operate = 1;
            user.is_traceless_access = 1;
            user.is_global_view_secretly = 1;
          }
          ['banner', 'service', 'healthy'].forEach(k => delete data.data[0][k]);
          $done({ body: JSON.stringify(data) });
          return;
        }
      } catch (e) {}
      $done({ body });
    }

    function handleShadowInfo(body) {
      try {
        const data = JSON.parse(body);
        if (data?.data?.[0]) {
          data.data[0].is_open_shadow = 1;
          data.data[0].has_right = 1;
          $done({ body: JSON.stringify(data) });
          return;
        }
      } catch (e) {}
      $done({ body });
    }

    function handleAaidInfo(body) {
      try {
        const data = JSON.parse(body);
        if (data.data?.adx) {
          data.data.adx = [];
        }
        ['adms_operating', 'nearby_dating'].forEach(k => delete data.data[k]);
        $done({ body: JSON.stringify(data) });
      } catch (e) {
        $done({ body });
      }
    }

    function handleVisitorInfo(body) {
      try {
        const data = JSON.parse(body);
        if (data.data) {
          data.data.forEach(item => {
            ['adx', 'ads_id'].forEach(k => delete item[k]);
            item.is_ads = 0;
          });
          $done({ body: JSON.stringify(data) });
          return;
        }
      } catch (e) {}
      $done({ body });
    }

    // 其他处理函数保持类似结构...

  } catch (error) {
    console.log(`处理错误: ${error}`);
    $done({});
  }
})();

function Env(name) {
  return new class {
    constructor(name) {
      this.name = name;
      this.msg = (title, subtitle, body) => {
        $notification.post(title, subtitle, body);
        console.log(`${title} - ${subtitle}\n${body}`);
      }
      this.done = $done;
      this.get = (options, callback) => {
        if (typeof options === "string") options = { url: options };
        options.headers = options.headers || {};
        $httpClient.get(options, callback);
      }
      this.post = (options, callback) => {
        if (typeof options === "string") options = { url: options };
        options.headers = options.headers || {};
        $httpClient.post(options, callback);
      }
    }
  }(name);
}

function executeSecureFunction(param) {
  try {
    const dummy = new Function('return (function(){}).constructor');
    if (dummy() !== Function) return;
  } catch (e) {
    return;
  }
}
