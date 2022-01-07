import {buildFile, getLastInfo} from "./utils.mjs";

let list = []

// 国家卫健委
list.push(getLastInfo({
    name: '国家卫健委 疫情通报',
    url: 'http://www.nhc.gov.cn/xcs/yqtb/list_gzbd.shtml',
    listReg: /<ul class="zxxx_list">\s*<li>\s*<a href="([^"]+)"[\s\S]*?title=['"]([^'"]+)['"]/i, // 匹配列表页第一项标题和链接
    contentReg: /<div class="con" id="xw_box">([\s\S]+?)<div class="fx fr">/i, // 匹配详情页面的详情内容。
}))

// 河南省卫健委
list.push(getLastInfo({
    name: '河南卫健委 疫情通报',
    url: 'http://wsjkw.henan.gov.cn/ztzl/xxgzbdfyyqfk/yqtb/',
    listReg: /<ul class="list-group listmain">\s*<li class="list-group-item">\s*<a href="([^"]+)" target="_blank">\s*([^<>]+)\s*<\/a>/i,
    contentReg: /<div id="artibody" style=" margin:0 30px; padding:10px;line-height:200%">([\s\S]+?)<\/div>/i,
}))


await buildFile(list, 'data.json')