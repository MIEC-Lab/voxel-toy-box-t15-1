# SocialCOMPACT Web API Contract V1

适用日期：2026-04-27
适用范围：`frontend`、`web-backend`、部署联调、答辩演示
状态：冻结版。除非组长确认，组员不要私自修改字段名。

## 1. 统一原则

本项目对外接口统一采用：

- 路径：`/api/...`
- JSON 字段名：`snake_case`
- 比赛唯一标识：创建比赛返回 `id`，查询结果返回 `match_id`
- 回合日志字段：`round_logs`

说明：

- `POST /api/matches` 返回的 `id` 和 `GET /api/results/{match_id}` 使用的 `match_id` 表示同一个比赛。
- 当前主线代码已经采用 `snake_case`，后续不要再单独改成 `camelCase`。

## 2. 必须稳定的接口

最终可交版本必须稳定支持：

```http
GET /api/health
POST /api/matches
GET /api/results/{match_id}
```

可选辅助接口：

```http
GET /api/games
GET /api/results/mock
GET /api/results/source/files
```

## 3. GET /api/health

成功返回：

```json
{
  "status": "ok",
  "service": "web-backend",
  "version": "0.1.0"
}
```

字段说明：

- `status`：后端健康状态，目前固定为 `ok`
- `service`：服务名称，目前固定为 `web-backend`
- `version`：后端版本号，当前为 `0.1.0`

## 4. POST /api/matches

请求体：

```json
{
  "game": "Survivor",
  "players": ["Player 1", "Player 2", "Player 3", "Player 4", "Player 5", "Player 6"],
  "rounds": 10,
  "player_urls": [
    "http://127.0.0.1:9018",
    "http://127.0.0.1:9019"
  ],
  "use_arena": false
}
```

字段说明：

- `game`：目前统一使用 `Survivor`
- `players`：玩家名称数组
- `rounds`：最大回合数
- `player_urls`：Agent 服务地址数组
- `use_arena`：是否启用真实 Arena 模式

规则：

- `use_arena` 为 `false` 时，后端必须能返回本地模拟结果。
- `use_arena` 为 `true` 时，后端可以尝试调用 Arena 和 Agent。
- 如果 Arena 不可用，后端允许回退到 `local-fallback`。

成功返回：

```json
{
  "id": "survivor-001",
  "game": "Survivor",
  "rounds": 10,
  "player_count": 6,
  "status": "completed",
  "message": "Local match simulation completed successfully.",
  "source": "local-simulation",
  "result": {
    "match_id": "survivor-001",
    "game": "Survivor",
    "rounds": 10,
    "winner": "Player 3",
    "players": [
      {
        "name": "Player 3",
        "score": 9,
        "status": "winner"
      }
    ],
    "summary": "Player 3 survived to the end.",
    "source": "local-simulation",
    "status": "completed",
    "round_logs": []
  }
}
```

## 5. GET /api/results/{match_id}

成功返回：

```json
{
  "match_id": "survivor-001",
  "game": "Survivor",
  "rounds": 10,
  "winner": "Player 3",
  "players": [
    {
      "name": "Player 1",
      "score": 4,
      "status": "eliminated"
    },
    {
      "name": "Player 3",
      "score": 9,
      "status": "winner"
    }
  ],
  "summary": "Player 3 survived to the end.",
  "source": "local-simulation",
  "status": "completed",
  "round_logs": [
    {
      "round": 1,
      "events": [
        "Player 1 formed a temporary alliance with Player 3."
      ],
      "remaining_players": ["Player 1", "Player 3"]
    }
  ]
}
```

## 6. 固定字段取值

`status` 允许值：

- `running`
- `completed`
- `failed`

`source` 允许值：

- `local-simulation`
- `local-fallback`
- `arena`
- `sample-data`

玩家 `status` 允许值：

- `winner`
- `alive`
- `finished`
- `eliminated`
- `running`
- `failed`

## 7. 页面和接口对应关系

首页 `/`：

- 不直接创建比赛
- 负责项目介绍和入口跳转

开始页 `/start`：

- 调用 `POST /api/matches`
- 成功后跳转到 `/results?matchId=...`

结果页 `/results?matchId=...`：

- 调用 `GET /api/results/{match_id}`
- 展示 winner、scoreboard、source、status、round timeline

## 8. 成员约定

- B：开始页只能按本规范发送请求。
- C：结果页总览只能按本规范读取结果。
- D：回合可视化统一读取 `round_logs`。
- E：后端返回必须遵守本规范。
- F：部署联调时按本规范验收。
- A：组长负责确认是否允许修改接口字段。

## 9. 冻结规则

从 V1 开始，接口路径、字段名、`source` 取值、`status` 取值、`round_logs` 结构都视为冻结。

如果确实需要修改，必须先同步全组，然后一次性改前端、后端和文档。
