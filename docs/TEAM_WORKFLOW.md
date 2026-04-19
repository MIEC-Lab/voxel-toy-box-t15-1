# SocialCOMPACT 团队协作说明书

这份文档是你们 6 人小组的统一协作约定，建议直接发到群里，所有人都按同一套规则执行。

## 1. 核心规则

1. 全组共用一个 GitHub 仓库。
2. 每个人都使用自己的 GitHub 账号和自己的本地电脑开发。
3. 不允许把功能代码直接推到 `main` 分支。
4. 真实 API key 只保存在各自本地的 `.env` 文件中，绝不上传。
5. 每个功能都在独立分支开发，并通过 Pull Request 合并。

## 2. 仓库初始化

### 第一步：确定谁来创建或管理 GitHub 仓库

推荐两种做法：

- 如果现在这个仓库能把所有成员都加进去，就继续使用当前仓库。
- 如果想完全由你们小组自己管理，就新建一个小组仓库，并把原仓库作为参考上游。

### 第二步：组长把队友加入仓库

组长需要在 GitHub 上这样操作：

1. 打开仓库主页。
2. 点击 `Settings`。
3. 点击 `Collaborators and teams`。
4. 输入另外 5 位同学的 GitHub 用户名并发送邀请。

### 第三步：每位同学都克隆仓库到自己电脑

```bash
git clone <仓库地址>
cd SocialCOMPACT
```

## 3. 环境变量文件规则

### 可以上传的内容

- `.env.example`
- 环境变量说明文档

### 绝对不要上传的内容

- `.env`
- 真实 API key
- 本地缓存目录，例如 `__pycache__`、`.venv`

### 每位同学的本地配置方式

每个人都应该先复制示例文件：

```bash
cp agentbeats/Agent/.env.example agentbeats/Agent/.env
```

然后把下面这些字段改成自己的本地值：

- `PLATFORM`
- `MODEL`
- `API_KEY`

如果你们使用 Windows PowerShell，可以这样复制：

```powershell
Copy-Item agentbeats\Agent\.env.example agentbeats\Agent\.env
```

## 4. 分支规则

`main` 是稳定分支，只放能正常运行的版本。

每个成员都要为自己的任务建立一个功能分支。

分支命名示例：

- `feat/frontend-home`
- `feat/frontend-visualization`
- `feat/backend-api`
- `feat/backend-results`
- `feat/deploy-docker`
- `docs/report-and-demo`

如果担心撞名，可以加上自己的名字：

- `feat/frontend-home-zhangsan`

## 5. 每日开发流程

每位同学每天都按同一套流程操作。

### 开始工作前

```bash
git checkout main
git pull origin main
git checkout -b feat/your-task-name
```

如果这个分支已经存在，就这样：

```bash
git checkout feat/your-task-name
git pull origin main
```

### 开发过程中

- 只修改自己负责的模块。
- 如果必须修改公共文件，先在群里说一声。
- 每次提交尽量小而清晰，不要一口气改太多东西。

### 保存开发进度

```bash
git add .
git commit -m "Implement match results API"
git push -u origin feat/your-task-name
```

### 合并回主分支

1. 打开 GitHub。
2. 从自己的分支向 `main` 发起 Pull Request。
3. 请一位队友或组长先 review。
4. Review 后再合并。

## 6. 如何同步团队进度

你们最好把 GitHub 的这三个功能一起用起来。

### A. Issues

每一个任务都建成一个 issue。

例如：

- `搭建 Next.js 前端`
- `编写 FastAPI 网页后端`
- `把 Arena 日志转换成前端 JSON`
- `增加 Docker Compose 本地启动`
- `编写部署说明`

### B. Project 看板

创建一个 GitHub Project，看板至少分成 4 列：

- `Todo`
- `In Progress`
- `Review`
- `Done`

每个 issue 都要放到看板里。

### C. Pull Requests

每做完一个任务，就发一个 Pull Request。

这样全组都能清楚看到：

- 谁改了什么
- 哪些代码已经可以合并
- 哪些内容还需要测试

## 7. 推荐的 6 人分工

### 第 1 人：组长 / 集成负责人

- 管理 issue 和截止时间
- 检查 Pull Request
- 合并已完成代码
- 保持 `main` 分支稳定

### 第 2 人：后端 API 负责人

- 建立 `web-backend/`
- 编写启动比赛和读取比赛结果的 HTTP 接口

### 第 3 人：后端数据处理负责人

- 把 Arena 的输出整理成前端容易展示的 JSON
- 准备样例比赛数据

### 第 4 人：前端页面负责人

- 做首页
- 做开始比赛页面
- 做结果页面骨架

### 第 5 人：前端可视化负责人

- 展示玩家状态
- 展示回合时间线
- 展示聊天、预测、行动和最终结果

### 第 6 人：部署 / 测试 / 文档负责人

- 编写 `docker-compose.yml`
- 测试本地启动流程
- 协助上线部署
- 编写 README 和演示说明

## 8. 防止冲突的规则

- 不要让多个人同时改同一个文件，除非提前协调好。
- 前后端要先约定好 JSON 数据格式，再分别开发。
- 修改公共配置之前，先在群里通知。
- 每天开始前先从 `main` 拉最新代码。

## 9. 如果有人不小心上传了 API key

立刻做下面 4 件事：

1. 从仓库中删除这个密钥文件或内容。
2. 去对应平台重新生成或重置 API key。
3. 检查 `.gitignore` 是否正确。
4. 提交修复后的代码。

如果这个密钥已经进入 GitHub 历史记录，就默认它已经不安全，必须更换。

## 10. 这个项目的最小安全开发流程

对你们这个项目，最简单也最安全的流程是：

1. 保留现有 Python 游戏逻辑。
2. 新增前端目录。
3. 新增网页后端目录。
4. 先用样例 JSON 做前端页面，保证前后端可以并行。
5. 等前端和后端骨架都完成后，再接入真实 Arena。
6. 本地跑通后再做线上部署。

## 11. 每个人应该怎么和 Codex 配合

推荐做法：

- 每位同学在自己的本地项目里和 Codex 单独对话
- 每位同学只问自己负责的模块
- 组长单独保留一个对话，用来处理集成、联调和整体问题
