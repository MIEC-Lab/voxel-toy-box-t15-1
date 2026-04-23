# web-backend

这是给前端网页调用的最小 FastAPI 后端。

## 1. 创建虚拟环境

```powershell
cd web-backend
python -m venv .venv
.venv\Scripts\activate
```

## 2. 安装依赖

```powershell
pip install -r requirements.txt
```

## 3. 启动服务

```powershell
uvicorn app.main:app --reload
```

默认访问地址：

- `http://127.0.0.1:8000/`
- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/api/health`
- `http://127.0.0.1:8000/api/games`
- `http://127.0.0.1:8000/api/matches/example-match`
- `http://127.0.0.1:8000/api/results/mock`
- `http://127.0.0.1:8000/api/results/mock-match-001`
- `http://127.0.0.1:8000/api/results/source/files`
- `http://127.0.0.1:8000/docs`

## 4. 当前接口说明

### `GET /`

用于确认服务已经启动。

### `GET /health`

用于健康检查。

### `GET /api/health`

用于提供给前端调用的健康检查接口。

### `POST /api/matches`

创建一场比赛。

请求示例：

```json
{
  "game": "Survivor",
  "players": ["Alice", "Bob", "Carol"],
  "rounds": 3
}
```

### `GET /api/matches/{match_id}`

按照比赛 id 返回比赛结果。

例如：

- `GET /api/matches/example-match`

### `GET /api/games`

返回当前支持的游戏列表。

### `GET /api/results/mock`

返回一份假数据，方便前端先联调页面。

### `GET /api/results/{match_id}`

按照比赛 id 返回单场比赛结果。

例如：

- `GET /api/results/mock-match-001`

### `POST /api/results/start`

创建一场假的比赛记录，方便前端先走通“发起比赛 -> 查询结果”的流程。

请求示例：

```json
{
  "game": "Survivor",
  "players": ["Alice", "Bob", "Carol"]
}
```

### `GET /api/results/source/files`

列出当前保存在 `sample-data/` 目录里的比赛结果文件 id。

## 6. 第三阶段说明

当前版本已经支持把比赛结果保存到本地 `sample-data/` 目录。

这意味着你现在有两种结果来源：

- 内存里的 mock 数据
- 本地 JSON 文件数据

你之后可以把 Arena 的输出整理成和 `sample-data/example-match.json` 一样的格式，再让前端直接读取。

## 5. 下一步你可以做什么

1. 和前端同学确认最终 JSON 字段名。
2. 新增真实比赛结果接口，比如 `GET /api/results/{match_id}`。
3. 研究如何把 `agentbeats/Arena` 的输出整理成前端需要的 JSON。
