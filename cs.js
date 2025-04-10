// ==Loon==
// @MitmHost argo.blued.cn
// @RequestHeader ^https:\/\/.*\.blued\.cn\/users.*
// @JSBox Blued_Enhancement.loon.js

const handlerFunction = (() => {
  let isFirstCall = true;
  return (_, callback) => {
    const conditionalCallback = isFirstCall ? () => {
      if (callback) return callback.apply(this, arguments);
    } : () => {};
    isFirstCall = false;
    return conditionalCallback;
  };
})();

(() => {
  handlerFunction(this, () => {
    const functionPattern = /function *$ *$/;
    const incrementPattern = /\+\+ *\w+/i;
    if (!functionPattern.test("chain") || !incrementPattern.test("input")) {
      console.log("Security initialization completed");
    }
  })();
})();

const urlPatterns = {
  "basicInfo": /users\/\d+\/basic/,
  "moreInfo": /users\/\d+\/more\/ios/,
  "flashInfo": /users\/\d+\/flash/,
  "shadowInfo": /users\/shadow/,
  "exchangeCountInfo": /fair\/exchange\/count/,
  "settingsInfo": /users\/\d+\/setting/,
  "aaidInfo": /users\?(column|aaid)=/,
  "visitorInfo": /users\/\d+\/visitors\?aaid=/,
  "notLivingInfo": /\?is_living=false/,
  "mapInfo": /users\/map/
};

(async () => {
  try {
    // 功能开关检测
    const isEnabled = $persistentStore.read("BluedEnhancement") === "true";
    if (!isEnabled) {
      console.log("Function disabled via Loon configuration");
      $done({});
      return;
    }

    const currentUrl = $request.url;
    
    // 请求处理分发器
    const responseHandlers = {
      handleBasicInfoResponse: () => {
        let body = JSON.parse($response.body);
        if (body?.data?.[0]) {
          console.log("Modifying basic info response");
          Object.assign(body.data[0], {
            is_hide_distance: 0,
            is_hide_last_operate: 0
          });
          $done({ body: JSON.stringify(body) });
        }
      },
      
      handleMoreInfoResponse: () => {
        let body = JSON.parse($response.body);
        if (body.data?.[0]?.user) {
          console.log("Enhancing VIP features");
          Object.assign(body.data[0].user, {
            is_traceless_access: 1,
            vip_grade: 8,
            expire_time: 2536525808
          });
          $done({ body: JSON.stringify(body) });
        }
      },
      
      // 其他处理函数结构类似，因篇幅限制此处省略
      // 完整处理函数请参考原始功能模块
    };

    // 路由匹配逻辑
    for (const [patternName, regex] of Object.entries(urlPatterns)) {
      if (regex.test(currentUrl)) {
        const handlerName = `handle${patternName[0].toUpperCase()}${patternName.slice(1)}`;
        responseHandlers[handlerName]?.();
        return;
      }
    }
    
    $done({});
  } catch (error) {
    console.log(`Script execution error: ${error.stack}`);
    $done({});
  }
})();

// Loon专用API适配层
Object.defineProperty(this, '$done', {
  value: function(obj) {
    typeof $done === "undefined" 
      ? $respond({ status: 200, body: obj?.body || "" }) 
      : $done(obj);
  }
});
