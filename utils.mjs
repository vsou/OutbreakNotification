import URL from 'url'
import https from 'https'
import http from 'http'
import path from 'path'
import fs from 'fs'

export const action = async (options) => {
    if (!options.encoding) {
        options.encoding = 'utf-8'
    }
    options.method = options?.method?.toUpperCase() || 'GET'
    return new Promise(resolve => {
        let urlObj = URL.parse(options.url)
        let proxy = options.proxy ? URL.parse(options.proxy) : {};
        let query = getQueryFormat(urlObj.query)
        query = {
            ...query,
            ...options.query,
        }
        if (options.method === 'GET') {
            query = {
                ...query,
                ...options.data
            }
        }
        const queryString = getQueryString(query)
        let requestOptions = {
            hostname: proxy.hostname ? proxy.hostname : urlObj.hostname,
            port: proxy.port ? proxy.port : (urlObj.protocol === 'https:' ? 443 : (urlObj.port || 80)),
            path: options.url,
            method: options.method,
            rejectUnauthorized: false,
            requestCert: true,
            headers: {
                // 'Accept-Encoding': 'gzip, deflate',
                // 'Content-Type': 'Application/json',
                Referer: options.url,
                Host: urlObj.hostname,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
                ...options.headers,
            }
        }
        if (options.method === 'GET' || queryString.length > 0) {
            requestOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            requestOptions.headers['Content-Length'] = queryString.length;
        }
        let req = (urlObj.protocol === 'https:' ? https : http).request(requestOptions, response => {
            let result = response.headers['content-type'];
            let headers = response.headers;
            let encoding = 'utf-8';
            if (result) {
                result = result.match(/charset=([^;\s,]+)/);
                if (result) {
                    encoding = result[1];
                }
            }
            let body = []
            response.on('data', chunk => {
                body.push(chunk)
            })
            response.on('end', () => {
                body = Buffer.concat(body);
                body = body.toString()
                resolve({
                    data: {
                        body,
                        headers,
                        ...response,
                        options,
                    },
                    error: null
                });
            })
        })
        req.write(options.method === 'GET' ? queryString : getQueryString(options.data))
        req.on('error', error => {
            console.log('response on error', error)
            resolve({
                data: {},
                error,
            })
        })
    })
}


export const getQueryFormat = (queryString) => {
    if (queryString) {
        let o = {}
        queryString.match(/([^=&?]+=[^=&?]*)/ig)?.map(i => {
            let result = i.match(/([^=&?]+)=([^&?]*)/i)
            o[result[1]] = result[2]
        })
        return o
    } else {
        return {}
    }
}

export const getQueryString = (queryObj) => {
    let list = []
    for (let i in queryObj) {
        if (queryObj.hasOwnProperty(i)) {
            list.push(`${i}=${encodeURIComponent(queryObj[i])}`)
        }
    }
    return list.join('&')
}

export const getLastInfo = function (opt) {
    const {name, sort, url, listReg, contentReg, timeReg} = opt;
    return action({
        url,
    }).then(({data: {body: listBody}}) => {
        let resultList = listBody.match(listReg)
        let obj = {
            name,
            sort,
            parentUrl: url,
            updateTime: new Date().getTime()
        }
        if (listBody.includes(`setTimeout("location.replace(location.href.split(\\"#\\")[0])",2000);`)) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    getLastInfo(opt).then(resolve).catch(reject)
                }, 1000)
            })
        }
        if (!resultList) {
            console.log('没有匹配到列表')
            return obj;
        }
        obj.url = URL.resolve(url, resultList[1])
        obj.title = resultList[2].replace(/·/g, '')
        return action({
            url: obj.url
        }).then(({data: {body: contentBody}}) => {
            if (contentBody) {
                contentBody = contentBody.replace(/<table>[\s\S]+?<\/table>/ig, '')
                let contentResult = contentBody.match(contentReg)
                let time = contentBody.match(timeReg)
                if (contentResult) {
                    let c = contentResult[1]
                    c = c.replace(/<span[^<>]*>|<\/span>|\s*<br\s*\/?>\s*|\s*style="[^"]*"/ig, '')
                    c = c.replace(/\s*<p>(\s|&ensp;|&emsp;)*<\/p>\s*/ig, '')
                    c = c.replace(/\s*<section>(\s|&ensp;|&emsp;)*<\/section>\s*/ig, '')
                    c = c.trim()
                    let contentList = c.match(/<p[^<>]*>([\s\S]+?)<\/p>/ig)
                    if (contentList) {
                        contentList = contentList.map(item => item.match(/<p[^<>]*>([\s\S]+?)<\/p>/i)[1].trim())
                    } else {
                        contentList = c.match(/<section[^<>]*>([\s\S]+?)<\/section>/ig)
                        if (contentList) {
                            contentList = contentList.map(item => item.match(/<section[^<>]*>([\s\S]+?)<\/section>/i)[1].trim())
                        } else {
                            contentList = [c]
                        }
                    }
                    obj.content = contentList
                    if (obj.content.length > 5) {
                        obj.content = obj.content.splice(0, 4)
                        obj.content.push(`<a href="${obj.url}" target="_blank">更多信息直接访问卫健委官网🔗</a>`)
                    }
                    let firstLine = obj.content[0].replace(/（[^（）]{1,2}）|其中|来自/g, '')
                    obj.tags = firstLine.match(/([^,\s，。（）()；、含]*)(\d+)例([^,\s，。（）()；、含]*)/g) || [];
                    obj.tags = obj.tags.map((item, index) => {

                        // 清除正则未匹配到的多余数据
                        item = item.replace(/其中|来自/g, '')
                        item = item.replace(/和新疆/g, '新疆')

                        if (/本土|境外|疑似|无症状/.test(item) && index !== 0 && index !== obj.tags.length - 1) {
                            return '<br/>' + item
                        } else {
                            return item;
                        }
                    }) || []

                } else {
                    console.log('没有匹配到详情')
                }

                if (time) {
                    obj.releaseTime = time[1].trim().replace(/<br\s*\/>|\n/g, '')
                }
            } else {
                console.log('内容为空')
            }
            return obj
        })
    }).catch(e => {
        console.log(e)
    })
}

export const buildFile = (list, dataPath, toPath) => {
    return Promise.all(list).then(res => {
        let oldPath = path.resolve(dataPath)
        let oldFile = [];
        let file = res.filter(item => item !== undefined)
            .sort((a, b) => a.sort - b.sort)

        if (fs.existsSync(oldPath)) {
            oldFile = JSON.parse(fs.readFileSync(oldPath, {encoding: 'utf-8'}));
            file.forEach(item => {
                let index = oldFile.findIndex(o => o.name === item.name)
                if (index > -1) {
                    if (item.content) {
                        oldFile[index] = item;
                    }
                } else {
                    oldFile.push(item)
                }
            })
        } else {
            oldFile = file;
        }

        fs.writeFileSync(oldPath, JSON.stringify(oldFile, null, 4), {encoding: 'utf-8'})

        if (toPath) {
            let filePath = path.resolve(toPath)
            file = oldFile.map(item => {
                return `## [${item.name}](${item.parentUrl})\n#### ${item.title ? `[${item.title}](${item.url})` : ''}\n${item.content.map(sub => `\n- ${sub}`)}`
            }).join('\n\n----\n\n')

            file += '\n\n----\n\n\n ### 服务与帮助\n\n如果你想添加你所在的城市信息，请在issues里提供卫健委的官网链接，最好是疫情通报的页面链接'
            fs.writeFileSync(filePath, file, {encoding: 'utf-8'})
            console.log('已更新 index.md')
        }
    })
}