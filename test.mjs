import {buildFile, getLastInfo} from "./utils.mjs";

let list = [
    getLastInfo({
        name: '国家卫健委 疫情通报',
        browserGet: true,
        listCheckSelector:'.banner', // 使用无界浏览器采集时，以此作为页面加载完成的标志
        contentCheckSelector:'.banner',
        listSelector: 'body', // 使用无界浏览器时，以此作为采集的选择器盒子
        contentSelector: 'body',
        url: 'http://www.nhc.gov.cn/xcs/yqtb/list_gzbd.shtml',
        listReg: /<ul class="zxxx_list">\s*<li>\s*<a href="([^"]+)"[\s\S]*?title=['"]([^'"]+)['"]/i, // 匹配列表页第一项标题和链接
        contentReg: /<div class="con" id="xw_box">([\s\S]+?)<div class="fx fr">/i, // 匹配详情页面的详情内容。
        timeReg: /<span>发布时间：\s*([^<>\s]+)\s*<\/span>/i, // 发布时间匹配
    }),

    getLastInfo({
        name: '北京市卫健委 疫情通报',
        url: 'http://wjw.beijing.gov.cn/xwzx_20031/rdxws/',
        listReg: /<div class="weinei_left_con_line_text">\s*<a href="([^"]+)"[^<>]*>\s*([^<>]*确诊[^<>]*?)[\s\t\r]*<\/a>/i,
        contentReg: /<div class="view TRS_UEDITOR trs_paper_default trs_word trs_key4format">([\s\S]+?)<\/div>/i,
        timeReg: /发布日期：([^<>：]+)/
    }),

    getLastInfo({
        name: '上海市卫健委 疫情通报',
        url: 'https://wsjkw.sh.gov.cn/xwfb/index.html',
        listReg: /<ul class="uli16 nowrapli list-date ">\s*<li>\s*<a href="([^"]+)"[^<>]*>\s*([^<>]*新冠[^<>]*?)[\s\t\r]*<\/a>/i,
        contentReg: /<div id="ivs_content" class="Article_content">([\s\S]+?)<\/div>/i,
        timeReg: /<small id="ivs_date" class="Article-time">\s*[（(]?\s*([^<>()（）]+)\s*[)）]?\s*<\/small>/
    }),
    getLastInfo({
        name: '天津市卫健委 疫情通报',
        url: 'http://wsjk.tj.gov.cn/XWZX6600/newyqfkdt/',

        listReg: /<a href=['"]([^'"]+)['"][^<>]*>\s*(\d+年\d+月\d+日[^<>]*?)[\s\t\r]*<\/a>/i,
        contentReg: /<div class="view TRS_UEDITOR trs_paper_default trs_web">([\s\S]+?)<\/div>/i,
        timeReg: /<div class="page_time">发布日期：([\s\S]+?)<\/div>/
    }),

    getLastInfo({
        name: '河南省卫健委 疫情通报',
        url: 'http://wsjkw.henan.gov.cn/ztzl/xxgzbdfyyqfk/yqtb/',
        listReg: /<ul class="list-group listmain">\s*<li class="list-group-item">\s*<a href="([^"]+)" target="_blank">\s*([^<>]+)\s*<\/a>/i,
        contentReg: /<div id="artibody" style=" margin:0 30px; padding:10px;line-height:200%">([\s\S]+?)<\/div>/i,
        timeReg: /\s*时间：([^\s<>：]+)\s*<span id="divResulta">/
    }),

    getLastInfo({
        name: '陕西省卫健委 疫情通报',
        url: 'http://sxwjw.shaanxi.gov.cn/sy/wjyw/',
        listReg: /<ul class="cm-news-list gl-news-list">\s*<li class="clearfix">\s*<a href="([^"]+)" target="_blank" title="([^"]*?确诊病例[^"]*)"/i,
        contentReg: /<div class="view TRS_UEDITOR trs_paper_default trs_word">([\s\S]+?)<\/div>/i,
        timeReg: /<span class="cm-con">\s*([^<>]+)\s*<\/span>/
    }),

    getLastInfo({
        name: '广东省卫健委 疫情通报',
        url: 'http://wsjkw.gd.gov.cn/zwyw_yqxx/index.html',
        listReg: /<div class="section list">\s*[\s\S]*?<a href="([^"]+)" title="(\d{4}年\d+月\d+日[^"]+)\s*"/i,
        contentReg: /<div class="content-content">([\s\S]+?)<\/div>/i,
        timeReg: /<span class="cm-con">发布日期：\s*([^<>]+)\s*<\/span>/
    })
]
await buildFile(list, './public/data.json')