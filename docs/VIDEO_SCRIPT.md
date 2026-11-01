# StudyQ 演示视频脚本 · Kiroween 2026

- **目标时长：** ≤ 170 秒（约 2 分 50 秒）
- **语言：** 普通话（口播）
- **画面：** 录屏 + 口播字幕可选；**不要**使用版权音乐或第三方商标素材
- **结尾露出：** 线上地址 https://study-q-mu.vercel.app · 仓库 https://github.com/dingba809/studyQ

计时按「口播 + 操作」合计；各段时长可在录制时微调，**总长不得超过 170 秒**。

---

## 0. 开场钩子（0:00–0:15 · 15s）

**画面：** 浏览器打开 https://study-q-mu.vercel.app ，首页 Notes 标签可见。

**口播：**
> 学生笔记一堆，却不知道先学什么、怎么串起来、怎么复习。StudyQ 用一条流水线：笔记 → 重点 → 知识框架 → 间隔复习。这是我给 Kiroween 2026 Frankenstein 赛道做的作品。

---

## 1. 问题与定位（0:15–0:35 · 20s）

**画面：** 停在 Notes；可短暂展示空白输入框或一段示例笔记标题。

**口播：**
> 我把大模型抽重点、树状知识框架，和 SM-2 风格闪卡拼在一起——不是三个独立工具，而是同一套学习包。没有配置 OpenAI 密钥时也能用本地 mock，方便评委离线演示。

---

## 2. 演示 · Notes（0:35–1:05 · 30s）

**画面：**
1. 切到 **Notes**
2. 粘贴一小段课堂笔记（或上传 `.txt` / `.md`）
3. 点击 **Generate study pack**
4. 等待响应完成（mock 或真实 LLM 均可）

**口播：**
> 先在 Notes 粘贴笔记，点生成学习包。接口是 `/api/generate`：有密钥走 OpenAI，没有就走启发式 mock，保证演示一定能跑通。

---

## 3. 演示 · Framework（1:05–1:35 · 30s）

**画面：**
1. 切到 **Framework**
2. 展开/折叠概念树若干节点
3. 扫一眼 key points 列表

**口播：**
> Framework 里是可折叠的概念树和关键点列表，帮学生看见知识结构，而不只是零散条目。生成内容尽量锚定在刚才那份笔记上。

---

## 4. 演示 · Review（1:35–2:05 · 30s）

**画面：**
1. 切到 **Review**
2. 翻开一张卡，看正反面
3. 点 Again / Hard / Good / Easy 之一
4. （可选）刷新页面，说明数据还在

**口播：**
> Review 用 SM-2 风格间隔复习。打分后进度记在浏览器 localStorage，刷新也不丢——MVP 没有数据库，方便一键部署。

---

## 5. Kiro 构建痕迹（2:05–2:25 · 20s）

**画面：** 切到 GitHub 仓库或本地编辑器，展示仓库根目录 `.kiro/`（steering、specs/study-core、hooks），勿泄露密钥。

**口播：**
> 项目用 Kiro CLI 做 steering、EARS 规格和保存时类型检查 hook。`.kiro` 进了 git，方便评委核对。详情见仓库里的 `docs/KIRO_USAGE.md`。

---

## 6. 线上地址与行动号召（2:25–2:50 · 25s）

**画面：** 再次打开 https://study-q-mu.vercel.app ；可叠字幕显示仓库链接与 #KiroweenHackathon26。

**口播：**
> 线上演示：study-q-mu.vercel.app。代码开源在 GitHub dingba809/studyQ，MIT 协议。我是 Bo Zhou，单人参赛 Frankenstein。欢迎试玩，也欢迎关注 Kiroween 2026——用 Kiro 把想法缝成能跑的产品。谢谢。

---

## 录制检查清单

- [ ] 总时长 ≤ 170 秒
- [ ] 三个标签都有实操画面：Notes → Framework → Review
- [ ] 露出 live URL 与（可选）GitHub
- [ ] 提到 `.kiro` / Kiro CLI，不虚构未使用的功能（IDE / Crew / MCP 等）
- [ ] 无版权音乐、无未授权商标特写
- [ ] 上传 YouTube 后设为 **公开**（需用户 CONFIRM，本脚本不替代发布确认）

## 计时汇总

| 段 | 时长 |
|----|------|
| 钩子 | 15s |
| 问题与定位 | 20s |
| Notes | 30s |
| Framework | 30s |
| Review | 30s |
| Kiro 痕迹 | 20s |
| CTA | 25s |
| **合计** | **170s** |
