/*************************************
项目名称：blued
blued功能脚本  悄悄查看消息  地图无需展示头像即可查看全部头像   聊天界面查看会员隐藏的距离
**************************************
[rewrite_local]
^https:\/\/social\.blued\.cn\/users\/.*\/setting url script-response-body https://raw.githubusercontent.com/Akkcho/B/refs/heads/main/blued.js
^https:\/\/social\.blued\.cn\/users\/shadow url script-response-body https://raw.githubusercontent.com/Akkcho/B/refs/heads/main/blued.js
^https:\/\/social\.blued\.cn\/users\/.*\/basi url script-response-body https://raw.githubusercontent.com/Akkcho/B/refs/heads/main/blued.js
[mitm]
hostname = *.blued.*
*************************************/
var anye = JSON.parse($response.body);
const vip1 = /^https:\/\/social\.blued\.cn\/users\/.*\/setting/;
const vip2 = /^https:\/\/social\.blued\.cn\/users\/shadow/;
const vip3 = /^https:\/\/social\.blued\.cn\/users\/.*\/basi/;
if (vip1.test($request.url) && anye.data && anye.data.length > 0) {
    // 设置
    anye.data.forEach((item) => {
        item.is_global_view_secretly = 1;
        item.is_traceless_access = 1;
        item.is_hide_distance = 1;
        item.black_allowed_count = 999999;
    })
}
if (vip2.test($request.url) && anye.data && anye.data.length > 0) {
    // 地图显示头像和影子功能
    anye.data[0].is_open_shadow = 1;
    anye.data[0].has_right = 1;
}
if (vip3.test($request.url) && anye.data && anye.data.length > 0) {

