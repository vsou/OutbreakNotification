# OutbreakNotification
各卫健委疫情通报信息统计和整理


### install

```shell
yarn install
```
由于依赖了`puppeteer`，可能需要科学上网

### build data

```sheel
yarn start
```
会生成一个`/public/data.json`文件

### deploy

.github/workflow/main.yml 会自动将public下所有文件，发布到username.github.io上面
